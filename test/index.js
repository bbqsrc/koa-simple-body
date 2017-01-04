"use strict";

const bodyParser = require("../index")
const path = require("path")
const fs = require("fs")

const { expect } = require("chai")
const koa = () => new (require("koa"))()
const request = require("supertest")

describe("Buffer", function() {
  it("should get the raw buffer body (options.useBuffer: true)", function(done) {
    const server = koa()

    server.use(bodyParser({ useBuffer: true }))

    server.use(function(ctx, next) {
      expect(Buffer.isBuffer(ctx.request.body)).to.be.true

      ctx.body = ctx.request.body.toString("utf8")
    })

    request(server.callback())
      .post("/")
      .type("text")
      .send("qux")
      .expect(200)
      .expect("qux", done)
  })

  it("should throw if the buffer body is too large (options.useBuffer: true)", function(done) {
    const server = koa()

    server.use(bodyParser({ useBuffer: true, buffer: "2b" }))

    request(server.callback())
      .post("/")
      .type("text")
      .send("too large")
      .expect(413, done)
  })

  it("should get text body if useBuffer is false", function(done) {
    const server = koa().use(bodyParser())

    server.use((ctx, next) => {
      expect(ctx.request.body).to.exist

      ctx.body = ctx.request.body
    })

    request(server.callback())
      .post("/")
      .type("text")
      .send("text body")
      .expect(200)
      .expect("text body", done)
  })
})

describe("JSON", function() {
  const app = koa()
  app.use(bodyParser())
  app.use((ctx, next) => {
    ctx.body = ctx.request.fields
    return next()
  })

  it("should parse a json body", function(done) {
    request(app.callback())
      .post("/")
      .type("application/json")
      .send(`{"foo": "bar"}`)
      .expect(200)
      .expect({ foo: "bar" }, done)
  })

  it("should throw on json non-object body", function(done) {
    request(app.callback())
      .post("/")
      .type("json")
      .send("non-object body")
      .expect(400, done)
  })
})

describe("Multipart", function() {
  function filepath (name) {
    return path.join(__dirname, "../", name)
  }

  it("should get multipart body", function(done) {
    const server = koa().use(bodyParser({
      multipart: {
        multiples: true
      }
    }))

    server.use((ctx, next) => {
      expect(ctx.request.files).to.have.keys(["foo", "bar"])
      expect(ctx.request.files.foo).to.have.length(2)
      expect(ctx.request.files.bar).to.exist

      ctx.status = 204

      return next()
    })

    request(server.callback())
      .post("/")
      .type("multipart/form-data")
      .attach("foo", filepath("index.js"))
      .attach("foo", filepath("lib/parsers.js"))
      .attach("bar", filepath("package.json"))
      .expect(204, done)
  })

  it("should get multipart files and fields", function(done) {
    const server = koa().use(bodyParser())
    server.use((ctx, next) => {
      expect(ctx.request.files).to.exist
      expect(ctx.request.fields).to.exist
      expect(ctx.request.files.pkg.name).to.equal("package.json")
      expect(ctx.request.fields.a).to.equal("b")

      ctx.status = 204

      return next()
    })

    request(server.callback())
      .post("/")
      .type("multipart/form-data")
      .field("a", "b")
      .attach("pkg", filepath("package.json"))
      .expect(204, done)
  })
})
