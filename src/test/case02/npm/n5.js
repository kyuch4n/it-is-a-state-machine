"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(5)
      res(5);
    }, 3000);
  });
};
