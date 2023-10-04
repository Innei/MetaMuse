/* eslint-disable prefer-rest-params */
import { createWriteStream } from 'fs'
import { resolve } from 'path'
import chalk from 'chalk'
import consola_, { FancyReporter, LogLevel } from 'consola'
import { CronJob } from 'cron'
import { argv } from 'zx-cjs'

import { LOG_DIR } from '@core/constants/path.constant'
import { CronExpression } from '@nestjs/schedule'

import { getShortDate, getShortTime } from '../shared/utils/time.util'
import { isDev, isTest } from './env.global'

export const getTodayLogFilePath = () =>
  resolve(LOG_DIR, `stdout_${getShortDate(new Date())}.log`)

class Reporter extends FancyReporter {
  isInVirtualTerminal = typeof process.stdout.columns === 'undefined' // HACK: if got `undefined` that means in PM2 pty
  protected formatDate(date: Date): string {
    return this.isInVirtualTerminal ? '' : super.formatDate(date)
  }

  protected formatLogObj(): string {
    return this.isInVirtualTerminal
      ? `${chalk.gray(getShortTime(new Date()))} ${super.formatLogObj
          // @ts-ignore
          .apply(this, arguments)
          .replace(/^\n/, '')}`.trimEnd()
      : // @ts-ignore
        super.formatLogObj.apply(this, arguments)
  }
}
export const consola = consola_.create({
  reporters: [new Reporter()],
  level: isDev || isTest || argv.verbose ? LogLevel.Trace : LogLevel.Info,
})
export function registerStdLogger() {
  let logStream = createWriteStream(getTodayLogFilePath(), {
    encoding: 'utf-8',
    flags: 'a+',
  })

  logStream.write(
    '\n========================================================\n',
  )

  const job = new CronJob(CronExpression.EVERY_DAY_AT_MIDNIGHT, () => {
    logStream.destroy()

    logStream = createWriteStream(getTodayLogFilePath(), {
      encoding: 'utf-8',
      flags: 'a+',
    })
    logStream.write(
      '\n========================================================\n',
    )
  })
  job.start()

  const stdout = process.stdout.write
  const stderr = process.stderr.write

  function log(data: string) {
    if (isTest) {
      return
    }
    logStream.write(data)
  }

  process.stdout.write = function () {
    log(arguments[0])

    // @ts-ignore
    return stdout.apply(this, arguments)
  }

  process.stderr.write = function () {
    log(arguments[0])
    // @ts-ignore
    return stderr.apply(this, arguments)
  }

  consola.wrapAll()
  // HACK: forhidden pm2 to override this method
  Object.defineProperty(process.stdout, 'write', {
    value: process.stdout.write,
    writable: false,
    configurable: false,
  })
  Object.defineProperty(process.stderr, 'write', {
    value: process.stdout.write,
    writable: false,
    configurable: false,
  })
}
