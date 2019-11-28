<template>
  <div>
    <div class="case01-btn" @click="onClick">Case 01 !</div>
  </div>
</template>

<script>
"use strict";

import StateMachine from "../../core";

export default {
  data() {
    return {
      mockData0: {}
    };
  },

  methods: {
    async onClick() {
      const stateMap = {
        nodes: {
          custom: {
            nodeType: "custom_node",
            handler: "console.log(props)",
            props: {
              props1: {
                format: "variable",
                value: "context.mockData0"
              }
            }
          },
          httpRequest: {
            nodeType: "activity_node",
            props: {}
          }
        },
        flow: {
          custom: "httpRequest"
        },
        flowEntry: "custom"
      };

      const handlers = {
        httpRequest: require("./npm/httpRequest.js")
      };

      await new StateMachine(this, stateMap, handlers).run();
      console.log("finish");
    }
  }
};
</script>

<style scoped>
.case01-btn {
  padding: 0 8px;
  display: inline-block;
  height: 40px;
  line-height: 40px;
  text-align: center;
  background: #2d5997;
  color: #fff;
  border-radius: 4px;
  cursor: pointer;
}
</style>