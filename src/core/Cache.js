"use strict";

class Cache {
  constructor() {
    /**
     * flowInfo: 记录所有节点的运行结果
     * nodes: 节点实例
     * machines: 状态机实例
     */
    this.flowInfo = {};
    this.nodes = {};
    this.machines = {};
  }

  setFlowInfo(nodeName, flowInfo) {
    this.flowInfo[nodeName] = flowInfo;
  }

  getFlowInfo(nodeName) {
    return nodeName ? this.flowInfo[nodeName] || null : this.flowInfo;
  }

  setNode(nodeName, node) {
    return (this.nodes[nodeName] = node);
  }

  getNode(nodeName) {
    return nodeName ? this.nodes[nodeName] || null : this.nodes;
  }

  addMachine(mId, machine) {
    this.machines[mId] = !this.machines[mId] ? [machine] : this.machines[mId].concat(machine);
  }

  /**
   * 销毁 cache 对于 machine 的引用
   * @param {*} mId 
   * @param {*} include 
   * @param {*} except 
   */
  destroyMachines(mId, { include = null, exclude = null }) {
    let destroyMachines = [];
    if (include) {
      /**
       * 仅销毁 include 指向的机器实例
       */
      const index = this.machines[mId].findIndex(machine => machine === include);
      ~index && (destroyMachines = this.machines[mId].splice(index, 1));
    }
    else if (exclude) {
      /**
       * 销毁 exclude 指向的机器实例之外的所有
       */
      const index = this.machines[mId].findIndex(machine => machine === exclude);
      const excludeMachines = ~index ? this.machines[mId].splice(index, 1) : [];
      destroyMachines = this.machines[mId];
      this.machines[mId] = excludeMachines;
    }
    else {
      destroyMachines = this.machines[mId];
      this.machines[mId] = [];
    }

    destroyMachines.forEach(machine => machine.exit());
  }
}

export default Cache;
