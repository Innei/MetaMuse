export function diffSets(
  set1: Set<any>,
  set2: Set<any>,
): { added: Set<any>; removed: Set<any> } {
  const added = new Set<any>()
  const removed = new Set<any>()

  // 查找新增的项
  for (const item of set2) {
    if (!set1.has(item)) {
      added.add(item)
    }
  }

  // 查找已删除的项
  for (const item of set1) {
    if (!set2.has(item)) {
      removed.add(item)
    }
  }

  return { added, removed }
}
