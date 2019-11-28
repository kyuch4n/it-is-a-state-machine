"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(1)
      res(1);
    }, 3000);
  });
};
