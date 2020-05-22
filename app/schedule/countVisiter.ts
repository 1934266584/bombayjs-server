import { Subscription } from "egg";

class CountVisiter extends Subscription {
  // 通过 schedule 属性来设置定时任务的执行间隔等配置
  static get schedule() {
    return {
      immediate: true,
      interval: "1m", // 1 分钟间隔
      type: "all" // 指定所有的 worker 都需要执行
    };
  }

  // subscribe 是真正定时任务执行时被运行的函数
  async subscribe() {
    // const res = await this.service.web.retcode.getCountOfLogsInSeven({
    //   projectToken: "wnrnhkh1585620953820"
    // });
  }
}

export default CountVisiter;
