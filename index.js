const fetch = require('isomorphic-fetch')

const DefaultTimeout = 3000

function service (endpoint, opts) {
  const options = Object.assign({
    method: 'GET',
    headers: {}
  }, opts)
  let breakCircuit = false
  if (options.token) {
    options.headers['Authorization'] = `Bearer ${options.token}`
  }
  if (options.heartbeat) {
    if (typeof options.heartbeat === 'string') {
      options.heartbeat = {
        url: options.heartbeat,
        interval: 10000,
        options: {
          timeout: DefaultTimeout
        }
      }
    }
    const checkConnection = invoke(options.heartbeat.url, options.heartbeat.payload, options.heartbeat.options)
    setInterval(() => {
      checkConnection()
        .then(() => { breakCircuit = false })
        .catch(() => { breakCircuit = true })
    }, options.heartbeat.interval)
  }
  return (payload, token) => breakCircuit
    ? Promise.reject(new Error('Can\'t connect to service'))
    : invoke(endpoint, payload, Object.assign({ token }, options))
}

function invoke (endpoint, payload, options) {
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
  if (callOptions.token) {
    callOptions.headers['Authorization'] = `Bearer ${callOptions.token}`
  }
  if (options.method === 'GET') {
    return fetch(`${url}?${queryString(params)}`, callOptions).then(unwrap)
  }
  callOptions.headers['Content-Type'] = 'application/json'
  callOptions.body = JSON.stringify(params)
  return fetch(url, callOptions).then(unwrap)
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
    if (('ok' in json && !json.ok) || ('status' in json && (json.status !== 'success' && json.status !== 'ok'))) {
      throw new Error(json.error || json.message || 'Error calling service')
    }
    return 'data' in json ? json.data : json
  })
}

module.exports = {
  invoke,
  service
}
