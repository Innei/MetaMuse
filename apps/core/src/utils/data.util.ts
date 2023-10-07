export const reorganizeData = <T>(
  data: T[],
  select?: string[],
  exclude?: string[],
): T[] => {
  let result: T[] = data
  if (select?.length) {
    const nextData = [] as typeof data
    for (const item of data) {
      if (!item) continue
      const currentItem = {} as any
      for (const key of select) {
        currentItem[key] = item[key]
      }
      nextData.push(currentItem)
    }

    result = nextData
  }

  if (exclude?.length) {
    const nextData = [] as typeof result
    for (const item of result) {
      if (!item) continue
      const currentItem = {
        ...item,
      } as any
      for (const key of exclude) {
        delete currentItem[key]
      }
      nextData.push(currentItem)
    }

    result = nextData
  }
  return result
}
