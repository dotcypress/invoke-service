const fetch = require('isomorphic-fetch')

module.exports = function (endpoint, opts) {
  const options = Object.assign({
    method: 'GET',
    headers: {}
  }, opts)
  if (options.token) {
    options.headers.authorization = `Bearer ${options.token}`
  }
  return (params = {}) => {
    const url = endpoint.replace(/:(\w+)/gi, (match, param) => {
      var replacement = params[param]
      if (!replacement) {
        throw new Error(`Could not find parameter: ${param}`)
      }
      delete params[param]
      return replacement
    })
    if (options.method === 'GET') {
      return fetch(`${url}?${queryString(params)}`, options).then(unwrap)
    }
    const fetchOpts = Object.assign({body: JSON.stringify(params)}, options)
    fetchOpts.headers['content-type'] = 'application/json'
    return fetch(url, fetchOpts).then(unwrap)
  }
}

function queryString (obj = {}) {
  return Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

function unwrap (res) {
  if (!res.ok) {
    const err = new Error(res.statusText || 'Error calling service')
    err.statusCode = res.status
    throw err
  }
  return res.json().then((json) => {
    if (('ok' in json && !json.ok) || ('status' in json && json.status !== 'success')) {
      throw new Error(json.error || json.message || 'Error calling service')
    }
    return json.data
  })
}
