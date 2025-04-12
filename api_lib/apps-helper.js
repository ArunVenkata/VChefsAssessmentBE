import { getProjectSettings, trim } from "./utils.js";
import { getConfig } from "./internal-config-helper.js";
import path from "path";



export function getAppFolderPath(baseProjectPath, dotPath){

    
    const newPath = trim(dotPath, ".").replace(/\./g,"/");
    return path.join(baseProjectPath, newPath)
}

export async function getAppPaths(){
    const settings = await getProjectSettings()
    const app_dotpaths = settings.APPS
    const baseProjectPath = getConfig("baseProjectPath");
    
    // from app dot path, get the app path
    // if urls.js doesn't exist, it is not an app
    console.log(getConfig("baseProjectPath"));

    return app_dotpaths.map((_path) => getAppFolderPath(baseProjectPath, _path))
}

