module.exports = {
  /**
   * 截取ip前三位
   * @param ip
   *
   */
  subIp(ip: string) {
    const ips = ip.split('.');
    return `${ips[0]}.${ips[1]}.${ips[2]}`;
  },
  /**
   * 将字符串首字母转成大写
   * @param param0  需要转换的字符串
   * @param lowerRest false 首字母大写，其他不变   true 首字母大写，其他都小写
   */
  capitalize([first, ...rest]: any, lowerRest: boolean = false) {
    return (
      first.toUpperCase() +
      (lowerRest ? rest.join('').toLowerCase() : rest.join(''))
    );
  },
  /**
   * query 转换
   * @param qs
   * @param eq
   * @param seq
   */
  decode(qs: any, eq: string = ' and ', seq: string = '=') {
    const obj = {};
    if (typeof qs !== 'string' || qs.length === 0) {
      return obj;
    }
    qs.split(eq).reduce((previousValue, currentValue) => {
      const [key, value] = currentValue.split(seq);
      previousValue[key.trim()] = value.trim();
      return previousValue;
    }, obj);
    return obj;
  },
  success(res: any) {
    this.ctx.body = {
      data: res,
      code: 200,
      message: 'success',
      success: true
    };
    this.ctx.status = 200;
  }
};
