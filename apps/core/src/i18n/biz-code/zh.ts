import { ErrorCodeEnum } from '@core/constants/error-code.constant'

const bizErrorZh: Partial<Record<ErrorCodeEnum, string>> = {
  [ErrorCodeEnum.NoContentCanBeModified]: '没有内容可以被修改',
  [ErrorCodeEnum.InvalidQuery]: '无效的查询',
  [ErrorCodeEnum.NotReady]: '服务暂时不可用，请稍后再试',
  [ErrorCodeEnum.NotInitialized]: '站点未初始化，站长信息缺失',

  [ErrorCodeEnum.PostNotFound]: '文章不存在',
  [ErrorCodeEnum.PostNotPublished]: '文章未发布',
  [ErrorCodeEnum.PostExist]: '文章已存在',
  [ErrorCodeEnum.CategoryNotFound]: '该分类未找到 (｡•́︿•̀｡)',
  [ErrorCodeEnum.CategoryCannotDeleted]: '该分类中有其他文章，无法被删除',
  [ErrorCodeEnum.CategoryAlreadyExists]: '分类已存在',
  [ErrorCodeEnum.SlugExists]: 'Slug 已存在',

  [ErrorCodeEnum.AuthFailUserNotExist]: '认证失败，用户不存在',
  [ErrorCodeEnum.AuthFail]: '认证失败，请检查用户名和密码',
  [ErrorCodeEnum.JWTExpired]: 'JWT 已过期',
  [ErrorCodeEnum.JWTInvalid]: 'JWT 无效',
  [ErrorCodeEnum.UserNotFound]: '用户不存在',
  [ErrorCodeEnum.UserExist]: '用户已存在',
}

export default bizErrorZh
