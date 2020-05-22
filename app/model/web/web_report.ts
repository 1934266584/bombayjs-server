// 上报数据共享字段
export default {
  guid: { type: String }, // 唯一标识
  page: { type: String }, // 页面
  t: { type: String, alias: 'type' }, // 类型
  times: { type: Number, default: 0 }, // 次数
  v: { type: String, alias: 'version' }, // 版本
  token: { type: String }, // 项目id
  e: { type: String, alias: 'enviroment' }, // 开发生产环境
  begin: { type: Number, default: 0 }, // 开始时间戳
  uid: { type: String }, // user id
  sid: { type: String }, // session id
  sr: { type: String }, // 屏幕分辨率
  vp: { type: String }, // view 分辨率
  ul: { type: String }, // 语言
  ct: { type: String }, // 网络
  _v: { type: String }, // 脚本sdk版本
  o: { type: String }, // 原始url
  user: { type: String }, // 用户信息
  deviceBrowser: { type: String }, //设备的浏览器类型
  deviceModel: { type: String }, // 设备的品牌相关
  deviceEngine: { type: String }, // 设备的浏览器引擎
  deviceOs: { type: String }, // 设备的操作系统
  ip: { type: String }, // 访问者IP
  county: { type: String }, // 国家
  province: { type: String }, // 省
  city: { type: String }, // 市
};
