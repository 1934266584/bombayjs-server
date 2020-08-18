import { Application } from "egg";

module.exports = (app: Application) => {
  const { router, controller } = app;
  const { index } = controller.wx;
  // 用户列表
  router.get("/portal-bombay/wx", index.index);
};
