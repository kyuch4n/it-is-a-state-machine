"use strict";

const NODE_TYPE = {
  ACTIVITY_NODE: "activity_node",
  CONTROL_NODE: "control_node",
  CUSTOM_NODE: "custom_node"
};

const CONTROL_TYPE = {
  PARALLEL: "parallel",
  DECIDE: "decide",
  JOIN: "join"
};

const TRIGGER_TYPE = {
  ALL: "all",
  RACE: "race"
};

const MACHINE_STATUS = {
  PENDING: "pending",
  FULFILLED: "fulfilled"
};

export { NODE_TYPE, CONTROL_TYPE, TRIGGER_TYPE, MACHINE_STATUS };
