"use strict";

export default async () => {
  return new Promise(res => {
    setTimeout(_ => {
      res(1);
    }, 5000);
  });
};
