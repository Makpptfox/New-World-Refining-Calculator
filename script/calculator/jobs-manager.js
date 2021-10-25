
let actualJob;
let actualName;

// Function to get all jobs and load them in the menu bar
function loadJobs(){

    window.api.sendAsync('getAllJobs');

    window.api.receiveOnce('getAllJobsResponse', (data)=>{

        window.api.sendAsync('getDataFrom', data['jobs']);

    })

    window.api.receiveOnce('getDataFromResponse', (data)=>{

        data["jobs"].forEach(elem=>{

            window.api.sendAsync('getLang', "jobs", elem);

            window.api.receive("getLangResponse", (type, RElem)=>{
                if(type === "jobs" && elem.id === RElem.id){

                    actualName = RElem.name;

                    let template = document.getElementById('templateMenuBarItem');

                    let mainMenuBar = document.getElementById("mainMenuBar");

                    let clone = template.content.cloneNode(true);

                    let title = clone.querySelector("p.titleItem");
                    let button = clone.querySelector("div.menuBarItem");

                    button.addEventListener('click', ()=>{

                        _removeAllCat();
                        hideMainCat();

                        let mainMenuBar = document.getElementById("itemListBar");

                        mainMenuBar.innerText = "";

                        const titleBarTemplate = document.getElementById("templateMenuJobTitle");

                        const titleBar = titleBarTemplate.content.cloneNode(true);

                        const text = titleBar.querySelector("p.jobTitle");

                        window.api.sendAsync('getLang', "ui");

                        new Promise((resolve, reject) => {window.api.receiveOnce('getLangResponse', (type, data)=>{

                            if(type === "ui") {

                                text.innerText = data["titleItemBar"][0] + " " + RElem.name

                                resolve();

                            }

                        })}).then(()=>{

                            if(elem.cats !== ""){

                                for(const catKey in elem.cats){

                                    addCat(catKey, elem.cats[catKey]);
                                    console.log(catKey);

                                }

                                showMainCat();

                            }

                            mainMenuBar.appendChild(titleBar);

                            loadItemJobs(RElem.id);

                        })


                    })

                    title.innerText = RElem.name;


                    mainMenuBar.appendChild(clone);
                }
            })


        })

    })
}
// Function used to show items of a job when the user click on a job in the list
function loadItemJobs(jobId){
    let mainMenuBar = document.getElementById("itemListBar");

    actualJob = jobId;

    window.api.sendAsync('getAllItems');

    window.api.receiveOnce('getAllItemsResponse', async (data)=>{

        let materials = data['materials']

        for await (let material of materials){

            if(jobId.toString() === material.jobId){
                try {
                    await window.api.sendAsync('getLang', "item", material);

                    await new Promise((resolve, reject) => {
                        window.api.receiveOnce("getLangResponse", (type, RElem) => {
                            if (type === "item" && material.id === RElem.id) {

                                let template = document.getElementById('templateMenuJobItem');

                                let clone = template.content.cloneNode(true);

                                let title = clone.querySelector("p.titleItem");
                                let img = clone.querySelector("img.resourceIcon");

                                let button = clone.querySelector("div.buttonAddItem");


                                window.api.sendAsync('getLang', "ui");

                                new Promise((resolve1, reject) => {window.api.receiveOnce('getLangResponse', (type, data)=>{

                                    if(type === "ui") {

                                        button.innerText = data["addItem"][0]

                                        resolve1();

                                    }

                                })}).then(()=> {

                                    button.addEventListener("click", () => {

                                        addItem(RElem);

                                    });

                                    img.src = window.api.cwd + "/data/image/materials/" + RElem.image
                                    title.innerText = RElem.name;

                                    mainMenuBar.appendChild(clone);


                                    resolve();
                                })

                            }
                        })
                    })

                } catch (e){
                    console.error(e);
                }
            }


        }

    })



}

function _loadCatItem(idCat){
    let mainMenuBar = document.getElementById("itemListBar");

    mainMenuBar.innerText = "";

    const titleBarTemplate = document.getElementById("templateMenuJobTitle");

    const titleBar = titleBarTemplate.content.cloneNode(true);

    const text = titleBar.querySelector("p.jobTitle");

    window.api.sendAsync('getLang', "ui");

    new Promise((resolve, reject) => {window.api.receiveOnce('getLangResponse', (type, data)=>{

        if(type === "ui") {

            text.innerText = data["titleItemBar"][0] + " " + actualName

            resolve();

        }

    })}).then(()=>{

        mainMenuBar.appendChild(titleBar);
        loadCatItem(actualJob, idCat);


    })

}
function loadCatItem(jobId, idCat){
    let mainMenuBar = document.getElementById("itemListBar");

    window.api.sendAsync('getAllItems');

    window.api.receiveOnce('getAllItemsResponse', async (data)=>{

        let materials = data['materials']

        for await (let material of materials){

            if(material['cat'] !== undefined) {
                if (jobId.toString() === material.jobId && idCat.toString() === material.cat) {
                    try {
                        await window.api.sendAsync('getLang', "item", material);

                        await new Promise((resolve, reject) => {
                            window.api.receiveOnce("getLangResponse", (type, RElem) => {

                                console.trace(RElem);

                                if (type === "item" && material.id === RElem.id) {

                                    let template = document.getElementById('templateMenuJobItem');

                                    let clone = template.content.cloneNode(true);

                                    let title = clone.querySelector("p.titleItem");
                                    let img = clone.querySelector("img.resourceIcon");

                                    let button = clone.querySelector("div.buttonAddItem");


                                    window.api.sendAsync('getLang', "ui");

                                    new Promise((resolve1, reject) => {
                                        window.api.receiveOnce('getLangResponse', (type, data) => {

                                            if (type === "ui") {

                                                button.innerText = data["addItem"][0]

                                                resolve1();

                                            }

                                        })
                                    }).then(() => {

                                        button.addEventListener("click", () => {

                                            addItem(RElem);

                                        });

                                        img.src = window.api.cwd + "/data/image/materials/" + RElem.image
                                        title.innerText = RElem.name;

                                        mainMenuBar.appendChild(clone);


                                        resolve();
                                    })

                                }
                            })
                        })

                    } catch (e) {
                        console.error(e);
                    }
                }
            }


        }

    })
}

// Load jobs
loadJobs();
