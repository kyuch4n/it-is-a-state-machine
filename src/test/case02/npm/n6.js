"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(6)
      res(6);
    }, 3000);
  });
};
