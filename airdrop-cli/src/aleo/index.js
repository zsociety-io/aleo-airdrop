const process = {
  env: {
    NETWORK: "testnet"
  }
}


import "../fetch.js";
import { PrivateKey, Plaintext } from '@demox-labs/aleo-sdk';



export const snarkvmNetworks = {
  mainnet: "MainnetV0",
  testnet: "TestnetV0",
  canary: "CanaryV0",
}


export const commitToField = (value, randomizer) => {
  return Plaintext.fromString(
    snarkvmNetworks?.[process.env.NETWORK],
    value
  ).commitBhp256(randomizer);
};


export const hashToField = (value) => {
  return Plaintext.fromString(
    snarkvmNetworks?.[process.env.NETWORK],
    value
  ).hashBhp256();
};

