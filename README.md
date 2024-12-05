# Aleo Privacy Preserving Airdrop

This project leverages merkle trees to create privacy preserving airdrops on the Aleo blockchain.

## Installation

```bash
cd airdrop-cli
npm install
```

## Usage

Replace the placeholder data at `airdrop-cli/data/airdrop.csv` with your airdrop data.

###

### Create a new airdrop project

```bash
npm run create-airdrop <AIRDROP_DATA_PATH> <PROJECT_ID> <TOKEN_ID>
```

SnarkOS command to create the airdrop project will be displayed as well as the merkle root for your project.

### Claim a airdrop

```bash
npm run claim-airdrop <AIRDROP_DATA_PATH> <MERKLE_ROOT> <PROJECT_ID> <TOKEN_ID> <RECIPIENT>
```

SnarkOS command to give to the user to claim their airdrop project will be displayed. Those same arguments can be passed to wallet adapter on the frontend instead for instance.
