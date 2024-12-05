import { Tree, Leaf } from "./merkle/index.js"
import { csvToJSON } from "./utils/csv.js";
import { rootDir } from "./utils/path.js";

import fsExists from 'fs.promises.exists';
import fs from 'fs.promises';


const usage = "Usage: npm run create-airdrop <AIRDROP_DATA_PATH> <PROJECT_ID> <TOKEN_ID>";

const csvPathArg = process.argv[2];
const projectId = process.argv[3];
const tokenId = process.argv[4];

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

const csvContent = await fs.readFile(csvPath, "utf-8")
const airdropData = csvToJSON(csvContent);
const depth = 32;
const tree = new Tree(depth);
const programId = "token_registry_airdrop_32b.aleo";

let totalAmount = BigInt("0");

for (const { recipient, amount, randomizer } of airdropData) {
  totalAmount += BigInt(amount);
  tree.add(
    new Leaf(
      projectId,
      recipient,
      amount,
      randomizer
    )
  );
}

const merkleRoot = tree.root;

console.log(`Merkle tree root: '${merkleRoot}'.`)


console.log(`
Command to execute:

snarkos developer execute \\
  --private-key $PRIVATE_KEY \\
  --query $NODE_URL \\
  --broadcast "$NODE_URL/mainnet/transaction/broadcast" \\
  --network 0 \\
  ${programId} \\
  create_airdrop_project \\
  ${projectId} \\
  ${tokenId} \\
  ${merkleRoot} \\
  ${totalAmount}u128
`)


