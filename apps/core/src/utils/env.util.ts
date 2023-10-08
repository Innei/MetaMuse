import { config } from 'dotenv'
import dotenvExpand from 'dotenv-expand'
import { argv } from 'zx-cjs'

dotenvExpand.expand(config())
const env = process.env

export const mergeArgv = (key: string) => {
  return argv[key] ?? env[toUpperCase(key)]
}

const toUpperCase = (key: string) => key.toUpperCase()
