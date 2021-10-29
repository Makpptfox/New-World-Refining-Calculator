
let abortSignal = new AbortController();

let tabManagerDiv;
let defaultTab;

let newTab;
let remTab;

let tabTemplate;

let actualTab = "default";

let tabData;

let inputActual  = null;

let init = false;

// Function to loadData from save file
function loadData(callback){

    window["api"].sendAsync('getSavedTab');
    window["api"].receiveOnce('getSavedTabResponse', (data, exist)=>{

        if(exist){

            tabData = data;

        } else {

            tabData = data;

        }



        callback(data);
    })
}

// Function to init the tabManager
function initTabManager(){

    tabManagerDiv = document.getElementById('tabManagerBar');
    defaultTab = document.getElementById('defaultTab');

    newTab = document.getElementById('addNewTab');
    remTab = document.getElementById('removeTab');

    tabTemplate = document.getElementById('templateTab');

    window["api"].sendAsync('getSavedTab');

    window["api"].receiveOnce('getSavedTabResponse', (data, exist)=>{

        if(exist){

            tabData = data;

        } else {

            tabData = data;

        }

        tabData['default'].div = "defaultTab"

        newTab.addEventListener("click", addNewTab);

        remTab.addEventListener("click", removeTab);

        init = true;


        console.info("Tabs manager initiated!");

        loadItem(tabData["default"]['data']);

        for (const tab in tabData){

            if(tab !== "default" && tabData[tab]['deleted'] === undefined){

                let uid = tabData[tab]['div'];

                let clone = tabTemplate.content.cloneNode(true);

                let input = clone.querySelector('input.name');
                let text = clone.querySelector('p.name');

                input.style.display = "none";
                text.style.display = "inherit";

                clone.querySelector('div.tab')

                text.parentElement.id = uid;

                text.innerText = tab;

                text.parentElement.addEventListener('click', () => changeTab(tab));

                tabManagerDiv.appendChild(clone);

                tabManagerDiv.removeChild(newTab);
                tabManagerDiv.removeChild(remTab);

                tabManagerDiv.appendChild(newTab);
                tabManagerDiv.appendChild(remTab);

            }

        }
    })


}

// Function to add new tab to the calculator
function addNewTab(){
    if(init) {
        let uid = window["api"].generateNewUid();

        if (inputActual !== null) {

            tabManagerDiv.removeChild(inputActual);

        }

        let confirm = async function(e){

            let size = 0;

            for(const elem in tabData){

                if(tabData[elem]['deleted'] === undefined){
                    size++;
                }

            }

            if (e.relatedTarget !== input && input.value !== "" && (tabData[input.value] === undefined || tabData[input.value]['deleted'] !== undefined) && size < 6) {


                input.style.display = "none";
                text.style.display = "inherit";

                text.parentElement.id = uid;

                tabData[text.innerText] = {
                    data: [],
                    div: uid
                };

                await window["api"].sendAsync('saveTab', JSON.parse(JSON.stringify(tabData)));

                text.parentElement.addEventListener('click', () => changeTab(text.innerText));

                inputActual = null;

                abortSignal.abort();
                abortSignal = new AbortController();

                changeTab(text.innerText);


            } else if (input.dataset.firstClick === "true" && (e.relatedTarget !== input || (input.value === "" || tabData[input.value] !== undefined))) {
                tabManagerDiv.removeChild(inputActual);
                inputActual = null;

                abortSignal.abort();
                abortSignal = new AbortController();

            } else {
                input.dataset.firstClick = "true";
            }
        }

        let clone = tabTemplate.content.cloneNode(true);

        let input = clone.querySelector('input.name');
        let text = clone.querySelector('p.name');

        clone.querySelector('div.tab')


        input.addEventListener('input', () => {

            text.innerText = input.value;

        })

        document.addEventListener('keypress', async (e)=>{
            if(e.key === "Enter"){

                await confirm(e);

            }
        }, {signal: abortSignal.signal})
        document.addEventListener('click', confirm, {signal: abortSignal.signal});

        inputActual = input.parentElement;

        tabManagerDiv.appendChild(clone);

        tabManagerDiv.removeChild(newTab);
        tabManagerDiv.removeChild(remTab);

        tabManagerDiv.appendChild(newTab);
        tabManagerDiv.appendChild(remTab);
        input.focus();

    }
}

// Function to remove the actual tab
function removeTab(){
    if(init && actualTab !== "default") {

        let oldTab = actualTab;

        changeTab("default", ()=>{

            loadItem(tabData['default']['data'], ()=>{
                actualTab = "default";

                let tabDiv = document.getElementById(tabData[oldTab].div);

                let parent = tabDiv.parentElement;

                parent.removeChild(tabDiv);

                tabData[oldTab] = {
                    data: null,
                    div: null,
                    deleted: true
                }

                saveData();
            });
        }, true);


    }

}

// Function to change of tab
function changeTab(tabName, callback = ()=>{}, noLoad = false){
    if(init) {

        loadData(async ()=>{

            if (tabData[tabName] !== undefined && tabName !== actualTab) {

                tabData[actualTab]['data'] = [];

                for (const addedItemElement in addedItem) {

                    if(addedItemElement[addedItemElement] !== null) tabData[actualTab]['data'].push(addedItem[addedItemElement]);

                }

                addedItem = [];

                let actualTabDiv = document.getElementById(tabData[actualTab].div);
                let tabDiv = document.getElementById(tabData[tabName].div);

                try {
                    actualTabDiv.className = actualTabDiv.className.replace(' chosen', '');

                    tabDiv.className = actualTabDiv.className + " chosen";

                    actualTab = tabName;

                    await window["api"].sendAsync('saveTab', JSON.parse(JSON.stringify(tabData)));

                    callback();

                    if (!noLoad) await loadItem(tabData[tabName]['data']);
                } catch (e) {

                    tabManagerDiv.childNodes.forEach(elem=>{

                        if(elem.tagName === "DIV"){
                            if(elem.id === ""){

                                tabManagerDiv.removeChild(elem);
                                tabData[tabName].deleted = "true";

                                saveData();

                            }
                        }

                    })

                }
            }
        });
    }
}

// Function to load items of the actual tab
async function loadItem(data, callback = ()=>{}){

    document.getElementById('itemListContainer').innerHTML = '';

    for(const item in data){

        if(data[item] !== null) {
            if (data[item]['opened'] === undefined) data[item].opened = false;

            await new Promise(resolve => {
                addItem(data[item]['elem'], data[item]['value'], () => {
                    resolve();
                }, false, data[item]['opened']);
            });
        }

    }

    callback();

}

// Function to save all data
async function saveData(){

    tabData[actualTab]['data'] = [];

    for (const addedItemElement in addedItem) {
        if(addedItem[addedItemElement] !== null) tabData[actualTab]['data'].push(addedItem[addedItemElement]);

    }
    await window["api"].sendAsync("deleteTab");

    window["api"].receiveOnce('deleteTabResponse', ()=>{
        window["api"].sendAsync('saveTab', JSON.parse(JSON.stringify(tabData)));
    })
}


// NEEDED!
initTabManager();
