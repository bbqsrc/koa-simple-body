"use strict";

const parsers = require("./parsers")

const types = {
  multipart: [
    'multipart/form-data'
  ],
  urlEncoded: [
    'application/x-www-form-urlencoded'
  ],
  json: [
    'application/json',
    'application/json-patch+json',
    'application/vnd.api+json',
    'application/csp-report'
  ],
  text: [
    'text/*'
  ],
  buffer: [
    'text/*'
  ]
}

function parse(ctx, opts) {
  const options = opts || {}

  // JSON
  if (ctx.request.is(types.json)) {
    return parsers.json(ctx, options.json).then(fields => {
      ctx.request.fields = fields
    })
  }

  // URL encoded
  if (ctx.request.is(types.urlEncoded)) {
    return parsers.urlEncoded(ctx, options.urlEncoded).then(fields => {
      ctx.request.fields = fields
    })
  }

  // Multipart
  if (ctx.request.is(types.multipart)) {
    return parsers.multipart(ctx, options.multipart).then(o => {
      ctx.request.fields = o.fields
      ctx.request.files = o.files
    })
  }

  // Buffer
  if (options.buffer && ctx.request.is(types.buffer)) {
    return parsers.buffer(ctx, options.buffer).then(body => {
      ctx.request.body = body
    })
  }

  // Text
  if (ctx.request.is(types.text)) {
    return parsers.text(ctx, options.text).then(text => {
      ctx.request.body = text
    })
  }

  // Unhandled, skip
  return Promise.resolve()
}

function middleware(options) {
  return (ctx, next) => {
    parse(ctx, options).then(next)
  }
}

module.exports = middleware
