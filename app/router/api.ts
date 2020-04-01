import { Application } from 'egg';

module.exports = (app: Application) => {
  const apiV1Router = app.router.namespace('/api/v1');
  const { controller, middleware } = app;
  const { user, web, project, eventVariate, pageVariate, measure, dimension, group, } = controller;
  const jwt = middleware.jwt();
  // 用户
  apiV1Router.get('/user/admin', user.index);
  apiV1Router.get('/user/currentUser', jwt, user.currentUser);
  apiV1Router.post('/user/register', user.register);
  apiV1Router.post('/user/login', user.login);
  apiV1Router.post('/user/logout', jwt, user.logout);
  apiV1Router.post('/user/setIsUse', jwt, user.setIsUse);
  apiV1Router.post('/user/delete', user.delete);

  // // ----------------应用配置相关---------------
  // // 新增应用
  apiV1Router.post('/project/add', jwt, project.addNewProject);
  // // 修改应用
  apiV1Router.post('/project/update', jwt, project.updateProject);
  // // 根据用户ID获得应用信息
  apiV1Router.get('/project/getProjectsForUserId', jwt, project.getProjectsForUserId);
  // // 根据应用ID获得单个应用信息
  apiV1Router.get('/project/getProjectsForId', jwt, project.getProjectsForId);
  // // 获得应用列表
  apiV1Router.get('/project/web/list', jwt, project.getWebProjectList);
  // // 删除应用中某个用户
  apiV1Router.post('/project/deleteUser', jwt, project.deleteWebProjectUser);
  // // 新增应用中某个用户
  apiV1Router.post('/project/addUser', jwt, project.addWebProjectUser);
  // // 删除某个应用
  apiV1Router.post('/project/delete', jwt, project.deleteProject);
  // // 日报邮件操作
  apiV1Router.post('/project/handleDaliyEmail', jwt, project.handleDaliyEmail);

  // // ----------------事件变量相关---------------
  apiV1Router.post('/eventvariate/get', jwt, eventVariate.get);
  apiV1Router.post('/eventvariate/set', jwt, eventVariate.set);
  apiV1Router.post('/eventvariate/delete', jwt, eventVariate.set);
  apiV1Router.post('/eventvariate/list', jwt, eventVariate.list);

  // // ----------------页面变量相关---------------
  apiV1Router.post('/pagevariate/get', jwt, pageVariate.get);
  apiV1Router.post('/pagevariate/set', jwt, pageVariate.set);
  apiV1Router.post('/pagevariate/delete', jwt, pageVariate.set);
  apiV1Router.post('/pagevariate/list', jwt, pageVariate.list);

  // // ----------------指标相关---------------
  apiV1Router.post('/measure/list', jwt, measure.list);

  // // ----------------维度相关---------------
  apiV1Router.post('/dimension/list', jwt, dimension.list);
  apiV1Router.post('/dimension/get', jwt, dimension.get);

  // // ----------------分群相关---------------
  apiV1Router.post('/group/get', jwt, group.get);

  // // ----------------web相关---------------
  // // 获取error
  apiV1Router.post('/web/error/list', jwt, web.error.list);
  apiV1Router.post('/web/error/filterList', jwt, web.error.filterList);
};
