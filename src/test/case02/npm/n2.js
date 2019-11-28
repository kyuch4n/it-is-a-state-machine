"use strict";

export default () => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(2)
      res(2);
    }, 3000);
  });
};
