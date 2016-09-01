import test from 'blue-tape'
import getUploader, { getReadStream } from './utils'

const upload = getUploader()

test('kitchen sink', (t) => (
  upload(getReadStream()).then(({ digests, size, key }) => {
    t.deepEqual(digests, {
      md5: '4986d9c661a8da5efb29cee86498668a',
      sha1: '4129def2ea7cb7945ddfbb785969898fca2e34c3',
      sha256: 'dd34c223ee0d42794134677547e86d03358b38a95318ec6dc5d9ff23553427f0',
    })
    t.equal(size, 2447774)
    t.ok(typeof key === 'string')
    t.ok(key.length > 5)
  }).catch(t.fail)
))
