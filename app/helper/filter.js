'use strict';
module.exports =
  function filterParams(params, rule) {
    const keys = Object.keys(rule);
    const data = {};
    for (const key of keys) {
      if (params[key]) {
        data[key] = params[key];
      }
    }
    return data;
  };
