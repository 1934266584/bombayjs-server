import { Subscription } from "egg";
const _ = require("lodash");

class DeleteMongoData extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      immediate: true,
      interval: "1d", // 1 分钟间隔
      type: "all" // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    const res = await this.service.project.getAllProjectList();
    res.forEach(project => {
      const token = project.token;
      const currentTime = Date.now();
      const saveType = [
        "api",
        "avg",
        "behavior",
        "duration",
        "error",
        "health",
        "msg",
        "percent",
        "perf",
        "pv",
        "res",
        "resource",
        "sum"
      ];
      saveType.forEach(type => {
        let webModel = this.ctx.app.models[`Web${_.capitalize(type)}`](token);
        try {
          webModel.deleteMany({
            begin: { $lt: currentTime - 15 * 24 * 3600 * 1000 }
          }).exec();
        } catch (error) {
         console.log(error)
        }
      });
    });
  }
}

export default DeleteMongoData;
