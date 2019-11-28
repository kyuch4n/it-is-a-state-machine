"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(8)
      res(8);
    }, 3000);
  });
};
