const fetch = require('isomorphic-fetch')

const DefaultHeartbeatTimeout = 3000
const DefaultHeartbeatInterval = 10000

const DefaultCallOptions = {
  extractError: (json) => {
    if (
      ('ok' in json && !json.ok) ||
      ('success' in json && !json.success) ||
      ('status' in json && (json.status !== 'success' && json.status !== 'ok'))
    ) {
      const err = new Error(
        json.error ||
        json.message ||
        (Array.isArray(json.errors) && json.errors[0]) ||
        'Service error'
      )
      err.json = json
      return err
    }
  },
  extractPayload: (json) => 'data' in json ? json.data : json
}

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
        interval: DefaultHeartbeatInterval,
        options: {
          timeout: DefaultHeartbeatTimeout
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
    ? Promise.reject(new Error('Service unavailable'))
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
  const callOptions = Object.assign({}, DefaultCallOptions, options)
  if (callOptions.token) {
    callOptions.headers['Authorization'] = `Bearer ${callOptions.token}`
  }
  if (options.method === 'GET') {
    return fetch(`${url}?${queryString(params)}`, callOptions).then((res) => extract(res, callOptions))
  }
  callOptions.headers['Content-Type'] = 'application/json'
  callOptions.body = JSON.stringify(params)
  return fetch(url, callOptions).then((res) => extract(res, callOptions))
}

function queryString (obj = {}) {
  return Object.keys(obj)
    .map((key) => `${key}=${encodeURIComponent(obj[key])}`)
    .join('&')
}

function extract (res, options) {
  if (!res.ok) {
    const err = new Error(res.statusText || 'Service error')
    err.statusCode = res.status
    throw err
  }
  return res.json().then((json) => {
    const err = options.extractError(json)
    if (err) {
      throw err
    }
    return options.extractPayload(json)
  })
}

module.exports = {
  invoke,
  service
}
