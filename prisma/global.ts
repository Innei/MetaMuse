/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace PrismaJson {
    type ArticleCount = {
      read: number
      like: number
    }

    type ArticleImage = {
      src: string
      width: number | undefined
      height: number | undefined
      accent: string | undefined
      type: string
    }

    type NoteCoordinate = {
      latitude: number
      longitude: number
    }

    type ArticleImages = ArticleImage[]
  }
}

export {}
