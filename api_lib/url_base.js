import { dynamicBaseImport } from "./utils.js";
import { APIWrapper } from "./pre_register.js";
import { getConfig } from "./internal-config-helper.js";
import { getAppFolderPath } from "./apps-helper.js";
import path from "path";


export async function registerRoutes({express_app, app_path="", urlPrefix=""}) {
  const urls = await dynamicBaseImport(path.join(app_path, "urls.js"), "urls");

  for (let _urlConf of urls) {
    const _api = _urlConf.data;
    if(_urlConf.app){
      await registerRoutes({express_app, app_path: getAppFolderPath("", _urlConf.app), urlPrefix: _api.name})
      continue
    }
    let routeHandler = APIWrapper(_api.routeHandler);
    routeHandler = new routeHandler()
    // if url has app, call registerroutes function with app_path set to appname from app and urlPrefix set to url.name
    if (routeHandler.methods.includes("GET")) {
      express_app.get(path.join(urlPrefix, _api.url), routeHandler.GET.bind(routeHandler));
      
      let queryIdName = `${_api.name}_id`
      express_app.get(path.join(urlPrefix, _api.url) + `/:${queryIdName}`, routeHandler.GET.bind(routeHandler));
      routeHandler.queryIdName =  queryIdName
    }
    if (routeHandler.methods.includes("POST")) {
      express_app.post(path.join(urlPrefix, _api.url), routeHandler.POST.bind(routeHandler));
    }
    if (routeHandler.methods.includes("DELETE")) {
      express_app.delete(path.join(urlPrefix, _api.url) + `/:${_api.name}_id`, routeHandler.DELETE.bind(routeHandler));
    }
    if (routeHandler.methods.includes("PATCH")){
      express_app.patch(path.join(urlPrefix, _api.url) + `/:${_api.name}_id`, routeHandler.PATCH.bind(routeHandler));
    }
  }
}




