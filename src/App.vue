<template>
  <div>
    <case01></case01>
    <case02></case02>
  </div>
</template>

<script>
"use strict";

import Case01 from "./test/case01/App.vue";
import Case02 from "./test/case02/App.vue";

export default {
  components: {
    Case01,
    Case02
  }
};
</script>

<style scoped>
div {
  text-align: center;
}

div > * {
  margin-top: 8px;
}
</style>