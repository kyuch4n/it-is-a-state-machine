"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(9)
      res(9);
    }, 3000);
  });
};
