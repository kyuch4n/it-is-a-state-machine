<template>
  <div>
    <div class="case02-btn" @click="onClick">Case 02 !</div>
  </div>
</template>

<script>
"use strict";

import StateMachine from "../../core";

export default {
  data() {
    return {
      conditionA: false,
      conditionB: true,
    };
  },

  methods: {
    async onClick() {
      const activityNodes = Array.from(new Array(10), (i, index) => index + 1).reduce((accu, value) => Object.assign({}, accu, { [`n${value}`]: { nodeType: "activity_node" } }), {});
      const stateMap = {
        nodes: Object.assign({
          p1: {
            nodeType: "control_node",
            controlType: "parallel"
          },
          p2: {
            nodeType: "control_node",
            controlType: "parallel"
          },
          j1: {
            nodeType: "control_node",
            controlType: "join",
            trigger: {
              type: "race",
              on: ["n6", "d1"]
            }
          },
          j2: {
            nodeType: "control_node",
            controlType: "join",
            trigger: {
              type: "all",
              on: ["n4", "d2"]
            }
          },
          d1: {
            nodeType: "control_node",
            controlType: "decide"
          },
          d2: {
            nodeType: "control_node",
            controlType: "decide"
          },
        }, activityNodes),
        flow: {
          n1: "p1",
          p1: ["n2", "p2"],
          n2: "n3",
          n3: "n4",
          n4: "j2",
          p2: ["n5", "n7"],
          n5: "n6",
          n6: "j1",
          n7: "d1",
          d1: [
            {
              condition: "context.conditionA",
              next: "j1"
            },
            {
              next: "n7"
            }
          ],
          j1: "d2",
          d2: [
            {
              condition: "context.conditionB",
              next: "j2"
            },
            {
              next: "p2"
            }
          ],
          j2: "n8"
        },
        flowEntry: "n1"
      };
      const handlers = Array.from(new Array(10), (i, index) => index + 1).reduce((accu, value) => Object.assign({}, accu, { [`n${value}`]: require(`./npm/n${value}.js`) }), {});

      await new StateMachine(this, stateMap, handlers).run();
      console.log("finish");
    }
  }
};
</script>

<style scoped>
.case02-btn {
  padding: 0 8px;
  display: inline-block;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: #f4c921;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>