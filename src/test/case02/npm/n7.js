"use strict";

export default ({ executor }) => {
  return new Promise(res => {
    setTimeout(_ => {
      console.log(7)
      res(7);
    }, 3000);
  });
};
