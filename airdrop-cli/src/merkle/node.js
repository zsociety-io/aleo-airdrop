import { hashToField } from '../aleo/index.js'


export class Node {
  constructor(left, right) {
    this.left = left;
    this.right = right;
  }

  get plaintext() {
    return `[${this.left.hash}, ${this.right.hash}]`;
  }

  get hash() {
    return hashToField(this.plaintext);
  }
}