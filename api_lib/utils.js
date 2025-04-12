import path from "path";
import { getConfig } from "./internal-config-helper.js";

function isInstanceOf(obj, _class){
    return obj instanceof _class
}


/**
 * Function for importing things from the base project folder of library user
 * 
 * Usage:
 * - `await dynamicBaseImport("file.js")`
 * - `await dynamicBaseImport("file.js", "variableName")`
 * @param {*} _path 
 * @param {*} varName 
 * @returns 
 */
export async function dynamicBaseImport(_path="", varName=undefined){
    let import_string = path.join(getConfig("baseProjectPath"), _path);
    try{
        
        if(typeof varName === "string"){
            return (await import(import_string))[varName];
        }
        return await import(import_string);

    }catch(e){
    }
}


export function trim(str, ch) {
  var start = 0, 
      end = str.length;

  while(start < end && str[start] === ch)
      ++start;

  while(end > start && str[end - 1] === ch)
      --end;

  return (start > 0 || end < str.length) ? str.substring(start, end) : str;
}




export async function getProjectSettings() {
    const { settings, default: def } = await dynamicBaseImport("settings.js");
    return (settings) ? settings : def;
}
