const {
    contextBridge,
    ipcRenderer
} = require("electron"),
    { v4: uuidv4 } = require('uuid');

/**
 * An array that contains ALL the valid send channels (security purposes)
 * @var
 *
 * @type {string[]}
 */
let validChannelsSend = ['getAllJobs', 'getDataFrom', 'getLang', 'getAllItems', "getUID", "installUpdate", "openApp",
    "getSavedTab", "saveTab", "deleteTab", "GetVersion", "GetUpdate", "StartTest", "closeApp", "minApp", "minSize", "maxSize", "restartApp",
    "getLanguage", 'getAutoUpdate', "setSettings", "clearTab", "getResize", "getMax"];

/**
 * An array that contains ALL the valid receive channels (security purposes)
 * @var
 *
 * @type {string[]}
 */
let validChannelsReceive = ["update_error", "update_available", "update_downloaded", "no_update",
    'getAllJobsResponse', 'getDataFromResponse', "getLangResponse", "getAllItemsResponse", "returnUID",
    "getSavedTabResponse", "deleteTabResponse", "StopTest", "maxSizeResponse", "minSizeResponse",
    "getLanguageResponse", "setAutoUpdate", 'getAutoUpdateResponse', "setSettingsResponse", "getResizeResponse", "getMaxResponse"];

let uuid = uuidv4();

contextBridge.exposeInMainWorld(
    "api", {
        /**
         * A function to send request to the main.js. (SYNC)
         * @function
         *
         *  @param channel the channel name define the event name you want to triggered in the main.js.
         *  @param args The list of variables you want to pass.
         */
        sendSync: (channel, ...args) => {
            if (validChannelsSend.includes(channel)) {
                return ipcRenderer.sendSync(channel, ...args);
            }
        },
        /**
         * A function to send request to the main.js. (ASYNC)
         * @function
         *
         *  @param channel the channel name define the event name you want to triggered in the main.js.
         *  @param args The list of variables you want to pass.
         */

        sendAsync: (channel, ...args)=>{
            if(validChannelsSend.includes(channel)){
                ipcRenderer.send(channel,...args);
                // Very useful function
            }
        },
        /**
         * A function to receive response from the main.js.
         * @function
         *
         *  @param channel The channel name defines the name of the event with which you want the callback to be activated.
         *  @param func The callback function.
         */
        receive: (channel, func) => {
            if (validChannelsReceive.includes(channel)) {
                ipcRenderer.on(channel, (event, ...args) => func(...args));
            }
        },
        /**
         * A function to receive the response ONCE from the main.js file.
         * @function
         *
         *  @param channel The channel name defines the name of the event with which you want the callback to be activated.
         *  @param func The callback function.
         */
        receiveOnce: (channel, func) => {

            if (validChannelsReceive.includes(channel)) {
                ipcRenderer.once(channel, (event, ...args) => func(...args));
            }
        },
        /**
         * A function to remove the event listeners.
         * @function
         *
         *  @param channel The channel name defines the name of the event with which you want the callback to be removed.
         *  @param func The callback function.
         */
        remove: (channel, func)=>{

            if(validChannelsReceive.includes(channel)){

                ipcRenderer.removeListener(channel, func);

            }

        },
        /**
         * A function to open a link in the web browser.
         * @function
         *
         *  @param url the website link.
         */
        openExternal: (url)=>{
            require("electron").shell.openExternal(url).then(()=>{});
        },
        /**
         * A variables define the local folder of the app.
         * @constant
         */
        cwd: process.cwd(),
        /**
         * A function to return a new generated UID.
         * @function
         */
        generateNewUid: ()=>{
            return genNewUID();
        },
        /**
         * A function to test the application.
         * @function
         */
        testApp: ()=>{

            // noinspection JSUnresolvedVariable
            api.sendAsync('GetVersion');
            // noinspection JSUnresolvedVariable
            api.sendAsync('GetUpdate');
            // noinspection JSUnresolvedVariable
            api.sendAsync('StartTest');

            // noinspection JSUnresolvedVariable
            api.receiveOnce('stopTest', (success)=>{

                return success;

            })

        }
    }

);


/**
 * Function needed for "generateNewUid()".
 * @function
 *
 * @returns {string}
 *
 * @see generateNewUid
 */
function genNewUID(){
    uuid = uuidv4();
    return uuid;
}
