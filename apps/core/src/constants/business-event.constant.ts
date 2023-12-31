export const enum BusinessEvents {
  GATEWAY_CONNECT = 'GATEWAY_CONNECT',
  GATEWAY_DISCONNECT = 'GATEWAY_DISCONNECT',

  VISITOR_ONLINE = 'VISITOR_ONLINE',
  VISITOR_OFFLINE = 'VISITOR_OFFLINE',

  AUTH_FAILED = 'AUTH_FAILED',

  POST_CREATE = 'POST_CREATE',
  POST_UPDATE = 'POST_UPDATE',
  POST_DELETE = 'POST_DELETE',

  /// NOTE
  NOTE_CREATE = 'NOTE_CREATE',
  NOTE_UPDATE = 'NOTE_UPDATE',
  NOTE_DELETE = 'NOTE_DELETE',

  // COMMENT
  COMMENT_CREATE = 'COMMENT_CREATE',
  COMMENT_DELETE = 'COMMENT_DELETE',

  // PAGE
  PAGE_CREATE = 'PAGE_CREATE',
  PAGE_UPDATE = 'PAGE_UPDATE',
  PAGE_DELETE = 'PAGE_DELETE',
}

export type BizEventDataMap = {
  [BusinessEvents.GATEWAY_CONNECT]: IGatewayConnectData
  [BusinessEvents.GATEWAY_DISCONNECT]: IGatewayDisconnectData
  [BusinessEvents.VISITOR_ONLINE]: IVisitorOnlineData
  [BusinessEvents.VISITOR_OFFLINE]: IVisitorOfflineData
  [BusinessEvents.AUTH_FAILED]: IAuthFailedData
  [BusinessEvents.POST_CREATE]: NormalizedPostModel
  [BusinessEvents.POST_UPDATE]: NormalizedPostModel
  [BusinessEvents.POST_DELETE]: WithId
  [BusinessEvents.NOTE_CREATE]: NormalizedNoteModel
  [BusinessEvents.NOTE_UPDATE]: NormalizedNoteModel
  [BusinessEvents.NOTE_DELETE]: WithId
  [BusinessEvents.COMMENT_CREATE]: NormalizedCommentModel
  [BusinessEvents.COMMENT_DELETE]: WithId
  [BusinessEvents.PAGE_CREATE]: NormalizedPageModel
  [BusinessEvents.PAGE_UPDATE]: NormalizedPageModel
  [BusinessEvents.PAGE_DELETE]: WithId
}
