import { Application } from "egg";

module.exports = (app: Application) => {
  const apiV1Router = app.router.namespace("/api/v1");
  const { controller, middleware } = app;
  const { index, report, retcode } = controller.web;
  // const { index, report } = controller.web;

  const tokenRequired = middleware.tokenRequired();
  apiV1Router.get("/web", tokenRequired, index.index);
  // 浏览器用户数据上报
  apiV1Router.post("/report/web", report.create);
  apiV1Router.post("/retcode/web", retcode.list);
  apiV1Router.post("/details/web", retcode.search);
  // 概览的内容接口 （总的统计数）
  apiV1Router.post("/dashboard/countLog", retcode.countLogs);
  // 概览的内容接口
  apiV1Router.post("/dashboard/countLogIn15", retcode.countLogsInSeven);
};
