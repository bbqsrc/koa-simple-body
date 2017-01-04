"use strict";

const parsers = require("./lib/parsers")

const types = {
  multipart: "multipart/form-data",
  urlEncoded: "application/x-www-form-urlencoded",
  json: [
    "application/json",
    "application/json-patch+json",
    "application/vnd.api+json",
    "application/csp-report"
  ],
  buffer: [
    "text/*"
  ]
}

function parseBody(ctx, opts) {
  const options = opts || {}

  ctx.request.fields = {}
  ctx.request.files = {}

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
  if (options.useBuffer && ctx.request.is(types.buffer)) {
    return parsers.buffer(ctx, options.buffer).then(body => {
      ctx.request.body = body
    })
  }

  // Fallback to text
  return parsers.text(ctx, options.text).then(text => {
    ctx.request.body = text
  })
}

function middleware(options) {
  return (ctx, next) => {
    const method = ctx.method.toUpperCase()

    const canHaveBody = (
      method === "POST" ||
      method === "PUT" ||
      method === "PATCH" ||
      method === "OPTIONS"
    )

    if (!canHaveBody) {
      return next()
    }

    return parseBody(ctx, options).then(next)
  }
}

module.exports = middleware
