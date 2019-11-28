"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(4)
      res(4);
    }, 3000);
  });
};
