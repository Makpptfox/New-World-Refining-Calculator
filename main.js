const mkdirp = require('mkdirp');

const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');

const { v4: uuidv4 } = require('uuid');

const fs = require('fs');

const build = true

const path = require('path');

const {checkLang} = require("./script/lang/getLanguage");
const {getLangFiles} = require("./script/lang/getLanguage");
const {getDataFrom} = require("./script/xml");
const {getDataFiles} = require("./script/xml");

let jobData;
let materialsData;

let lang = "en-EN";

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
                createWindow();
                updaterWindows.destroy();
            })
        )
    })




}

function createWindow(){
    mainWindows = new BrowserWindow({
        width: 800,
        height: 400,
        autoHideMenuBar: true,
        webPreferences:{
            nodeIntegration: false, // is default value after Electron v5
            contextIsolation: true, // protect against prototype pollution
            enableRemoteModule: false, // turn off remote
            preload: path.join(__dirname, "/script/preload.js"), // use a preload script
            nativeWindowOpen: true
        }
    })

    mainWindows.loadFile('pages/index.html');

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
        autoUpdater.checkForUpdatesAndNotify();

    })

    if(!build) checkDataFile();

}

app.whenReady().then(() => {
    createLoader()

    app.on('activate', function () {
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })


})
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

ipcMain.on('getAllJobs', async (ipc)=>{

    console.log('receive getAllJobs');

    mainWindows.webContents.send('getAllJobsResponse', jobData);

})

ipcMain.on('getUID', (ipc)=>{

    mainWindows.webContents.send("returnUID", uuidv4());

})

/* IPC For all XML Functions */

ipcMain.on('getDataFrom', async (ipc, path)=>{

    console.log('execute getDataFrom function');

    await getDataFrom(path, (data) => {

        console.log('return of getDataFrom function');

        mainWindows.webContents.send('getDataFromResponse', data);

    })

})

ipcMain.on('getAllItems', async (ipc)=>{

    console.log('receive getAllItem');

    mainWindows.webContents.send('getAllItemsResponse', materialsData);

})

ipcMain.on("getLang", async (ipc, type, elem = null, key = -1)=>{

    console.log('execute getLang function');

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

            console.trace(elem);

            break;
        }
        case "rarity":{

            let rarity = langJob["rarity"][0][elem.name[0].toLowerCase()];

            if(rarity === undefined){

                rarity = `lang: ${lang} ${elem.name[0].toLowerCase()}`

            }

            mainWindows.send('getLangResponse', type, rarity, key);

            console.trace(rarity)

            break;
        }
        case "item":{
            let material = {
                name: "",
                id: elem.id,
                jobId: elem.jobId,
                image: elem.image,
                related: elem.related
            };

            console.trace(langMaterials);

            material.name = langMaterials["materials"][0][elem.name.toLowerCase()][0];

            if(material.name === undefined){
                material.name = `lang: ${lang} ${elem.name.toLowerCase()}`;
            }

            mainWindows.webContents.send('getLangResponse', type, material, key);

            console.trace(material);

            break;
        }
        case "ui":{
            console.trace(langUI["default"][0]);

            mainWindows.webContents.send('getLangResponse', type, langUI["default"][0], key);
        }

    }

})

ipcMain.on('getSavedTab', async (ipc)=>{

    console.log("getSavedTab");

    fs.access(process.cwd()+"/data/save/tabs.json", async (err) => {

        if(err !== null){

            console.error(err);

            let data = {
                "default":{
                    "data": []
                }
            }

            await mkdirp(process.cwd()+"/data/save/");
            fs.writeFile(process.cwd()+"/data/save/tabs.json", JSON.stringify(data), (err1)=>{

                console.log("writeFile");
                console.error(err1);

                mainWindows.webContents.send('getSavedTabResponse', data, false);

            })
        } else {

            fs.readFile(process.cwd()+"/data/save/tabs.json", (err1, data) => {

                mainWindows.webContents.send('getSavedTabResponse', JSON.parse(data.toString("utf-8")), true);

            })

        }



    })

})

ipcMain.on('deleteTab', (ipc, data)=>{

    console.log("deleteTab");

    fs.writeFile(process.cwd()+"/data/save/tabs.json", "", ()=>{
        mainWindows.webContents.send('deleteTabResponse');
    })

})

ipcMain.on('saveTab', (ipc, data)=>{

    console.log("saveTab");

    fs.writeFile(process.cwd()+"/data/save/tabs.json", JSON.stringify(data), ()=>{
        mainWindows.webContents.send('saveTabResponse');
    })

})


// Function for the auto-updater
ipcMain.on('installUpdate', (ipc)=>{
    autoUpdater.quitAndInstall();
})

ipcMain.on('openApp', (ipc)=>{

    checkDataFile();

})
