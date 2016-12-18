const fetch = require('node-fetch')
const querystring = require('querystring')

module.exports = function (endpoint, opts) {
  const options = Object.assign({
    method: 'GET',
    headers: {}
  }, opts)
  if (options.token) {
    options.headers.authorization = `Bearer ${options.token}`
  }
  return options.method === 'GET'
    ? (params = {}) => fetch(`${endpoint}?${querystring.stringify(params)}`, options).then(unwrap)
    : (params = {}) => {
      const fetchOpts = Object.assign({
        body: JSON.stringify(params)
      }, options)
      fetchOpts.headers['content-type'] = 'application/json'
      return fetch(endpoint, fetchOpts).then(unwrap)
    }
}

function unwrap (res) {
  if (!res.ok) {
    const err = new Error(res.statusText || 'Error calling service')
    err.statusCode = res.status
    throw err
  }
  return res.json()
    .then((json) => {
      if (('ok' in json && !json.ok) || ('status' in json && json.status !== 'success')) {
        throw new Error(json.error || json.message || 'Error calling service')
      }
      return json.data
    })
}
