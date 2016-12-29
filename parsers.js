"use strict";

const rawBody = require("raw-body")
const formidable = require("formidable")
const qs = require("querystring")

function text(ctx, limit) {
  _writeContinue(ctx)

  return rawBody(ctx.req, {
    limit: limit || "100kb",
    length: ctx.request.length,
    encoding: "utf8"
  })
}

function json(ctx, limit) {
  if (!ctx.request.length) {
    return Promise.resolve()
  }

  return text(ctx, limit).then(t => {
    const v = t.trim()
    const first = v[0]

    if (first !== '{' && first !== '[') {
      ctx.throw(400, "only json objects or arrays allowed")
      return
    }

    try {
      return JSON.parse(v)
    } catch (err) {
      ctx.throw(400, "invalid json received")
    }
  })
}

function urlEncoded(ctx, limit) {
  if (!ctx.request.length) {
    return Promise.resolve()
  }

  return text(ctx, limit).then(t => {
    try {
      return qs.parse(text)
    } catch (err) {
      ctx.throw(400, "invalid urlencoded received")
    }
  })
}

function buffer(ctx, limit) {
  _writeContinue(ctx)

  return rawBody(ctx.req, {
    limit: limit || "1mb",
    length: ctx.request.length
  })
}

function multipart(ctx, options) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm(options)

    form.parse(ctx.req, (err, fields, files) => {
      if (err) {
        reject(err)
        return
      }

      resolve({ fields, files })
    })
  })
}

function _writeContinue(ctx) {
  if (!ctx._checkedContinue && ctx.req.checkContinue) {
    ctx.res.writeContinue()
    ctx._checkedContinue = true
  }
}

module.exports = {
  text,
  json,
  urlEncoded,
  buffer,
  multipart
}
