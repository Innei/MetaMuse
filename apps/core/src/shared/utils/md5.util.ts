import { createHash } from 'crypto'
import { Readable } from 'stream'

export async function md5Stream(stream: Readable): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('md5')
    stream.on('data', (chunk) => {
      hash.update(chunk)
    })
    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })
    stream.on('error', (err) => {
      reject(err)
    })
  })
}
