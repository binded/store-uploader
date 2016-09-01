import uuid from 'uuid'
import initDebug from 'debug'
import { HashStream, SizeStream } from 'common-streams'
import miss from 'mississippi'
import maybeDone from 'maybedone'

const { concat, pipe } = miss

const globalDebug = initDebug('store-uploader')

const randomKey = () => uuid.v1()

// Store is an abstract-blob-store
// Uploads a file to AWS S3 (or other blob store)
// and returns { url, hashes, size }
export default (store, {
  keyPrefix = 'uploads/',
  algos = ['sha1', 'sha256', 'md5'],
} = {}) => (readStream, {
  contentType,
} = {}) => Promise.resolve().then(() => {
  const key = [keyPrefix, randomKey()].join('')
  const debug = (...args) => globalDebug(key, ...args)

  const hashStreams = algos.map((algo) => [algo, new HashStream(algo)])
  const sizeStream = new SizeStream()

  debug('Starting upload... ')

  return new Promise((resolve, reject) => {
    const result = { key, digests: {} }

    const cb = maybeDone((err) => {
      if (err) return reject(err)
      return resolve(result)
    }, 3 + hashStreams.length)

    const storeStream = store.createWriteStream({
      key,
      contentType,
    }, cb)

    const saveDigest = (algo) => concat(([{ digest }]) => {
      result.digests[algo] = digest
    })

    const saveSize = () => concat(([{ size }]) => {
      result.size = size
    })

    hashStreams.forEach(([algo, hashStream]) => {
      pipe(readStream, hashStream, saveDigest(algo), (err) => {
        if (err) return cb(err)
        cb()
      })
    })
    pipe(readStream, sizeStream, saveSize(), (err) => {
      if (err) return cb(err)
      cb()
    })
    pipe(readStream, storeStream, (err) => {
      if (err) return cb(err)
      cb()
    })
  })
  .then((result) => {
    debug('Upload done')
    return result
  })
})
