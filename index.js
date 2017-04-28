const fetch = require('isomorphic-fetch')

function invokeService (endpoint, opts) {
  const options = Object.assign({
    method: 'GET',
    headers: {}
  }, opts)
  let breakCircuit = false
  if (options.token) {
    options.headers['authorization'] = `Bearer ${options.token}`
  }
  if (options.heartbeat) {
    if (typeof options.heartbeat === 'string') {
      options.heartbeat = {
        url: options.heartbeat,
        interval: 5000,
        options: {
          timeout: 1000
        }
      }
    }
    const checkConnection = invokeService(options.heartbeat.url, options.heartbeat.options)
    setInterval(() => {
      checkConnection()
        .then(() => { breakCircuit = false })
        .catch(() => { breakCircuit = true })
    }, options.heartbeat.interval)
  }
  return (payload, token) => {
    if (breakCircuit) {
      return Promise.reject(new Error('Service is down.'))
    }
    const params = Object.assign({}, payload)
    const url = endpoint.replace(/:([a-zA-Z]\w*)\??/gi, (match, param) => {
      if (param in params) {
        const value = params[param]
        delete params[param]
        return value
      }
      if (match.endsWith('?')) {
        return ''
      }
      throw new Error(`Could not find required parameter: ${param}`)
    })
    const callOptions = Object.assign({}, options)
    if (token) {
      callOptions.headers['authorization'] = `Bearer ${token}`
    }
    if (options.method === 'GET') {
      return fetch(`${url}?${queryString(params)}`, callOptions).then(unwrap)
    }
    callOptions.headers['content-type'] = 'application/json'
    return fetch(url, callOptions).then(unwrap)
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
    return 'data' in json ? json.data : json
  })
}

module.exports = invokeService
