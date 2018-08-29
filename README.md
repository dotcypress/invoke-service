[![NPM Version](https://img.shields.io/npm/v/micro-route.svg?style=flat-square)](https://www.npmjs.com/package/invoke-service)
[![node](https://img.shields.io/node/v/invoke-service.svg?style=flat-square)](https://www.npmjs.com/package/invoke-service)
[![Build Status](https://img.shields.io/travis/dotcypress/invoke-service.svg?branch=master&style=flat-square)](https://travis-ci.org/dotcypress/invoke-service)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square)](http://standardjs.com/)

# invoke-service
>  Invoke helper for http(s) services

## Installation

Install from NPM:

```js
$ npm install invoke-service --save
```

## Examples

```js
const { service, invoke } = require('invoke-service')

const weather1 = await invoke('https://weather.tld/v2/foo/bar', { latitude: 30, longitude: -130 })

const getWeather = service('https://weather.tld/v2/foo/bar')
const weather2 = await getWeather({ latitude: 30, longitude: -120 })


const fetchBlock = service('https://blockexplorer.com/api/block/:blockHash')
const block = await fetchBlock({ blockHash: '00000000839a8e6886ab5951d76f411475428afc90947ee320161bbf18eb6048' })

const authToken = '~34tmnku7bufyvfsvdytfycvasknclsdg'
const fetchTx = service('https://domain.tld/api/tx/:txHash', {
  token: authToken,
  heartbeat: 'https://domain.tld/api/ping'
})

const tx = await fetchTx({ txHash: '88018bb271d5af74feff1b0f4946f93c582e87a8aeffcdb4e9dbd0e4a67d3a4b' })

```
