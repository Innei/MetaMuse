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

  AuthFailUserNotExist = 20000,
  AuthFail = 20001,
  JWTExpired = 20002,
  JWTInvalid = 20003,

  UserNotFound = 30000,
  UserExist = 30001,
}

export const ErrorCode = Object.freeze<
  Record<ErrorCodeEnum, [string, string, number]>
>({
  [ErrorCodeEnum.NoContentCanBeModified]: [
    'no content can be modified',
    '没有内容可以被修改',
    400,
  ],
  [ErrorCodeEnum.InvalidQuery]: ['invalid query', '无效的查询', 400],
  [ErrorCodeEnum.NotReady]: [
    'not ready, please try again later',
    '服务暂时不可用，请稍后再试',
    503,
  ],
  [ErrorCodeEnum.NotInitialized]: [
    'not initialized, site owner is missing',
    '站点未初始化，站长信息缺失',
    503,
  ],
  [ErrorCodeEnum.PostNotFound]: ['post not found', '文章不存在', 404],
  [ErrorCodeEnum.PostNotPublished]: ['post not found', '文章不存在', 404],
  [ErrorCodeEnum.PostExist]: ['post already exist', '文章已存在', 400],
  [ErrorCodeEnum.CategoryNotFound]: [
    'category not found',
    '该分类未找到 (｡•́︿•̀｡)',
    404,
  ],
  [ErrorCodeEnum.CategoryCannotDeleted]: [
    'there are other posts in this category, cannot be deleted',
    '该分类中有其他文章，无法被删除',
    400,
  ],
  [ErrorCodeEnum.CategoryAlreadyExists]: [
    'category already exists',
    '分类已存在',
    400,
  ],
  [ErrorCodeEnum.AuthFailUserNotExist]: [
    'auth failed, user not exist',
    '认证失败，用户不存在',
    400,
  ],
  [ErrorCodeEnum.AuthFail]: [
    'auth failed, please check your username and password',
    '认证失败，请检查用户名和密码',
    400,
  ],
  [ErrorCodeEnum.JWTExpired]: ['jwt expired', 'jwt 已过期', 401],
  [ErrorCodeEnum.JWTInvalid]: ['jwt invalid', 'jwt 无效', 401],
  [ErrorCodeEnum.UserNotFound]: ['user not found', '用户不存在', 404],
  [ErrorCodeEnum.UserExist]: ['user already exist', '用户已存在', 400],
})
