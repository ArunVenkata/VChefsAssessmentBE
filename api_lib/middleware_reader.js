import { dynamicBaseImport, getProjectSettings } from "./utils.js"

async function getMiddlewares() {
    // file path: src/middleware.js
    // settings file
    // Look for a file named middleware.js in the main project folder
    const { MIDDLEWARES } = await getProjectSettings();
    const middlewareList = [];
    for (let _middlewarePath of MIDDLEWARES || []) {
        const middlewareName = _middlewarePath;
        const importedMiddleware = await dynamicBaseImport("middleware.js", middlewareName);
        if (importedMiddleware){
            middlewareList.push(importedMiddleware);

        }else{
            console.error(`Middleware '${middlewareName}' not found`)
        }
    }

    console.log("Middlewares: ", middlewareList.length);

    return middlewareList;
}


export async function registerMiddlewares(express_app) {
    const middlewareList = await getMiddlewares();

    for (let _middlewareFunc of middlewareList) {
        express_app.use(_middlewareFunc)
    }
}
