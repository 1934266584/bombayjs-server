# BOMBAYJS-SERVER

此项目是bombayjs后台服务端

采用eggjs + mongodb + redis + kafka + elk架构

bombayjs是前端监控解决方案，包括bombayjs、bombayjs-server、bombayjs-admin三个项目

项目地址：

* https://github.com/bombayjs/bombayjs (web sdk)
* https://github.com/bombayjs/bombayjs-server (服务端，用于提供api)
* https://github.com/bombayjs/bombayjs-admin （后台管理系统，可视化数据等）

## QuickStart

### Development

```bash
$ npm i
$ npm run dev
$ open http://localhost:7002/
```

Don't tsc compile at development mode, if you had run `tsc` then you need to `npm run clean` before `npm run dev`.

### Deploy

```bash
$ npm run tsc
$ npm start
```

### Npm Scripts

- Use `npm run lint` to check code style
- Use `npm test` to run unit test
- se `npm run clean` to clean compiled js at development mode once

### Requirement

- Node.js 8.x
- Typescript 2.8+

### 功能列表

**管理功能**

* 登录注册
* 应用管理
* 用户管理(邀请体系) 角色：管理员 运营 开发
* 报警预警


**web api**
* 上报
* pvuv
* error
* 性能
* 用户轨迹
* 


**wx api**


先进入router.ts 路由分发

再到router文件下对应的各个文件，文件再把对应的接口和请求方式分发的controller,其中可能还会加对应的中间层

controller再调用对应的service服务

service再处理逻辑并调用对应的graphql做数据库的查询

graphql定义查询返回的字段

model定义返回字段的详情

extend 是自己添加的一些公共方法

schedule 定时任务更新用户的位置，与elasticsearch结合使用


*** TODO ***

后续优化的方向
1、数据的筛选，因为数据量比较大，业界通用的方案是利用elasticsearch搜索数据库来进行数据的存储和筛选
```
### elasticsearch  Kibana
安装：
  https://www.elastic.co/guide/cn/elasticsearch/guide/cn/running-elasticsearch.html
启动 
  ./bin/elasticsearch
  ./bin/kibana
```

2、也可以用kafka来进行相关的动作数据流（通常应该是不需要用的）
```
### kafka -- mac
安装
brew install kafka
启动zookeeper
zookeeper-server-start /usr/local/etc/kafka/zookeeper.properties 
启动kafka
kafka-server-start /usr/local/etc/kafka/server.properties 
```

3、永久性存储
最终建议存储到mysql中，数据也更好的统计及前端的展示，建议通过的用户相关信息和错误相关信息再加运行环境进行md5，这样利于mysql最终数据的统计


### NOTICE
不同的环境配置需要修改的地方
1、config/bombay.config 中的
```
##Mongodb 地址 (修改MONGO的地址)
MONGO_URI=mongodb://127.0.0.1:27017/bombayjs
```

2、config/config.default.ts 中
```
  // mongodb 服务
  config.mongoose = {
    client: {
      url: MONGO_URI,
      options: {
        // 连接需要的账号和密码
        // auth: {
        //   user: "bombayjs",
        //   password: "bombayjs.113"
        // },
        poolSize: 20
      }
    }
  };
```

3、修改app/service/transferJava.ts中的转发给后台的地址
```
const result = await ctx.curl(
  // 请求路径地址修改
  "https://rent-pre.zoomlion.com/portalapi/portalhome/v1/userBehavior/addBatch",
  {
    // 必须指定 method
    method: "POST",
    data: {
      behaviorBatchRequest: JSON.stringify(behaviorBatchRequest)
    },
    // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
    dataType: "json"
  }
);
```


