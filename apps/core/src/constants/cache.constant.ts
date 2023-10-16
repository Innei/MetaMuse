export enum RedisKeys {
  JWTStore = 'jwt_store',
  /** HTTP 请求缓存 */
  HTTPCache = 'http_cache',

  ConfigCache = 'config_cache',

  /** 最大在线人数 */
  MaxOnlineCount = 'max_online_count',

  CacheGet = 'cache_get',

  // Article count
  //
  Read = 'read',
  Like = 'like',
}

export enum CacheKeys {}
