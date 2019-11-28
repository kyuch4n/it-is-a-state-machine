"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(10)
      res(10);
    }, 3000);
  });
};
