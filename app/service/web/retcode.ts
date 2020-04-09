// @ts-nocheck
import { Service, Context } from "egg";

// tslint:disable-next-line:no-var-requires
const moment = require("moment");
const _ = require("lodash");

class RetCodeService extends Service {
  constructor(ctx: Context) {
    super(ctx);
  }
  public async search(payload: any) {
    const {
      startTime,
      endTime,
      query,
      currentPage,
      pageSize,
      order,
      type,
      projectToken
    } = payload;
    const queryParams: any[] = [];
    const keys = Object.keys(query);
    keys.map(item => {
      queryParams.push({ match: { [item]: query[item] } });
    });
    const body = {
      query: {
        bool: {
          must: queryParams,
          filter: {
            range: {
              "@timestamp": {
                gte: moment(startTime),
                lte: moment(endTime)
              }
            }
          }
        }
      },
      size: pageSize,
      from: (currentPage - 1) * pageSize,
      sort: {
        "@timestamp": {
          order
        }
      }
    };
    const res = await this.esSearch(body, type, projectToken);
    const source: any[] = [];
    res.hits.hits.map(item => {
      source.push(item);
    });
    return { data: source, total: res.hits.hits.length };
  }
  /**
   * ************************************************************************************************
   * 获取维度聚合数据
   * @param payload
   * ************************************************************************************************
   */
  public async dimension(payload: any) {
    const {
      filters,
      dimensions,
      startTime,
      endTime,
      order,
      measures
    } = payload;
    const filterParams = this.filterParams(filters);
    const aggsQuery = this.aggsDimensionQuery(dimensions, order, measures);
    const body = {
      size: 0,
      query: {
        bool: {
          must: filterParams,
          filter: {
            range: {
              "@timestamp": {
                gte: moment(startTime),
                lte: moment(endTime)
              }
            }
          }
        }
      },
      aggs: aggsQuery
    };
    const res = await this.esSearch(body);
    return this.dimensionRes(res, dimensions, measures);
  }
  /**
   * ************************************************************************************************
   * 获取指标聚合数据
   * @param payload
   * ************************************************************************************************
   */
  async indicator(payload: any) {
    const { filters, startTime, endTime, intervalMillis, measures } = payload;
    const filterParams = this.filterParams(filters);
    const aggsQuery = this.aggsIndicatorQuery(measures, intervalMillis);
    const body = {
      size: 0,
      query: {
        bool: {
          must: filterParams,
          filter: {
            range: {
              "@timestamp": {
                gte: moment(startTime),
                lte: moment(endTime)
              }
            }
          }
        }
      },
      aggs: aggsQuery
    };
    const res = await this.esSearch(body);
    return this.indicatorRes({ res, payload });
  }
  /**
   * *******************************************************************************************
   * 格式化维度返回数据
   * @param res object es返回结果
   * @param dimensions array 聚合名称
   * @param measures array 筛选参数
   * @returns object  返回结果
   * *******************************************************************************************
   */
  public dimensionRes(res: any, dimensions: any, measures: any) {
    let total: number = 0; // 返回结果总和
    const data: any[] = []; // 查询数据
    const name = dimensions[0];
    if (!res.aggregations || res.aggregations[name].buckets.length === 0)
      return { data: [], total: 0 };
    res.aggregations[name].buckets.map(b => {
      const temp: { pv?: number; uv?: number } = {};
      temp[name] = b.key;
      measures.map(item => {
        if (b[item].buckets) {
          if (item === "count") temp[item] = b.doc_count;
          else temp[item] = b[item].buckets;
        } else {
          temp[item] = b[item].value || 0;
          if (item === "count") temp[item] = b.doc_count;
        }
      });
      data.push(temp);
      total += b.doc_count;
    });
    return { data, total };
  }
  /**
   * *******************************************************************************************
   * 格式化指标返回数据
   * @param res object es返回结果
   * @param measures array 筛选参数
   * @returns object  返回结果
   * *******************************************************************************************
   */
  public indicatorRes(params: any) {
    const {
      payload: { measures, startTime, endTime, intervalMillis },
      res
    } = params;
    let total: number = 0; // 返回结果总和
    const data: any[] = []; // 查询数据
    if (!res.aggregations || res.aggregations.indicator.buckets.length === 0)
      return { data: [], total: 0 };
    res.aggregations.indicator.buckets.map(b => {
      const temp: {
        pv?: number;
        uv?: number;
        date?: number;
        format?: string;
      } = {};
      temp.date = b.key;
      temp.format = b.key_as_string;
      measures.map(item => {
        if (b[item].buckets) {
          if (item === "count") temp[item] = b.doc_count;
          else temp[item] = b[item].buckets;
        } else {
          temp[item] = b[item].value || 0;
        }
      });
      data.push(temp);
      total += b.doc_count;
    });
    const leftArray: object[] = [];
    const rightArray: object[] = [];
    // 左补全
    if (data[0].date > startTime) {
      const diff: any = (data[0].date - startTime) / intervalMillis;
      const fillData: any = {};
      measures.map(item => {
        fillData[item] = 0;
      });
      Array(Number.parseInt(diff))
        .fill(1)
        .map((_item, index) => {
          const currentDate = startTime + index * intervalMillis;
          const formatDate = moment(currentDate).format("YYYY-MM-DD hh:mm:ss");
          leftArray.push({
            ...fillData,
            date: currentDate,
            format: formatDate
          });
        });
    }
    // 右补全
    if (data[data.length - 1].date < endTime) {
      const diff: any = (endTime - data[data.length - 1].date) / intervalMillis;
      const fillData: any = {};
      measures.map(item => {
        fillData[item] = 0;
      });
      Array(Number.parseInt(diff))
        .fill(1)
        .map((_item, index) => {
          const currentDate =
            data[data.length - 1].date + (index + 1) * intervalMillis;
          const formatDate = moment(currentDate).format("YYYY-MM-DD hh:mm:ss");
          rightArray.push({
            ...fillData,
            date: currentDate,
            format: formatDate
          });
        });
    }
    const allData = [...leftArray, ...data, ...rightArray];
    return { data: allData, total };
  }
  /**
   * *******************************************************************************************
   * @param type Array 查询类型
   * @returns object  es查询结果
   * *******************************************************************************************
   */
  public async getCountOfLogs(payload) {
    const { type, projectToken, startTime, endTime } = payload;
    if (!type || type.length === 0) {
      return this.app.retError("查询对应的日志条数操作：type不能为空");
    }
    const { ctx } = this;

    const result = await Promise.all(
      type.map(item => {
        let webModel = ctx.app.models[`Web${_.capitalize(item)}`](projectToken);
        return webModel
          .find({
            t: item,
            begin: { $gte: startTime, $lte: endTime }
          })
          .exec();
      })
    );

    const counts = result.map((item, index) => ({
      actionType: type[index],
      times: item.length
    }));
    return counts;
  }

  public async getCountOfLogsInSeven(payload) {
    const { projectToken } = payload;
    const type = ["error", "api", "perf", "pv"];
    const endTime = new Date().getTime();
    const startTime = endTime - 15 * 24 * 60 * 60 * 1000;
    const { ctx } = this;
    const result = await Promise.all(
      type.map(item => {
        let webModel = ctx.app.models[`Web${_.capitalize(item)}`](projectToken);
        return webModel
          .find({
            t: item,
            begin: { $gte: startTime, $lte: endTime }
          })
          .exec();
      })
    );

    let dateList = [];
    for (let i = 15; i >= 1; i--) {
      const dateTime = endTime - i * 24 * 60 * 60 * 1000;
      const date = new Date(dateTime).toLocaleDateString();
      dateList.push({
        date,
        dateTime
      });
    }

    dateList = dateList.map(item => {
      const { date, dateTime } = item;
      let obj = {
        date
      };
      result.forEach((item, index) => {
        obj[type[index]] = item.filter(
          value =>
            value.begin > dateTime &&
            value.begin < dateTime + 24 * 60 * 60 * 1000
        ).length;
      });
      return obj;
    });

    return dateList;
  }
  /**
   * *******************************************************************************************
   * @param body object es查询参数
   * @returns object  es查询结果
   * *******************************************************************************************
   */
  public async esSearch(body, type, projectToken) {
    if (!type) {
      return {
        hits: {
          hits: []
        }
      };
    }
    const { ctx } = this;

    let hits = [];
    if (Array.isArray(type)) {
      const result = await Promise.all(
        type.map(item => {
          let webModel = ctx.app.models[`Web${_.capitalize(item)}`](
            projectToken
          );
          return webModel
            .find({
              t: item
            })
            .exec();
        })
      );

      hits = result.reduce(
        (preValue, currentValue) => preValue.concat(currentValue),
        []
      );
    } else {
      let webModel = ctx.app.models[`Web${_.capitalize(type)}`](projectToken);
      hits =
        (await webModel
          .find({
            t: type
          })
          .exec()) || [];
    }

    return {
      hits: {
        hits: hits
      }
    };
    // TODO: 关了elasticsearch
    // return await this.app.elasticsearch.search({
    //   index: 'frontend-event-log-web-report-collect-*',
    //   type: '_doc',
    //   body
    // });
  }
  /**
   * *******************************************************************************************
   * @param filters array 过滤参数
   * @returns  object es过滤参数
   * *******************************************************************************************
   */
  public filterParams(filters) {
    let filterQuery: any[] = []; // 筛选过滤参数对象
    Object.keys(filters).map(item => {
      // 拼装es过滤参数
      const match = {};
      match[`${item}`] = filters[`${item}`];
      filterQuery = [...filterQuery, { match }];
    });
    return filterQuery;
  }
  /**
   * *******************************************************************************************
   * @param dimensions array 聚合名称
   * @param order string 聚合排序参数
   * @returns query objet es过滤参数
   * 注： 目前只取一个参数
   * *******************************************************************************************
   */
  public aggsDimensionQuery(dimensions, order, measures) {
    const aggsQuery: { pv?: any } = {};
    const name = dimensions[0];
    const aggs: { pv?: any; uv?: any } = {};
    measures.map(item => {
      if (item === "pv" || item === "uv") {
        if (item === "pv") {
          aggs.pv = {
            sum: {
              field: "pv"
            }
          };
        } else {
          aggs.uv = {
            cardinality: {
              field: "ip.keyword"
            }
          };
        }
      } else {
        if (item.includes("_")) {
          const values = item.split("_");
          aggs[item] = {
            [values[0]]: {
              field: `${values[1]}`
            }
          };
        } else {
          aggs[item] = {
            terms: {
              field: `${item}.keyword`
            }
          };
        }
      }
    });
    aggsQuery[name] = {
      terms: {
        field: `${name}.keyword`,
        order: {
          _count: order.toLowerCase()
        }
      },
      aggs
    };
    return aggsQuery;
  }
  /**
   * *******************************************************************************************
   * @param dimensions array 聚合名称
   * @param order string 聚合排序参数
   * @returns query objet es过滤参数
   * 注： 目前只取一个参数
   * *******************************************************************************************
   */
  public aggsIndicatorQuery(measures = [], intervalMillis) {
    console.log(measures, Array.isArray(measures));
    const aggs: { pv?: any; uv?: any } = {};
    measures.map(item => {
      if (item === "pv" || item === "uv") {
        if (item === "pv") {
          aggs.pv = {
            sum: {
              field: "pv"
            }
          };
        } else {
          aggs.uv = {
            cardinality: {
              field: "ip.keyword"
            }
          };
        }
      } else {
        if (item.includes("_")) {
          const values = item.split("_");
          aggs[item] = {
            [values[0]]: {
              field: `${values[1]}`
            }
          };
        } else {
          aggs[item] = {
            terms: {
              field: `${item}.keyword`
            }
          };
        }
      }
    });
    const aggsQuery = {
      indicator: {
        date_histogram: {
          field: "@timestamp",
          interval: intervalMillis,
          format: "yyyy-MM-dd hh:mm:ss",
          min_doc_count: 0
        },
        aggs
      }
    };
    return aggsQuery;
  }
}

module.exports = RetCodeService;
