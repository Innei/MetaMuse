export enum ErrorCodeEnum {
  NoContentCanBeModified = 1000,
  InvalidQuery = 1001,

  NotReady = 5000,
  NotInitialized = 5001,

  PostNotFound = 10000,
  PostExist = 10001,
  CategoryNotFound = 10002,
  CategoryCannotDeleted = 10003,
  CategoryAlreadyExists = 10004,
  PostNotPublished = 10005,
  PostSlugExists = 10006,

  AuthFailUserNotExist = 20000,
  AuthFail = 20001,
  JWTExpired = 20002,
  JWTInvalid = 20003,

  UserNotFound = 30000,
  UserExist = 30001,
}

export const ErrorCode = Object.freeze<Record<ErrorCodeEnum, [string, number]>>(
  {
    [ErrorCodeEnum.NoContentCanBeModified]: ['no content can be modified', 400],
    [ErrorCodeEnum.InvalidQuery]: ['invalid query', 400],
    [ErrorCodeEnum.NotReady]: ['not ready, please try again later', 503],
    [ErrorCodeEnum.NotInitialized]: [
      'not initialized, site owner is missing',

      503,
    ],

    /// Post
    [ErrorCodeEnum.PostNotFound]: ['post not found', 404],
    [ErrorCodeEnum.PostNotPublished]: ['post not found', 404],
    [ErrorCodeEnum.PostExist]: ['post already exist', 400],
    [ErrorCodeEnum.CategoryNotFound]: ['category not found', 404],
    [ErrorCodeEnum.CategoryCannotDeleted]: [
      'there are other posts in this category, cannot be deleted',

      400,
    ],
    [ErrorCodeEnum.CategoryAlreadyExists]: ['category already exists', 400],

    [ErrorCodeEnum.PostSlugExists]: ['slug already exists', 400],

    [ErrorCodeEnum.AuthFailUserNotExist]: ['auth failed, user not exist', 400],
    [ErrorCodeEnum.AuthFail]: [
      'auth failed, please check your username and password',

      400,
    ],
    [ErrorCodeEnum.JWTExpired]: ['jwt expired', 401],
    [ErrorCodeEnum.JWTInvalid]: ['jwt invalid', 401],
    [ErrorCodeEnum.UserNotFound]: ['user not found', 404],
    [ErrorCodeEnum.UserExist]: ['user already exist', 400],
  },
)
