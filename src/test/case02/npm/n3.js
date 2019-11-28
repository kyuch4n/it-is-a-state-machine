"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(3)
      res(3);
    }, 3000);
  });
};
