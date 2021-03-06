const mkdirp = require('mkdirp');

const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

const { v4: uuidv4 } = require('uuid');

const fs = require('fs');

const path = require('path');

const {checkLang} = require("./script/lang/getLanguage");
const {getLangFiles} = require("./script/lang/getLanguage");
const {getDataFrom} = require("./script/xml");
const {getDataFiles} = require("./script/xml");

let jobData;
let materialsData;

let lang = "en-EN";
let autoUpdate = true;
let canResize = false;

let windowWidth = 1600;
let windowHeight = 800;

let windowMax = false;

let langJob;
let langMaterials;
let langUI;

let updaterWindows;
let mainWindows;


autoUpdater.on('error', (err)=>{
    updaterWindows.webContents.send('update_error', err);
})
autoUpdater.on('update-available', () => {
    updaterWindows.webContents.send('update_available');
});
autoUpdater.on('update-downloaded', () => {
    updaterWindows.webContents.send('update_downloaded');
});
autoUpdater.on('update-not-available', ()=>{

    checkDataFile();
})

async function checkDataFile(){

    let promises = []

    new Promise((resolve, reject) => {
        checkLang(()=>{
            resolve();
        })
    }).then(()=>{

        promises.push(new Promise(async (resolveJob, reject) => {
            await getDataFiles("jobs", async (data)=>{
                let jobPromises = []
                jobPromises.push(new Promise(((resolve, reject) => {
                    getLangFiles("jobs",lang, (data)=>{
                        if(!data) {
                            resolve();
                            return;
                        }

                        langJob = data["lang"];
                        resolve();
                    })
                })))
                Promise.all(jobPromises).then(
                    ()=>{
                        jobData = data;
                        resolveJob();
                    }
                )
            });
        }));
        promises.push(new Promise(async (resolveMaterials, reject)=>{
            await getDataFiles("materials", async (data)=>{
                await getDataFrom(data['materials'], (data)=>{
                    materialsData = data;

                    let materialsPromises = [];

                    materialsPromises.push(new Promise(async (resolve, reject)=>{
                        getLangFiles("materials",lang, (data)=>{

                            if(!data) {
                                resolve();
                                return;
                            }

                            langMaterials = data["lang"];
                            resolve();
                        })
                    }))
                    Promise.all(materialsPromises).then(()=>{
                        resolveMaterials();
                    })
                })
            })
        }))

        promises.push(
            new Promise((resolve, reject) => {
                getLangFiles("ui",lang, (data)=>{

                    if(!data) {
                        resolve();
                        return;
                    }
                    langUI = data["lang"];
                    resolve();
                })
            }).then(()=>{
                createWindow(windowWidth, windowHeight);
                updaterWindows.destroy();
            })
        )
    })




}

function createWindow(width = 1600, height = 800){


    if(!canResize){
        mainWindows = new BrowserWindow({
            autoHideMenuBar: true,
            minWidth: 1600,
            minHeight: 800,
            width: width,
            height: height,
            webPreferences:{
                nodeIntegration: false, // is default value after Electron v5
                contextIsolation: true, // protect against prototype pollution
                enableRemoteModule: false, // turn off remote
                preload: path.join(__dirname, "/script/preload.js"), // use a preload script
                nativeWindowOpen: true
            },
            titleBarStyle: 'hidden'
        })
    } else {
        mainWindows = new BrowserWindow({
            autoHideMenuBar: true,
            width: width,
            height: height,
            webPreferences:{
                nodeIntegration: false, // is default value after Electron v5
                contextIsolation: true, // protect against prototype pollution
                enableRemoteModule: false, // turn off remote
                preload: path.join(__dirname, "/script/preload.js"), // use a preload script
                nativeWindowOpen: true
            },
            titleBarStyle: 'hidden'
        })
    }

    mainWindows.loadFile('pages/index.html');

    mainWindows.on('unmaximize', (e)=>{

        mainWindows.webContents.send('minSizeResponse');

        e.returnValue = null;
    })
    mainWindows.on('maximize', (e)=>{

        mainWindows.webContents.send('maxSizeResponse');

        e.returnValue = null;
    })
    let handleRedirect = (e, url) => {
        if(url !== webContents.getURL()) {
            e.preventDefault()
            require('electron').shell.openExternal(url)
        }
    }

    mainWindows.webContents.on('will-navigate', handleRedirect)
    mainWindows.webContents.on('new-window', handleRedirect)

    mainWindows.once("close", async (e)=>{

        e.preventDefault();
        let tmpWidth = mainWindows.getSize()[0],
            tmpHeight = mainWindows.getSize()[1];
        if(await mainWindows.isMaximized()) {
            tmpWidth = windowWidth;
            tmpHeight = windowHeight;
        }

        console.log(tmpWidth)
        console.log(tmpHeight)

        let tmpMax = mainWindows.isMaximized();

        let setting = {
            "settings":
                {
                    "lang": lang,
                    "autoupdate": autoUpdate,
                    "maximize": tmpMax,
                    "canResize": canResize,
                    "size": {
                        "width": tmpWidth,
                        "height": tmpHeight
                    }
                }
        }

        await fs.writeFile(app.getPath('userData')+'/data/settings.json', JSON.stringify(setting), ()=>{

            console.info("Set setting: done!");

            mainWindows.close();

        })

    })

    mainWindows.once('ready-to-show', ()=>{

        if(windowMax){
            mainWindows.maximize();
            mainWindows.webContents.send('maxSizeResponse');
        } else {
            mainWindows.center();
        }

    })

}
function createLoader(){
    updaterWindows = new BrowserWindow({
        width: 300,
        height: 400,
        autoHideMenuBar: true,
        webPreferences:{
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "/script/preload.js"), // use a preload script
            nativeWindowOpen: true
        },
        maximizable: false,
        fullScreenable: false,
        closable: false,
        resizable: false,
        movable: false,
        menuBarVisible: false,
        frame: false
    })

    updaterWindows.loadFile('pages/update.html');

    updaterWindows.once("ready-to-show", ()=>{

        fs.access(app.getPath('userData')+"/data/settings.json", async (err) => {

            if (err !== null) {

                console.error(err);

                let data = {
                    "settings":
                        {
                            "lang": "en-EN",
                            "autoupdate": true,
                            "maximize": false,
                            "canResize": false,
                            "size": {
                                "width": 1600,
                                "height": 800
                            }
                        }
                }

                await mkdirp(app.getPath('userData') + "/data/");
                fs.writeFile(app.getPath('userData') + "/data/settings.json", JSON.stringify(data), (err1) => {

                    autoUpdater.checkForUpdatesAndNotify();

                })
            } else {

                fs.readFile(app.getPath('userData') + "/data/settings.json", async (err1, data) => {

                    let result = JSON.parse(data.toString("utf-8"))

                    let setting = result['settings']

                    lang = setting['lang'];
                    autoUpdate = setting['autoupdate'];

                    if(setting['maximize'] === undefined) { //Change variable for each new version of settings.json
                        let data = {
                            "settings":
                                {
                                    "lang": lang,
                                    "autoupdate": autoUpdate,
                                    "maximize": false,
                                    "canResize": false,
                                    "size": {
                                        "width": 1600,
                                        "height": 800
                                    }
                                }
                        }

                        await mkdirp(app.getPath('userData') + "/data/");
                        await fs.writeFile(app.getPath('userData') + "/data/settings.json", JSON.stringify(data), (err1) => {

                            app.relaunch();
                            app.exit();

                        })
                    }


                    canResize = setting['canResize'];
                    windowWidth = setting['size']['width'];
                    windowHeight = setting['size']['height'];
                    windowMax = setting['maximize']

                    if (!autoUpdate) {

                        await checkDataFile()

                    } else {

                        await autoUpdater.checkForUpdatesAndNotify();

                    }
                })

            }
        });

    })


}

app.whenReady().then(() => {
    process.setMaxListeners(0)
    createLoader()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })

})
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('getAllJobs', async (ipc)=>{

    mainWindows.webContents.send('getAllJobsResponse', jobData);

})

ipcMain.on('getUID', (ipc)=>{

    mainWindows.webContents.send("returnUID", uuidv4());

})

/* IPC For all XML Functions */

ipcMain.on('getDataFrom', async (ipc, path)=>{

    await getDataFrom(path, (data) => {

        mainWindows.webContents.send('getDataFromResponse', data);

    })

})

ipcMain.on('getAllItems', async (ipc)=>{

    mainWindows.webContents.send('getAllItemsResponse', materialsData);

})

ipcMain.on("getLang", async (ipc, type, elem = null, key = -1)=>{

    switch (type) {

        case "jobs":{

            let job = {
                name: "",
                id: elem.id
            };

            job.name = langJob["jobs"][0][elem.name.toLowerCase()];

            if(job.name === undefined){
                job.name = `lang: ${lang} ${elem.name.toLowerCase()}`;
            }

            mainWindows.webContents.send('getLangResponse', type, job);

            break;
        }
        case "rarity":{

            let rarity = langJob["rarity"][0][elem.name[0].toLowerCase()];

            if(rarity === undefined){

                rarity = `lang: ${lang} ${elem.name[0].toLowerCase()}`

            }

            mainWindows.send('getLangResponse', type, rarity, key);

            break;
        }
        case "item":{
            let material = {
                name: "",
                id: elem.id,
                jobId: elem.jobId,
                image: elem.image,
                related: elem.related,
                cat: elem.cat
            };

            material.name = langMaterials["materials"][0][elem.name.toLowerCase()];


            if(material.name === undefined){
                material.name = `lang: ${lang} ${elem.name.toLowerCase()}`;
            }

            mainWindows.webContents.send('getLangResponse', type, material, key);

            break;
        }
        case "ui":{

            mainWindows.webContents.send('getLangResponse', type, langUI["default"][0], key);
        }

    }

})

ipcMain.on('getSavedTab', async (ipc)=>{

    fs.access(app.getPath('userData')+"/data/save/tabs.json", async (err) => {

        if(err !== null){

            console.error(err);

            let data = {
                "default":{
                    "data": []
                }
            }

            await mkdirp(app.getPath('userData')+"/data/save/");
            fs.writeFile(app.getPath('userData')+"/data/save/tabs.json", JSON.stringify(data), (err1)=>{

                mainWindows.webContents.send('getSavedTabResponse', data, false);

            })
        } else {

            fs.readFile(app.getPath('userData')+"/data/save/tabs.json", (err1, data) => {

                mainWindows.webContents.send('getSavedTabResponse', JSON.parse(data.toString("utf-8")), true);

            })

        }



    })

})

ipcMain.on('deleteTab', (ipc, data)=>{

    fs.writeFile(app.getPath('userData')+"/data/save/tabs.json", "", ()=>{
        mainWindows.webContents.send('deleteTabResponse');
    })

})

ipcMain.on('saveTab', (ipc, data)=>{

    fs.writeFile(app.getPath('userData')+"/data/save/tabs.json", JSON.stringify(data), ()=>{
        mainWindows.webContents.send('saveTabResponse');
    })

})

ipcMain.on('clearTab', async (ipc)=>{

    let data = {
        "default":{
            "data": []
        }
    }

    await mkdirp(app.getPath('userData')+"/data/save/");
    fs.writeFile(app.getPath('userData')+"/data/save/tabs.json", JSON.stringify(data), (err1)=>{

        app.relaunch();
        app.exit();

    })
})

ipcMain.once('closeApp', (ipc)=>{

    mainWindows.close();

})

ipcMain.on('minApp', (ipc)=>{

    mainWindows.minimize();

})

ipcMain.on('maxSize', (ipc)=>{

    mainWindows.maximize();

})

ipcMain.on('minSize', (ipc)=>{

    mainWindows.unmaximize();

})

ipcMain.once('restartApp', (ipc)=>{

    app.relaunch();
    app.exit();

})

ipcMain.on('getLanguage', (ipc)=>{

    checkLang((langs)=>{

        let langsList = [];

        for(const langElem of langs){

            let data = {
                string: langUI["default"][0][langElem][0],
                id: langElem
            }

            langsList.push(data)

        }
        mainWindows.webContents.send('getLanguageResponse', {'chosen': lang, 'langs': langsList});

    })

})

ipcMain.on('getAutoUpdate', (ipc)=>{

    mainWindows.webContents.send('getAutoUpdateResponse', autoUpdate);

});

ipcMain.on('getResize', (ipc)=>{

    mainWindows.webContents.send('getResizeResponse', {canResize: canResize, width: windowWidth, height: windowHeight});

})

ipcMain.on('getMax', (ipc)=>{
    mainWindows.webContents.send('getMaxResponse', windowMax);
})

ipcMain.on('setSettings', (ipc, setting) =>{

    fs.writeFile(app.getPath('userData')+'/data/settings.json', JSON.stringify(setting), ()=>{

        mainWindows.webContents.send('setSettingsResponse');

    })

})

// Function for the auto-updater
ipcMain.on('installUpdate', (ipc)=>{
    autoUpdater.quitAndInstall();
})

ipcMain.on('openApp', (ipc)=>{

    checkDataFile();

})
