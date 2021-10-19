const {
    contextBridge,
    ipcRenderer
} = require("electron");

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object

let validChannelsSend = ['getAllJobs', 'getDataFrom', 'getLang', 'getAllItems', "getUID", "installUpdate", "openApp"];
let validChannelsReceive = ["update_error", "update_available", "update_downloaded", "no_update",
    'getAllJobsResponse', 'getDataFromResponse', "getLangResponse", "getAllItemsResponse", "returnUID"];

contextBridge.exposeInMainWorld(
    "api", {
        sendSync: (channel, data) => {
            // whitelist channels
            if (validChannelsSend.includes(channel)) {
                return ipcRenderer.sendSync(channel, data);
            }
        },
        sendAsync: (channel, ...args)=>{
            // whitelist channels
            if(validChannelsSend.includes(channel)){
                ipcRenderer.send(channel,...args);
                console.log("Send Async request: "+channel+" args: "+args);
            }
        },
        receive: (channel, func) => {
            if (validChannelsReceive.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        receiveOnce: (channel, func) => {

            if (validChannelsReceive.includes(channel)) {
                // Deliberately strip event as it includes `sender`
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
        },
        cwd: process.cwd(),

        importSortable: (callback)=>{

            let Sortable = require('sortablejs');

            callback(Sortable);

        }
    }

);
