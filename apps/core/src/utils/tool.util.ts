export const deepEqual = (a: any, b: any) => {
  return JSON.stringify(a) === JSON.stringify(b)
}
