"use strict";

import shortId from "shortid";

import { MACHINE_STATUS } from "./types.js";
import { createProxy, fn2Promise, timeoutPromise } from "./utils.js";

import Node from "./Node.js";
import Cache from "./Cache.js";
import Transition from "./Transition.js";

class Machine {
  constructor(runtime, stateMap, handlers, share = {}) {
    /**
     * runtime: 运行时(组件上下文)
     * stateMap: 状态流转的 Map(包含节点信息、流转方向、运行入口)
     * handlers: 活动节点执行函数
     */
    this.runtime = runtime;
    this.stateMap = stateMap;
    this.nodes = stateMap.nodes;
    this.flowEntry = stateMap.flowEntry;
    this.flow = stateMap.flow;
    this.handlers = handlers;

    /**
     * stack: 状态机 Id 栈
     * cache: 所有状态机实例公用的 cache
     * prevNode: 前一个节点实例
     * flowInfo: 上一个节点的流转信息
     */
    this.stack = share.stack || [];
    this.cache = share.cache || new Cache();
    this.prevNode = share.prevNode || null;
    this.flowInfo = share.flowInfo || null;

    /**
     * mId: 当前机器的 Id
     * currNode: 当前正在执行的节点实例
     * executor: 状态机 Public API
     * transition: 流转类，主要用于获取后续节点
     */
    this.mId = this.stack.pop() || shortId.generate();
    this.status = MACHINE_STATUS.PENDING;
    this.currNode = null;
    this.executor = {};
    this.transition = new Transition(this);

    this._created()
  }

  /**
   * machine 生命周期
   */
  _created() {
    this.cache.addMachine(this.mId, this);
  }

  /**
   * execute 生命周期
   * @param {*} nodeName 
   */
  _beforeExecute(nodeName) {
    this.currNode = this.cache.getNode(nodeName) || this.cache.setNode(nodeName, new Node(this, nodeName, this.nodes[nodeName], this.handlers[nodeName]));
    Object.assign(this.executor, { $refName: nodeName, $flowInfo: this.cache.getFlowInfo(), exit: this.exit });
  }

  /**
   * execute 生命周期
   */
  async _execute() {
    if (this.currNode.getHandler()) {
      const payload = {
        context: this.runtime,
        props: this.currNode.getProps(this.executor),
        flowInfo: this.flowInfo,
        executor: this.executor
      };
      this.flowInfo = createProxy(await Promise.race([fn2Promise(this.currNode.getHandler(), payload), timeoutPromise()]));
    }
  }

  /**
   * execute 生命周期
   */
  _afterExecute() {
    this.cache.setFlowInfo(this.currNode.getName(), this.flowInfo);
    this.prevNode = this.currNode;
  }

  /**
   * 新增状态机实例
   * @param {*} flowEntry 
   * @param {*} share 
   */
  _fork(flowEntry = this.flowEntry, share = {}) {
    const stateMap = Object.assign({}, this.stateMap, { flowEntry });
    return new Machine(this.runtime, stateMap, this.handlers, Object.assign({ cache: this.cache, flowInfo: this.flowInfo, prevNode: this.prevNode }, share));
  }

  /**
   * execute 生命周期
   * 进入后续节点
   */
  _next() {
    let nextNodes = this.transition.transit(this.currNode.getName());
    if (this.status !== MACHINE_STATUS.PENDING) nextNodes = [];

    if (!nextNodes.length) {
      this.cache.destroyMachines(this.mId, { include: this });
    }
    else if (this.transition.isParallel(this.currNode.getName())) {
      this.cache.destroyMachines(this.mId, { include: this });
      const stack = this.stack.concat(this.mId, shortId.generate());
      return Promise.all(nextNodes.map(flowEntry => this._fork(flowEntry, { stack: [].concat(stack) }).run()));
    }
    else if (this.transition.isJoin(this.currNode.getName())) {
      this.cache.destroyMachines(this.mId, { exclude: this });
      const stack = [].concat(this.stack);
      return this._fork(nextNodes[0], { stack }).run();
    }
    else return this.run(nextNodes[0]);
  }

  _report(nodeName, e) {
    // TODO: ERROR REPORT
  }

  exit() {
    this.status = MACHINE_STATUS.FULFILLED;
  }

  async run(nodeName = this.flowEntry) {
    try {
      this._beforeExecute(nodeName);
      if (!this.currNode.can(this.mId, this.prevNode)) return;
      await this._execute();
      this._afterExecute();
      return this._next();
    } catch (e) {
      console.error(e);
      this.exit();
      this._report(nodeName, e);
    }
  }
}

export default Machine;
