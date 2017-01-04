# koa-simple-body

```
npm install koa-simple-body
```

Coherent and consistent body parsing implementation for Koa v2.

Supports multipart, url-encoded and JSON data by default. Check the `index.js` for the specific MIME types.

Everything it doesn't understand is parsed as plain text.

## Usage

### Defaults

```javascript
const Koa = require("koa")
const bodyParser = require("bodyParser")

const app = new Koa()

app.use(bodyParser())

app.use(ctx => {
  // Print fields
  console.log(ctx.request.fields)

  // Print files (formidable)
  console.log(ctx.request.files)
})
```

That's it!

### Extra options

```javascript
bodyParser({
  useBuffer: true,      // enables parsing text/* as a buffer
  buffer: "50kb",       // max buffer size
  text: "50kb",         // max text size
  json: "100kb",        // max json size
  urlEncoded: "500kb",  // max url-encoded size
  multipart: {
    // Formidable options object (some examples shown)
    maxFieldsSize: 5 * 1024 * 1024, // 5mb

    // Allow array of files with 'multiple' attribute
    multiples: true
  }    
})
```

For more information on the `Formidable.IncomingForm` options available, see the
[felixge/node-formidable](https://github.com/felixge/node-formidable) repository.

## Roadmap

### 2.0

- Add support for bubbling errors to middleware (feedback and suggestions for API encouraged)
- Ensure default size settings are coherent and best defaults

## License

MIT - see LICENSE file.
