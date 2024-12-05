

import { Node } from "./node.js";
import { Leaf } from "./leaf.js";
export { Node, Leaf };


const get_null_roots = (depth) => {
  const null_leaf_hash = "0field";
  const null_leaf = { hash: null_leaf_hash };
  const null_roots = [null_leaf_hash];
  let node = null_leaf;
  for (let i = 0; i < depth; i++) {
    const new_node = new Node(node, node);
    const node_hash = new_node.hash;
    null_roots.push(node_hash);
    node = { hash: node_hash };
  }
  return null_roots;
}


export class Tree {
  constructor(depth, leaves) {
    this.depth = depth;
    this.leaves = leaves == null ? [] : leaves;
    this.null_roots = get_null_roots(depth);
    this.max_size = 2 ** depth;
  }

  add(leave) {
    if (this.leaves.length > this.max_size) {
      throw new Error(`Too much data.`)
    }
    this.leaves.push(leave);
  }

  get root() {
    if (!this.leaves.length) {
      return this.null_roots[this.depth];
    }
    if (!this.depth) {
      const leaf = this.leaves[0];
      return leaf.commit;;
    }
    let right = null;
    const edge_index = 2 ** (this.depth - 1);
    if (this.leaves.length <= edge_index) {
      right = { hash: this.null_roots[this.depth - 1] };
    } else {
      const right_leaves = this.leaves.slice(edge_index, this.leaves.length);
      right = new Tree(this.depth - 1, right_leaves);
    }
    const left_leaves = this.leaves.slice(0, edge_index);
    const left = new Tree(this.depth - 1, left_leaves);
    const node = new Node({ hash: left.hash }, { hash: right.hash });
    return node.hash;
  }

  get hash() {
    return this.root;
  }

  path(leave_index) {
    if (this.depth === 0) {
      return [];
    }
    const edge_index = 2 ** (this.depth - 1);
    const right_leaves = this.leaves.slice(edge_index, this.leaves.length);
    const right_tree = new Tree(this.depth - 1, right_leaves);
    const left_leaves = this.leaves.slice(0, edge_index);
    const left_tree = new Tree(this.depth - 1, left_leaves);

    let opposite_tree = null;
    let leave_tree = null;
    let new_leave_index = null;

    if (leave_index < edge_index) {
      opposite_tree = right_tree;
      leave_tree = left_tree;
      new_leave_index = leave_index;
    } else {
      opposite_tree = left_tree;
      leave_tree = right_tree;
      new_leave_index = leave_index - edge_index;
    }
    const opposite_root = opposite_tree.hash;
    return leave_tree.path(new_leave_index).concat([opposite_root]);
  }
}