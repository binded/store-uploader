# store-uploader

[![Build Status](https://travis-ci.org/blockai/store-uploader.svg?branch=master)](https://travis-ci.org/blockai/store-uploader)

Wrapper around
[abstract-blob-store](https://github.com/maxogden/abstract-blob-store)
to upload a stream and get back a series of hash digests, the size of
the file and the key it was stored to.

## Install

```bash
npm install --save store-uploader
```

Requires Node v6+

## Usage

See [./test](./test) directory for usage examples.

```javascript
import storeUploader from 'store-uploader'
import blobFs from 'fs-blob-store'
import fs from 'fs'

const store = blobFs('./directory')
const upload = storeUploader(store)
// storeUploader(store[, opts])
// opts.keyPrefix prefix keys with this string (defaults to uploads/)
// opts.algos hash algorithms (defaults to ['sha1', 'md5', 'sha256'])

// upload(readStream[, opts])
// opts.contentType optional content type
upload(fs.createReadStream('./somefile'))
  .then(({ digests, size, key }) => {
    // digests is an object: { sha1: '...', md5: '...', sha256: '...' }
    // size is the size of the stream in bytes
    // key is the key where the stream was uploaded
  })
  .catch((err) => {
    // handle error...
  })
```