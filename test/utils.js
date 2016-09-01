import blobFs from 'fs-blob-store'
import blobS3 from 's3-blob-store'
import aws from 'aws-sdk'
import path from 'path'
import rimraf from 'rimraf'
import mkdirp from 'mkdirp'
import fs from 'fs'
import miss from 'mississippi'
import initUpload from '../src'

const relPath = (str) => path.join(__dirname, str)

const setup = () => {
  const tmpDir = relPath('./.tmp')
  rimraf.sync(tmpDir)
  mkdirp.sync(tmpDir)
}
setup()

const initFsStore = () => blobFs(relPath('.tmp'))

const initS3Store = () => {
  const client = new aws.S3({
    accessKeyId: process.env.AWS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET || '',
    endpoint: new aws.Endpoint(process.env.S3_BASEURL),
    s3ForcePathStyle: true, // needed to use fake-s3
  })
  const bucket = process.env.S3_BUCKET || 'defaultbucket'
  return blobS3({ client, bucket })
}

const storeInits = { fs: initFsStore, s3: initS3Store }


export const getBlobStore = (storeType) => storeInits[storeType]

export const getReadStream = () => (
  fs.createReadStream(relPath('./files/image.jpg'))
)

export default () => {
  const storeType = process.env.STORE_TYPE || 'fs'
  const initBlobStore = getBlobStore(storeType)
  const store = initBlobStore()
  const upload = initUpload(store)
  const read = (key) => new Promise((resolve, reject) => {
    const rs = store.createReadStream(key)
    return miss.pipe(rs, miss.concat((str) => {
      resolve(str)
    }), (err) => {
      if (err) return reject(err)
    })
  })
  return { upload, store, read }
}
