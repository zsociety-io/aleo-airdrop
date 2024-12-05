import { Tree, Leaf, Node } from "./merkle/index.js"
import { csvToJSON } from "./utils/csv.js";
import { rootDir } from "./utils/path.js";

import { commitToField, hashToField } from './aleo/index.js'
import fsExists from 'fs.promises.exists';

import fs from 'fs.promises';


const usage = "Usage: npm run claim-airdrop <AIRDROP_DATA_PATH> <MERKLE_ROOT> <PROJECT_ID> <TOKEN_ID> <RECIPIENT>";

const csvPathArg = process.argv[2];
const merkleRoot = process.argv[3];
const projectId = process.argv[4];
const tokenId = process.argv[5];
const recipient = process.argv[6];

const csvPath = `${rootDir}/${csvPathArg}`;

if (csvPathArg == null || !await fsExists(csvPath)) {
  throw new Error(`Unable to locate airdrop data csv file.\n${usage}`);
}
if (projectId == null) {
  throw new Error(`No Project ID provided.\n${usage}`);
}
if (tokenId == null) {
  throw new Error(`No token ID provided.\n${usage}`);
}
if (recipient == null) {
  throw new Error(`No recipient address provided.\n${usage}`);
}

const csvContent = await fs.readFile(csvPath, "utf-8")
const airdropData = csvToJSON(csvContent);
const depth = 32;
const tree = new Tree(depth);
const programId = "token_registry_airdrop_32b.aleo";

const airdrops = {};

for (const [index, { recipient, amount, randomizer }] of airdropData.entries()) {
  airdrops[recipient] = { amount, randomizer, index };
  tree.add(
    new Leaf(
      projectId,
      recipient,
      amount,
      randomizer
    )
  );
}

const airdrop = airdrops?.[recipient];
if (airdrop == null) {
  throw new Error("Recipient not found in airdrop data.")
}

const { amount, randomizer, index } = airdrop;

const leafPath = tree.path(recipient);

console.log(`
Command to execute:

snarkos developer execute \\
  --private-key $PRIVATE_KEY \\
  --query $NODE_URL \\
  --broadcast "$NODE_URL/mainnet/transaction/broadcast" \\
  --network 0 \\
  ${programId} \\
  claim_airdrop \\
  ${projectId} \\
  ${tokenId} \\
  ${merkleRoot} \\
  ${randomizer} \\
  ${amount}u128 \\
  ${index}u32 \\
  "${leafPath}"
`)

