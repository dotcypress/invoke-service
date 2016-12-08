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
const invokeService = require('invoke-service')

const getWeather = invokeService('https://weather.tld/v2/foo/bar')

getWeather({latitude: 30, longitude: -120}).then((result) => console.log(result))

```
