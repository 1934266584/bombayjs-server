// @ts-nocheck
import { Service, Context } from "egg";
// tslint:disable-next-line:no-var-requires
const moment = require("moment");
// tslint:disable-next-line:no-var-requires
const UUid = require("uuid");

export default class ReportService extends Service {
  constructor(ctx: Context) {
    super(ctx);
  }

  /**
   * *******************************************************************************************
   * 保存数据到es
   * @param payload 要保存的数据
   * @param event es 对应的_index名称
   * @param id es 对应的_id名称
   * @param timestamp es 时间参数
   * @param eventLog es要保存的数据
   * *******************************************************************************************
   */
  public async saveDataToEs(payload) {
    return await this.app.curl(this.app.config.kafkaSubmit, {
      dataType: "json",
      method: "POST",
      contentType: "json",
      data: {
        event: "web-report-collect",
        id: UUid.v1(),
        timestamp: new Date().getTime(),
        eventLog: payload
      }
    });
  }
  /**
   * *******************************************************************************************
   * 获取地理信息
   * @param ip
   * *******************************************************************************************
   */
  public async getLocation(ip) {
    const isExist = await this.app.elasticsearch.indices.exists({
      index: "frontend-event-log-web-report-location"
    });
    if (isExist) {
      return this.getLocationToEs(ip);
    } else {
      return {
        location: { lng: null, lat: null },
        ad_info: { nation: null, province: null, city: null, adcode: 0 }
      };
    }
  }
  /**
   * 从Es获取地理信息如果没有则保存
   * @param ip
   */
  public async getLocationToEs(ip) {
    const ipl = this.ctx.helper.subIp(ip);
    const res = await this.app.elasticsearch.search({
      index: "frontend-event-log-web-report-location",
      type: "_doc",
      body: {
        query: {
          match: {
            ip: ipl
          }
        }
      }
    });
    if (res.hits.hits.length > 0) {
      const { location, ad_info } = res.hits.hits[0]._source;
      if (
        ad_info.nation === "中国" &&
        (ad_info.province === "香港特别行政区" ||
          ad_info.province === "台湾省" ||
          ad_info.province === "澳门特别行政区")
      ) {
        ad_info.nation = `${ad_info.nation}${ad_info.province}`;
      }
      return { location, ad_info };
    } else {
      return {
        location: { lng: null, lat: null },
        ad_info: { nation: null, province: null, city: null, adcode: 0 }
      };
    }
  }
  /**
   * 本地测试使用,发布后删除
   * @param payload
   */
  async save(payload) {
    return await this.app.elasticsearch.index({
      index: `frontend-event-log-web-report-collect-${moment().format(
        "YYYY-MM"
      )}`,
      type: "_doc",
      body: payload
    });
    // await this.ctx.kafka.sendMessageSync({
    //   topic: 'reportTopic', // 指定 kafka 目录下 的topic
    //   key: 'report', // 指定 kafka 下的 topic 目录 对应key的consumer
    //   messages: JSON.stringify(payload),
    // });
    // , res => {
    //   console.dir('sucess');
    //   console.dir(res);
    // }, error => {
    //   console.dir('error');
    //   console.dir(error);
    // }
  }
}
