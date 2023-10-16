const getRandomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min

export const generateMockNote = () => {
  return {
    text: `This is the text content of the mock note ${getRandomInt(1, 100)}.`,
    title: `Mock Note Title ${getRandomInt(1, 100)}`,
    allowComment: true,
    isPublished: true,
  }
}

const mockNoteData = generateMockNote()

export { mockNoteData }
