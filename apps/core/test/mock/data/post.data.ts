import { snowflake } from '@core/processors/database/snowflake.util'

const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min
export const generateMockPost = () => {
  return {
    slug: `this-is-a-mock-post-${snowflake.nextId()}`,
    text: `This is the text content of the mock post ${getRandomInt(1, 100)}.`,
    title: `Mock Post Title ${getRandomInt(1, 100)}`,
    copyright: true,
    allowComment: true,
    pin: false,
    isPublished: true,
  }
}
const mockPostInputData = generateMockPost()

export { mockPostInputData }
