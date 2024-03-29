// import { CustomInspectFunction, InspectOptions } from "util";
import { Rule, isRuleChar, isRuleEnd, isRuleRange, isRuleRef, } from "../types.js";
import { buildRuleStack, } from "./build-rule-stack.js";
import 'colors';
const customInspectSymbol = Symbol.for('nodejs.util.inspect.custom');

class Node {
  rule: Rule;
  _next = new Map<number, Node>();
  _pointers = new Set<Pointer>();
  stackId: number;
  pathId: number;
  stepId: number;
  graph: Graph;
  constructor(graph: Graph, stack: Rule[][], stackId: number, pathId: number, stepId: number) {
    this.graph = graph;
    this.stackId = stackId;
    this.pathId = pathId;
    this.stepId = stepId;
    this.rule = stack[pathId][stepId];

    if (stack[pathId][stepId + 1]) {
      this._next.set(pathId, new Node(graph, stack, stackId, pathId, stepId + 1));
    }
  }

  set pointer(pointer: Pointer) {
    if (this._pointers.has(pointer)) {
      throw new Error('This node already has a reference to this pointer');
    }
    this._pointers.add(pointer);
  }

  deletePointer(pointer: Pointer) {
    if (!this._pointers.has(pointer)) {
      throw new Error('This node does not have a reference to this pointer');
    }
    this._pointers.delete(pointer);
  }

  print = (pointers: Set<Pointer>, showPosition = false): string => {
    // [customInspectSymbol](depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction) {
    const rule = this.rule;

    const parts: (string | number)[] = [];
    if (showPosition) {
      parts.push('{'.blue, `${[this.stepId,].join('-')}`.cyan + `}`.blue);
    }
    // const parts: (string | number)[] = showPosition ? [`${[this.pathId, this.stepId,].join('-')}`.underline + `|`.gray,] : [];
    if (isRuleChar(rule)) {
      parts.push('['.gray + rule.value.map(v => String.fromCharCode(v)).join('').yellow + ']'.gray);
    } else if (isRuleRange(rule)) {
      parts.push('['.gray + rule.value.map(range => range.map(v => String.fromCharCode(v).yellow).join('-').gray).join('') + ']'.gray);
    } else if (isRuleRef(rule)) {
      parts.push('REF('.gray + `${rule.value}`.green + ')'.gray);
    } else {
      parts.push(rule.type.yellow);
    }

    for (const pointer of pointers) {
      if (pointer.node === this) {
        parts.push('*'.red);
        if (!!pointer.parent) {
          parts.push('p'.red);
        }
      }
    }
    return [parts.join(''), ...Array.from(this._next.values()).map(node => node.print(pointers, showPosition)),].join('->'.gray);
  };

  * rules(): IterableIterator<Rule> {
    if (isRuleRef(this.rule)) {
      yield this.rule;
    } else {
      yield this.rule;
    }
  }

  * nextNodes(): IterableIterator<{ node: Node; parent?: Node; }> {
    // for (const node of fetchNodes(this.graph, rootNode)) {
    //   // upon creation, we create pointers that point to the current _non-reference_ rule
    //   this.pointers.add(new Pointer(this, node));
    // }
    // console.log('call to next, on', this.stackId, this.pathId, this.stepId, this._next.size)
    // console.log('next', next.stackId, next.pathId, next.stepId)
    for (const node of this._next.values()) {
      // console.log('whats on deck', node.rule);
      if (isRuleRef(node.rule)) {
        // console.log('rule ref!')
        // console.log('rule ref!');
        // TODO: Can this be simplified
        const referencedNode: RootNode = this.graph.getRootNode(node.rule.value);
        for (const nextNode of referencedNode.nodes.values()) {
          // console.log('next node!', nextNode)
          yield { node: nextNode, parent: node, };
        }
        // } else if (isRuleEnd(node.rule)) {
        //   console.log(this.graph)
        //   console.log('ending rule!', node.stackId, node.pathId, node.stepId);
        //   yield node;
      } else {
        yield { node, };
      }
      // yield node;
    }

  }
}

class RootNode {
  stackId: number;
  nodes = new Map<number, Node>();
  graph: Graph;
  constructor(graph: Graph, stack: Rule[][], stackId: number) {
    this.graph = graph;
    this.stackId = stackId;
    // console.log(stackId, 'stack', stack);
    for (let pathId = 0; pathId < stack.length; pathId++) {
      this.nodes.set(pathId, new Node(graph, stack, stackId, pathId, 0));
    }
  }

  print = (pointers: Set<Pointer>, showPosition = false): string => {
    const nodes = Array.from(this.nodes.values()).map(node => {
      return '  ' + node.print(pointers, showPosition);
    });
    return ` (`.blue + `${this.stackId}`.gray + `)\n`.blue + nodes.join('\n');
  };
}

// function* getNodes(stackedRules: Rule[][][], stackPos: number): IterableIterator<Node> {
//   // console.log('getNodes', stackedRules[stackPos], stackPos);
//   for (let pathPos = 0; pathPos < stackedRules[stackPos].length; pathPos++) {
//     const rule = stackedRules[stackPos][pathPos][0];
//     if (isRuleRef(rule)) {
//       for (const node of getNodes(stackedRules, rule.value)) {
//         yield node;
//       }
//       // } else if (isRuleEnd(rule)) {
//       //   for (const node of getNodes(stackedRules, rule.value)) {
//       //     yield node;
//       //   }
//     } else {
//       yield new Node(stackedRules, stackPos, pathPos);
//     }
//   }
// }

// // generator that yields either the node, or if a reference rule, the referenced node
// function* fetchNextNodesForNode(graph: Graph, node: Node): IterableIterator<Node> {
//   for (const node of node.next) {
//     if (isRuleRef(node.rule)) {
//       // TODO: Can this be simplified
//       const referencedNode = graph.getRootNode(node.rule.value);
//       for (const nextNode of fetchNextNodesForNode(graph, referencedNode)) {
//         yield nextNode;
//       }
//     } else {
//       yield node;
//     }
//   }
// }
// generator that yields either the node, or if a reference rule, the referenced node
function* fetchNodesForRootNode(graph: Graph, rootNode: RootNode, parent?: Node): IterableIterator<{ node: Node; parent?: Node; }> {
  for (const node of rootNode.nodes.values()) {
    if (isRuleRef(node.rule)) {
      // TODO: Can this be simplified
      const referencedNode = graph.getRootNode(node.rule.value);
      for (const { node: nextNode, parent: prevParent, } of fetchNodesForRootNode(graph, referencedNode, node)) {
        yield { node: nextNode, parent: prevParent, };
      }
    } else {
      yield { node, parent, };
    }
  }
}
export class Graph {
  roots = new Map<number, RootNode>();
  // _rules = new Map<string, Rule>();
  pointers = new Set<Pointer>();


  getRootNode(stackId: number) {
    return this.roots.get(stackId);
  }

  constructor(ruleDefs: Rule[][], rootId: number) {
    const stackedRules: Rule[][][] = ruleDefs.map(buildRuleStack);
    for (let stackId = 0; stackId < stackedRules.length; stackId++) {
      const stack = stackedRules[stackId];
      this.roots.set(stackId, new RootNode(this, stack, stackId));
    }

    const rootNode = this.roots.get(rootId);
    // returns a list of nodes, _not_ root nodes
    for (const { node, parent, } of fetchNodesForRootNode(this, rootNode)) {
      // console.log('parent', parent)
      this.pointers.add(new Pointer(this, node, parent));
    }
  }

  [customInspectSymbol](
    // depth: number, inspectOptions: InspectOptions, inspect: CustomInspectFunction
  ) {
    const roots = Array.from(this.roots.values());
    const graphView = roots.reduce<string[]>((acc, rootNode) => {
      return acc.concat(rootNode.print(this.pointers, true));
    }, []);
    return `\n${graphView.join('\n')}`;
  }

  rules(): Rule[] {
    // console.log('call to rules')
    const rules: Rule[] = [];
    // console.log(Array.from(this.pointers).length)
    for (const pointer of this.pointers) {
      rules.push(pointer.rule);
    }
    // console.log('rules!', rules)
    return rules;
  }
  // * rules(): IterableIterator<Rule> {
  //   for (const pointer of this.pointers) {
  //     for (const rule of pointer.rules()) {
  //       yield rule;
  //     }
  //   }
  // }

  *[Symbol.iterator](): IterableIterator<{ pointer: Pointer; rule: Rule; }> {
    const pointers = Array.from(this.pointers);
    const seen = new Set<Node>();
    for (const pointer of pointers) {
      if (!seen.has(pointer.node)) {
        seen.add(pointer.node);
        const rule = pointer.rule;
        // const { rule, } = pointer.node;
        if (isRuleRef(rule)) {
          // this.delete(position);
          // this.addReferenceRule(rule, position);
        } else if (isRuleEnd(rule)) {
          // if (position.previous) {
          //   this.delete(position);
          //   for (const { stackPos, pathPos, rulePos, previous, } of position.previous) {
          //     this.addPosition(position.depth, stackPos, pathPos, rulePos, previous);
          //   }
          // } else {
          //   yield { rule, position, };
          // }
        } else {
          yield { pointer, rule, };
        }
      }
    }


    console.log('---------------');
    console.log('graph, right before incrementing pointers', this);
    // increment all remaining pointers to their next _non-reference_ rule
    const remainingPointers = Array.from(this.pointers);
    for (const pointer of remainingPointers) {
      // console.log(pointer.node.rule)
      // console.log('pointer', pointer.node.pathId, pointer.node.stepId)
      Pointer.delete(this.pointers, pointer);
      // console.log('delete the pointer')
      // const nextNodes = Array.from(pointer.nextNodes());
      // console.log('next nodes', nextNodes);
      for (const { node: next, parent, } of pointer.nextNodes()) {
        console.log('parent', !!parent);
        // console.log('next', next.print(this.pointers));
        this.pointers.add(new Pointer(this, next, parent));
      }
    }
    console.log('graph, right after incrementing pointers', this);
    console.log('---------------');
    // console.log('I would expect _three_ pointers', this.pointers.size);
  };
}


class Pointer {
  _node: Node;
  graph: Graph;
  parent?: Node;

  constructor(graph: Graph, node: Node, parent?: Node) {
    this.graph = graph;
    this._node = node;
    this.parent = parent;
  }

  get node() {
    return this._node;
  }
  set node(node: Node) {
    // remove the old node's pointer reference
    this.node.deletePointer(this);

    // point to the new node and update the pointer reference
    this._node = node;
    node.pointer = this;
  }

  * nextNodes(): IterableIterator<{ node: Node; parent?: Node; }> {
    for (const { node, parent, } of this.node.nextNodes()) {
      // console.log('node rule', JSON.stringify(node.rule), 'parent', !!parent);
      if (isRuleEnd(node.rule)) {
        // console.log(this.graph);
        // console.log('ending rule!', node.stackId, node.pathId, node.stepId);
        if (this.parent) {
          for (const { node: next, } of this.parent.nextNodes()) {
            yield { node: next, };
          }
        } else {
          yield { node, };
        }
      } else {
        yield { node, parent: parent || this.parent, };
      }
    }
  }

  get rule() {
    return this.node.rule;
  }

  set valid(valid: boolean) {
    if (!valid) {
      this.graph.pointers.delete(this);
    }
  }

  static delete(pointers: Set<Pointer>, pointer: Pointer) {
    // console.log('delete this pointer', pointer)
    pointers.delete(pointer);
    try {
      pointer.node.deletePointer(pointer);
    } catch (err) { }
  }
}
