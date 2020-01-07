
module.exports =
  function filterParams (params, rule) {
    // TODO: 深度 filter?
    const keys = Object.keys(rule)
    const data = {}
    for (const key of keys) {
      if (typeof params[key] !== 'undefined') {
        data[key] = params[key]
      }
    }
    return data
  }
