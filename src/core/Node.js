"use strict";

import objectPath from "object-path";

import { cloneDeep, calcExpression } from "./utils.js";
import { NODE_TYPE, CONTROL_TYPE, TRIGGER_TYPE } from "./types.js";

class Node {
  constructor({ runtime, cache }, name, node, handler) {
    this.runtime = runtime;
    this.cache = cache;

    /**
     * stateMap.nodes 对应字段
     */
    this.name = name;
    this.node = node;
    this.handler = handler;
    this.props = node.props || {};
    this.nodeType = node.nodeType.toLowerCase();

    /**
     * handler: 根据节点类型，初始化处理函数
     * trigger: 节点触发条件，主要是 join
     * register: 节点内缓存，主要是 join
     */
    this._setHandler();
    this._setTrigger();
    this._setRegister();
  }

  _setHandler() {
    const setFnName = {
      [NODE_TYPE.ACTIVITY_NODE]: "_setActivityNodeHandler",
      [NODE_TYPE.CONTROL_NODE]: "_setControlNodeHandler",
      [NODE_TYPE.CUSTOM_NODE]: "_setCustomNodeHandler"
    }[this.nodeType];

    if (!setFnName) {
      throw new Error(`unknown node type: ${this.nodeType}`);
    }

    this[setFnName]();
  }

  _setActivityNodeHandler() {}

  _setControlNodeHandler() {
    if (this.node.controlType !== CONTROL_TYPE.JOIN) return this.handler = null;
    const joinHandler = function() {
      return this.trigger.result.reduce(
        (accumulator, nodeName) => (accumulator[nodeName] = this.cache.getFlowInfo(nodeName), accumulator), {}
      );
    };
    this.handler = joinHandler.bind(this);
  }

  _setCustomNodeHandler() {
    const handler = this.node.handler || "";
    this.handler = ({ context, props, flowInfo, executor }) => new Function("context", "props", "flowInfo", "executor", handler)(context, props, flowInfo, executor);
  }

  _setTrigger() {
    this.trigger = cloneDeep(this.node.trigger || null);
  }

  _setRegister() {
    this.register = {};
  }

  getName() {
    return this.name;
  }

  /**
   * 递归函数，用于实时计算属性值
   * @param {*} executor 
   * @param {*} props 
   */
  getProps(executor, props = this.props) {
    return Object.keys(props)
      .map(key => {
        let prop = props[key];
        typeof prop !== "object" && (prop = { format: "custom", value: prop });

        const { format, value } = prop;
        if (format === "custom") {
          if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
              return { [key]: Object.values(this.getProps(executor, value)) };
            }
            return { [key]: this.getProps(executor, value) };
          }

          return { [key]: value };
        }

        if (format === "variable") {
          return { [key]: calcExpression(value)(this.runtime, executor) };
        }
      })
      .reduce((accumulator, currentValue) => Object.assign(accumulator, currentValue), {});
  }

  /**
   * 用于判断当前节点是否可执行
   * @param {*} mId 
   * @param {*} prevNode 
   */
  can(mId, prevNode) {
    if (!this.trigger) return true;

    const prevNodeName = prevNode.getName();
    objectPath.set(this.register, `${mId}.${prevNodeName}`, true);
    const visitMap = objectPath.get(this.register, `${mId}`)
    const nodeNames = Object.keys(visitMap).filter(nodeName => visitMap[nodeName]);

    const satisfyAll = this.trigger.type === TRIGGER_TYPE.ALL && nodeNames.length === this.trigger.on.length;
    const satisfyRace = this.trigger.type === TRIGGER_TYPE.RACE && nodeNames.length === 1;
    if (satisfyAll || satisfyRace) {
      this.trigger.result = nodeNames;
      return true;
    }
    return false;
  }

  getHandler() {
    return this.handler;
  }
}

export default Node;
