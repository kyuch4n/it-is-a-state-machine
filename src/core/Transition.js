"use strict";

import { NODE_TYPE, CONTROL_TYPE } from "./types.js";
import { isString, isStringArray, createIterator, calcExpression } from "./utils.js";

class Transition {
  constructor({ runtime, nodes, flow, executor }) {
    this.runtime = runtime;
    this.nodes = nodes;
    this.flow = flow;
    this.executor = executor;
  }

  isJoin(nodeName) {
    const node = this.nodes[nodeName];
    const controlType = node.controlType;
    return controlType === CONTROL_TYPE.JOIN;
  }

  isParallel(nodeName) {
    const node = this.nodes[nodeName];
    const controlType = node.controlType;
    return controlType === CONTROL_TYPE.PARALLEL;
  }

  /**
   * 获取后续节点的名称
   * @param {*} nodeName 
   */
  transit(nodeName) {
    const nodeNames = this.flow[nodeName];

    if (!nodeNames) return [];
    if (isString(nodeNames)) return [nodeNames];
    if (isStringArray(nodeNames)) return nodeNames;

    const iNodeNames = createIterator([].concat(nodeNames));
    while (iNodeNames.hasNext()) {
      const {
        value: { condition, next }
      } = iNodeNames.next();

      if (!condition && !iNodeNames.hasNext()) return [next];
      if (calcExpression(condition)(this.runtime, this.executor)) return [next];
    }
    return [];
  }
}

export default Transition;
