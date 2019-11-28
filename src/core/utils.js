"use strict";

import co from "co";
import cloneDeep from "lodash.clonedeep";
import { TIMEOUT } from "./config.js";

const isString = variable => {
  return typeof variable === "string";
};

const isArray = variable => {
  return variable instanceof Array;
};

const isStringArray = variable => {
  return isArray(variable) && isString(variable[0]); // only check Array[0]
};

const createIterator = items => {
  let index = 0;
  return {
    next: () => {
      const done = index >= items.length;
      var value = !done ? items[index++] : undefined;
      return { done, value };
    },
    hasNext: () => {
      return index < items.length;
    }
  };
};

const createProxy = target => {
  if (typeof target !== "object") return target;

  const validator = {
    get(target, key) {
      if (typeof target[key] === "object" && target[key] !== null) return new Proxy(target[key], validator);
      return target[key];
    },
    set(/** target, key, value */) {
      console.warn("you are not recommended to modify flowInfo");
      return true;
    }
  };

  return new Proxy(target, validator);
};

const calcExpression = expression => {
  return new Function("context", "executor", `return ${expression}`);
};

const fn2Promise = (fn, payload) => {
  if (!(fn instanceof Function || fn instanceof Promise)) return Promise.reject("no function");
  if (fn.constructor.name === "GeneratorFunction") return co.wrap(fn)(payload);
  if (fn.constructor.name === "AsyncFunction") return fn;
  if (fn.constructor.name === "Function") return Promise.resolve(fn(payload));
  if (fn instanceof Promise) return fn;
};

const timeoutPromise = (timeout = TIMEOUT) => {
  return new Promise((res, rej) => {
    let timeoutId = setTimeout(() => {
      clearTimeout(timeoutId);
      rej("timeout");
    }, timeout);
  });
};

export { isString, isArray, isStringArray, cloneDeep, createIterator, createProxy, calcExpression, fn2Promise, timeoutPromise };
