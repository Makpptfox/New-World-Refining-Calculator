let addedItem = {};

let abortEvent = new AbortController();

let availableItem = [];

Object.size = function(obj) {
    let size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

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
                    let template = document.getElementById('templateMenuBarItem');

                    let mainMenuBar = document.getElementById("mainMenuBar");

                    let clone = template.content.cloneNode(true);

                    let title = clone.querySelector("p.titleItem");
                    let button = clone.querySelector("div.menuBarItem");

                    button.addEventListener('click', ()=>{
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
function loadItemJobs(jobId){
    let mainMenuBar = document.getElementById("itemListBar");

    window.api.sendAsync('getAllItems');

    window.api.receiveOnce('getAllItemsResponse', async (data)=>{

        let materials = data['materials']

        availableItem = [];

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

                                    let itemDataList = {};

                                    itemDataList[RElem.id] = RElem;

                                    availableItem.push(itemDataList);

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

async function addItem(elem) {

    let personnal = elem;

    let related = personnal.related;

    let containerParent = document.getElementById("itemListContainer");

    let templateOrigin = document.getElementById("templateItemCount");
    let templateRelated = document.getElementById("templateRelatedItemCount");

    let cloneOrigin = templateOrigin.content.cloneNode(true);

    let originImage = cloneOrigin.querySelector("img.imgFirstItem");
    let originCounter = cloneOrigin.querySelector("div.itemCount");
    let originNumber = cloneOrigin.querySelector("input.inputNumberItem");
    let originID = cloneOrigin.querySelector('div.FirstItem');

    let dragZone = cloneOrigin.querySelector('img.dragZone');

    dragZone.src = window.api.cwd+"/data/image/ui/drag.png";

    originNumber.value = 1;
    originImage.src = window.api.cwd+"/data/image/materials/" + personnal.image;

    originNumber.addEventListener("input", (e) => {

        let related = addedItem[e.target.parentElement.id]['children'];

        let value = e.target.value;
        if (Object.size(related) !== 0) {

            for (let child of related) {

                let childElem = document.getElementById(child['uid']);
                let childInput = childElem.querySelector("input.inputRelatedItem");

                childInput.value = child['number'] * value

            }


        }


    })

    let childs = [];

    window.api.sendAsync('getUID');

    await new Promise((resolve, reject) => {
        window.api.receiveOnce('returnUID', async (uid) => {

            originID.id = uid;

            if (Object.size(related) !== 0) {

                let index = 0;

                for (let rel in related) {

                    let child = related[rel][0];

                    let number = child['number'][0];
                    let id = child['id'][0];

                    if (availableItem[id] !== undefined) {

                        let cloneRelated = templateRelated.content.cloneNode(true);

                        child = availableItem[id][id];

                        let imageRelated = cloneRelated.querySelector("img.imgRelatedItem");
                        let numberRelated = cloneRelated.querySelector("input.inputRelatedItem");

                        let arrow = cloneRelated.querySelector("img.arrow");

                        arrow.src = window.api.cwd+"/data/image/ui/arrow.png";


                        numberRelated.value = number;
                        imageRelated.src = window.api.cwd+"/data/image/materials/" + child.image;

                        window.api.sendAsync('getUID');

                        await new Promise((resolve1, reject1) => {
                            window.api.receiveOnce('returnUID', (uid) => {

                                cloneRelated.querySelector('div.relatedItem').id = uid;

                                cloneRelated.querySelector('input.inputRelatedItem').addEventListener('input', (e) => {

                                    let value = e.target.value;

                                    let selfId = e.target.parentElement.parentElement.id;

                                    let parentNode = e.target.parentElement.parentElement.parentElement.querySelector("div.FirstItem");

                                    let itemNumber = Math.trunc(value / number)

                                    for(let item of addedItem[parentNode.id]['children']){

                                        if(item['uid'] !== selfId){

                                            let itemElem = document.getElementById(item['uid']);

                                            let inputElem = itemElem.querySelector('input.inputRelatedItem');

                                            inputElem.value = item['number']* itemNumber;

                                        }

                                    }

                                    parentNode.querySelector('input.inputNumberItem').value = itemNumber;


                                })

                                if(index === 0){

                                    cloneRelated.querySelector('img.arrow').style.width= "65px";
                                    cloneRelated.querySelector('img.arrow').style.height= "65px";
                                    index++;

                                }

                                originCounter.appendChild(cloneRelated);

                                let childData = {

                                    uid: uid,
                                    number: number,
                                    id: id,
                                    parent: originID.id

                                }

                                childs.push(childData);
                                resolve1();
                            })
                        })


                    }

                }

            }

            let deleteButton = document.createElement('button');

            let deleteIcon = document.createElement('img');

            deleteButton.className = "deleteRelated";
            deleteButton.dataset.origin = originID.id;

            deleteIcon.alt = "delete";
            deleteIcon.src = window.api.cwd+"/data/image/ui/delete.png"
            deleteIcon.width = 24;

            deleteButton.appendChild(deleteIcon);

            originCounter.parentElement.appendChild(deleteButton);

            deleteButton.addEventListener("click", (e)=>{

                let button = e.currentTarget;

                let uid = button.dataset['origin'];

                document.getElementById(uid).parentElement.parentElement.remove();
                addedItem[uid] = null;

            })

            containerParent.appendChild(cloneOrigin);

            addedItem[originID.id] = {

                parent: originID.id,
                children: childs

            };

            resolve();
        })
    })

}

function closeMenu(){



}

/*function loadLang(){

    let removeAll = document.getElementById("removeAll");

    window.api.sendAsync('getLang', "ui");

    window.api.receiveOnce('getLangResponse', (type, data)=>{

        console.log(data["removeall"]);

        removeAll.innerText = data["removeall"][0];

    })

}*/


loadJobs();

