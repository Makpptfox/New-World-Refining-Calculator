const {
    contextBridge,
    ipcRenderer
} = require("electron");

const child_process = require('child_process');


const { v4: uuidv4 } = require('uuid');

let validChannelsSend = ['getAllJobs', 'getDataFrom', 'getLang', 'getAllItems', "getUID", "installUpdate", "openApp",
    "getSavedTab", "saveTab", "deleteTab", "GetVersion", "GetUpdate", "StartTest", "closeApp", "minApp", "minSize", "maxSize", "restartApp",
    "getLanguage", 'getAutoUpdate', "setSettings"];
let validChannelsReceive = ["update_error", "update_available", "update_downloaded", "no_update",
    'getAllJobsResponse', 'getDataFromResponse', "getLangResponse", "getAllItemsResponse", "returnUID",
    "getSavedTabResponse", "deleteTabResponse", "StopTest", "maxSizeResponse", "minSizeResponse",
    "getLanguageResponse", "setAutoUpdate", 'getAutoUpdateResponse', "setSettingsResponse"];

let uuid = uuidv4();

contextBridge.exposeInMainWorld(
    "api", {
        sendSync: (channel, data) => {
            if (validChannelsSend.includes(channel)) {
                return ipcRenderer.sendSync(channel, data);
            }
        },
        sendAsync: (channel, ...args)=>{
            if(validChannelsSend.includes(channel)){
                ipcRenderer.send(channel,...args);
                // This is a stupid comment
            }
        },
        receive: (channel, func) => {
            if (validChannelsReceive.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        receiveOnce: (channel, func) => {

            if (validChannelsReceive.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
        },
        remove: (channel, func)=>{

            if(validChannelsReceive.includes(channel)){

                ipcRenderer.removeListener(channel, func);

            }

        },
        openExternal: (url)=>{
            require("electron").shell.openExternal(url);
        },
        cwd: process.cwd(),
        generateNewUid: ()=>{
            return genNewUID();
        },
        uid: uuid,
        testApp: ()=>{

            api.sendAsync('GetVersion');
            api.sendAsync('GetUpdate');
            api.sendAsync('StartTest');

            api.receiveOnce('stopTest', (success)=>{

                return success;

            })

        }
    }

);

function genNewUID(){
    uuid = uuidv4();
    return uuid;
}
