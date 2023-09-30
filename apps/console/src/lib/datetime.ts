export const relativeTimeFromNow = (
  time: Date | string,
  current = new Date(),
) => {
  if (!time) {
    return '-'
  }
  time = new Date(time)
  const msPerMinute = 60 * 1000
  const msPerHour = msPerMinute * 60
  const msPerDay = msPerHour * 24
  const msPerMonth = msPerDay * 30
  const msPerYear = msPerDay * 365

  const elapsed = +current - +time

  if (elapsed < msPerMinute) {
    const gap = Math.ceil(elapsed / 1000)
    return gap <= 0 ? '刚刚' : `${gap} 秒前`
  } else if (elapsed < msPerHour) {
    return `${Math.round(elapsed / msPerMinute)} 分钟前`
  } else if (elapsed < msPerDay) {
    return `${Math.round(elapsed / msPerHour)} 小时前`
  } else if (elapsed < msPerMonth) {
    return `${Math.round(elapsed / msPerDay)} 天前`
  } else if (elapsed < msPerYear) {
    return `${Math.round(elapsed / msPerMonth)} 个月前`
  } else {
    return `${Math.round(elapsed / msPerYear)} 年前`
  }
}

export const getDayOfYear = (date = new Date()) => {
  const now = date
  const start = new Date(now.getFullYear(), 0, 0)
  const diff = now.getTime() - start.getTime()
  const oneDay = 1000 * 60 * 60 * 24
  const day = Math.floor(diff / oneDay)

  return day
}

export function isValidDate(d: any) {
  return d instanceof Date && !Number.isNaN(+d)
}
