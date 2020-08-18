import { Service } from "egg";

export default class TransferJavaService extends Service {
  // 发请求到后台java层，推送到kafaka
  async reportMessageToJava(request, projectObject) {
    const { t, body = {}, needPushtoKafaka = "false" } = request;

    if (needPushtoKafaka && needPushtoKafaka === "true") {
      const includes = [
        "behavior",
        "pv",
        "app.click",
        "searchBehavior",
        "collectBehavior"
      ];

      if (includes.includes(t)) {
        let params = request;
        if (t === "behavior") {
          if (body.behavior.type === "ui.click") {
            params = {
              ...request,
              t: body.behavior.type,
              ...body.behavior.data
            };
          } else {
            return;
          }
        }
        // 这里发网络请求到后台
        const ctx = this.ctx;

        const result = await ctx.curl(
          "https://rent-pre.zoomlion.com/portalapi/portalhome/v1/userBehavior/add",
          {
            // 必须指定 method
            method: "POST",
            data: {
              behaviorRequest: JSON.stringify({
                projectName: projectObject.project_name,
                ...params,
                deviceBrowser: JSON.parse(params.deviceBrowser),
                deviceModel: JSON.parse(params.deviceModel),
                deviceOs: JSON.parse(params.deviceOs),
                deviceEngine: JSON.parse(params.deviceEngine),
                user: JSON.parse(params.user)
              })
            },
            // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
            dataType: "json"
          }
        );
        console.log(22222, result.data);
      }
    }
  }

  async reportMessageToJavaByList(requestList, projectObject) {
    let behaviorBatchRequest = requestList.map(request => {
      const { t, body = {}, needPushtoKafaka = "false" } = request;

      if (needPushtoKafaka && needPushtoKafaka === "true") {
        const includes = [
          "behavior",
          "pv",
          "app.click",
          "searchBehavior",
          "collectBehavior"
        ];

        if (includes.includes(t)) {
          let params = request;
          if (t === "behavior") {
            if (body.behavior.type === "ui.click") {
              params = {
                ...request,
                t: body.behavior.type,
                ...body.behavior.data
              };
            } else {
              return "";
            }
          }
          return {
            projectName: projectObject.project_name,
            ...params,
            deviceBrowser: JSON.parse(params.deviceBrowser),
            deviceModel: JSON.parse(params.deviceModel),
            deviceOs: JSON.parse(params.deviceOs),
            deviceEngine: JSON.parse(params.deviceEngine),
            user: JSON.parse(params.user)
          };
        } else {
          return "";
        }
      } else {
        return "";
      }
    });

    behaviorBatchRequest = behaviorBatchRequest.filters(item => item);

    // 这里发网络请求到后台
    const ctx = this.ctx;

    const result = await ctx.curl(
      "https://rent-pre.zoomlion.com/portalapi/portalhome/v1/userBehavior/addBatch",
      {
        // 必须指定 method
        method: "POST",
        data: {
          behaviorBatchRequest
        },
        // 明确告诉 HttpClient 以 JSON 格式处理返回的响应 body
        dataType: "json"
      }
    );
    console.log(22222, result.data);
  }
}
