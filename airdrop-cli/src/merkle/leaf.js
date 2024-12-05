import { commitToField, hashToField } from '../aleo/index.js'


export class Leaf {
  constructor(
    project_id,
    recipient,
    amount,
    randomizer
  ) {
    this.project_id = project_id;
    this.recipient = recipient;
    this.amount = amount;
    this.randomizer = randomizer;
  }

  get plaintext() {
    return `{
      project_id: ${this.project_id},
      recipient: ${this.recipient},
      amount: ${this.amount}u128
    }`;
  }

  get commit() {
    let plaintext_hash = hashToField(this.plaintext);
    return commitToField(plaintext_hash, this.randomizer);
  }

  get hash() {
    return this.commit;
  }
}

