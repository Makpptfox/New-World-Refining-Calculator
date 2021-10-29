
// The fun is there
// Function to get all items of the xml data file
function loadAvailableItems(){

    alreadyAvailable = true;

    window.api.sendAsync('getAllItems');

    window.api.receiveOnce('getAllItemsResponse', async (data)=> {

        let materials = data['materials'];

        for await (let material of materials) {

            let uid = window.api.generateNewUid();

            await window.api.sendAsync('getLang', "item", material, uid);

            window.api.receive("getLangResponse", (type, RElem, key) => {
                if (type === "item" && material.id === RElem.id && key === uid) {
                    let itemDataList = {};

                    itemDataList[RElem.id] = RElem;

                    availableItem[RElem.id] = itemDataList;
                }
            })
        }

    })

}

// Function to add item to the calculator
function addItem(elem, baseValue = 1, callback = ()=>{}, save = true, opened = false) {

    let personal = elem;

    let openedDiv;

    let related;

    if(personal.related['rel0'] !== undefined){

        related = personal.related;

    } else {
        related = {};
    }

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

    originNumber.value = baseValue;
    originImage.src = window.api.cwd+"/data/image/materials/" + personal.image;

    originNumber.addEventListener("input", (e) => {

        saveData();

        let related = addedItem[e.target.parentElement.id]['children'];
        addedItem[e.target.parentElement.id]['value'] = e.target.value;

        let value = e.target.value;
        if (Object.size(related) !== 0) {

            for (let child of related) {

                let childElem = document.getElementById(child['uid']);
                let childInput = childElem.querySelector("input.inputRelatedItem");

                childInput.value = child['number'] * value
                childInput.dispatchEvent(inputEventCustom);

            }


        }


    })

    let childs = [];

    window.api.sendAsync('getUID');

    new Promise((resolve, reject) => {
        window.api.receiveOnce('returnUID', async (uid) => {

            originID.id = uid;

            if (Object.size(related) !== 0) {

                let index = 0;

                for (let rel in related) {

                    let child = related[rel][0];

                    let number = child['number'][0];
                    let id = child['id'][0];
                    let complex = false;
                    if(child['details'] !== undefined) complex = child['details'][0];

                    if (availableItem[id] !== undefined) {

                        let cloneRelated = templateRelated.content.cloneNode(true);

                        child = availableItem[id][id];

                        let imageRelated = cloneRelated.querySelector("img.imgRelatedItem");
                        let numberRelated = cloneRelated.querySelector("input.inputRelatedItem");

                        let arrow = cloneRelated.querySelector("img.arrow");

                        arrow.src = window.api.cwd+"/data/image/ui/plus_white.png";


                        numberRelated.value = baseValue*number;
                        imageRelated.src = window.api.cwd+"/data/image/materials/" + child.image;

                        window.api.sendAsync('getUID');

                        await new Promise((resolve1, reject1) => {
                            window.api.receiveOnce('returnUID', (uid) => {

                                cloneRelated.querySelector('div.relatedItem').id = uid;


                                let inputRelated = cloneRelated.querySelector('input.inputRelatedItem')

                                //When relatedInput changed
                                inputRelated.addEventListener('input', (e) => {

                                    let value = e.target.value;

                                    let selfId = e.target.parentElement.parentElement.id;

                                    let parentNode = e.target.parentElement.parentElement.parentElement.querySelector("div.FirstItem");

                                    let itemNumber = Math.trunc(value / number)


                                    for(let item of addedItem[parentNode.id]['children']){

                                        if(item['uid'] !== selfId){

                                            let itemElem = document.getElementById(item['uid']);

                                            let inputElem = itemElem.querySelector('input.inputRelatedItem');
                                            inputElem.value = item['number']* itemNumber;
                                            inputElem.dispatchEvent(inputEventCustom);

                                        }

                                    }

                                    parentNode.querySelector('input.inputNumberItem').value = itemNumber;


                                })

                                if(index === 0){
                                    arrow.src = window.api.cwd+"/data/image/ui/equals_white.png";

                                    cloneRelated.querySelector('img.arrow').style.width= "32px";
                                    cloneRelated.querySelector('img.arrow').style.height= "32px";
                                    index++;

                                }


                                if(complex){

                                    cloneRelated.querySelector('img.showBar').style.display = "inherit";
                                    cloneRelated.querySelector('img.showBar').src = window.api.cwd+"/data/image/ui/down-arrow_white.png"
                                    cloneRelated.querySelector('div.relatedItem').style.cursor = "pointer";

                                    addSubItem(originCounter.parentElement, child, inputRelated.value, inputRelated, inputRelated, null, originID.id, opened);

                                }

                                let tooltip = cloneRelated.querySelector('p.tooltipText');

                                tooltip.innerText = child.name;
                                originCounter.appendChild(cloneRelated);

                                let childData = {

                                    uid: uid,
                                    number: number,
                                    elem: child,
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
                document.getElementById(uid).parentElement.parentElement.parentElement.classList.add("deleteAnim");

                document.getElementById(uid).parentElement.parentElement.parentElement.addEventListener("animationend", ()=>{
                    document.getElementById(uid).parentElement.parentElement.parentElement.remove();
                    addedItem[uid] = null;

                    saveData();
                })

            })

            let tooltip = cloneOrigin.querySelector('p.tooltipText');

            tooltip.innerText = elem.name;
            containerParent.appendChild(cloneOrigin);

            addedItem[originID.id] = {

                parent: originID.id,
                elem: elem,
                value: baseValue,
                children: childs,
                opened: opened,
                openedDiv: openedDiv

            };

            resolve();
        })
    }).then(()=>{

        let data = {
            children: childs
        }

        callback();

        const onItemAdded = new CustomEvent('onItemAdded', {'detail': data});

        document.dispatchEvent(onItemAdded);

        if(save) saveData();

    })

}

// Function to add sub-bar to item when complex data is detected
async function addSubItem(div, elem, number, inputEvent, self, event = null, originId = -1, opened = false){


    let templateDetailsRelatedItem = document.getElementById('templateDetailsRelatedItem');

    let clone = templateDetailsRelatedItem.content.cloneNode(true);

    let icon = clone.querySelector('img.iconItemDetail');
    let input = clone.querySelector('input.inputItemDetail');

    let tooltip = clone.querySelector('p.tooltipText');

    tooltip.innerText = elem.name;

    icon.src = window.api.cwd+'/data/image/materials/'+elem.image;

    input.value = number;


    let index = 0;
    let inputRel = [];
    let needToBeAdded = []

    for (const relatedElement in elem.related) {
        addRelatedToChild(elem, relatedElement, number, index, div, clone, needToBeAdded, inputRel);
        index++;
    }

    inputEvent.addEventListener('input', (e)=>{

        input.value = e.target.value;

        inputRel.forEach(elem=>{

            elem.input.value = elem.number*input.value;

            if(elem.event !== null) {
                input.dispatchEvent(elem.event);
            }

        })

    })

    inputEvent.addEventListener('editData', (e)=>{

        input.value = self.value;

        inputRel.forEach(elem=>{

            elem.input.value = elem.number*input.value;

            if(elem.event !== null) {
                input.dispatchEvent(elem.event);
            }

        })
    }, false)

    if(event !== null){
        inputEvent.addEventListener(event.type, (e)=>{

            input.value = self.value;

            inputRel.forEach(elem=>{

                elem.input.value = elem.number*input.value;

                if(elem.event !== null) {
                    input.dispatchEvent(elem.event);
                }

            })
        });

    }


    let uid = window.api.generateNewUid();

    clone.querySelector('div.detailsRelatedItemContainer').id = uid;

    div.parentElement.appendChild(clone);

    needToBeAdded.forEach(need=>{

        if(event !== null){
            addSubItem(need.div, need.child, need.number, need.inputEvent, need.self, need.event, originId, opened);
        } else {
            if(opened.id === elem.id){
                addSubItem(need.div, need.child, need.number, need.inputEvent, need.self, need.event, originId, true);
            } else {
                addSubItem(need.div, need.child, need.number, need.inputEvent, need.self, need.event, originId, false);
            }
        }


    })

    document.addEventListener('onItemAdded', (e)=>{

        if(event === null) {


            inputEvent.parentElement.querySelector('img.imgRelatedItem').addEventListener('click', () => {


                if(originId !== -1){

                    if(addedItem[originId].openedDiv === null || addedItem[originId].openedDiv === undefined){

                        addedItem[originId].openedDiv = inputEvent;
                        addedItem[originId].opened = elem;

                    } else {

                        let counter = addedItem[originId].openedDiv;
                        addedItem[originId].opened = elem;

                        if(counter.parentElement.querySelector('img.imgRelatedItem') && counter !== inputEvent) {
                            counter.parentElement.querySelector('img.imgRelatedItem').dispatchEvent(new CustomEvent("closeSub"));
                            addedItem[originId].openedDiv = inputEvent;
                        } else if(counter === inputEvent){


                        }



                    }

                }

                if(document.getElementById(uid).style.display === "none") {
                    document.getElementById(uid).style.display = "flex";
                    inputEvent.parentElement.querySelector('img.showBar').style.transform = 'rotate(180deg)';
                    inputEvent.parentElement.querySelector('img.showBar').style.opacity = '40%';
                } else {
                    document.getElementById(uid).style.display = "none";
                    inputEvent.parentElement.querySelector('img.showBar').style.transform = 'rotate(0)';
                    inputEvent.parentElement.querySelector('img.showBar').style.opacity = '100%';
                }

                saveData();

                document.getElementById(uid).dispatchEvent(new CustomEvent('showCat'));

            })
            inputEvent.parentElement.querySelector('img.imgRelatedItem').addEventListener('closeSub', ()=>{

                document.getElementById(uid).style.display = "none";
                inputEvent.parentElement.querySelector('img.showBar').style.transform = 'rotate(0)';
                inputEvent.parentElement.querySelector('img.showBar').style.opacity = '100%';
                document.getElementById(uid).dispatchEvent(new CustomEvent('closeSub'));


            })
        } else {

            let directParent = inputEvent.parentElement.parentElement.parentElement;

            directParent.addEventListener('showCat', ()=>{

                if(document.getElementById(uid).style.display === "none") {
                    document.getElementById(uid).style.display = "flex";
                } else {
                    document.getElementById(uid).style.display = "none";
                }

                document.getElementById(uid).dispatchEvent(new CustomEvent('showCat'));

            })


            directParent.addEventListener('closeSub', ()=>{
                document.getElementById(uid).style.display = "none";
                document.getElementById(uid).dispatchEvent(new CustomEvent('closeSub'));
            })

        }

    }, { once: true })

    const observer = new MutationObserver((mutations, obs) => {

        let div = document.getElementById(uid);
        if (div) {
            if(event === null){
                if(opened === false){

                    let arrow = inputEvent.parentElement.querySelector('img.showBar');

                    if(arrow){
                        arrow.style.transform = 'rotate(0deg)';
                        arrow.style.opacity = '100%';
                        div.style.display = "none";
                    }

                } else {


                    if(opened.id === elem.id){


                        let arrow = inputEvent.parentElement.querySelector('img.showBar');

                        addedItem[originId].openedDiv = inputEvent;

                        if(arrow) {
                            arrow.style.transform = 'rotate(180deg)';
                            arrow.style.opacity = '40%';
                            div.style.display = "flex";
                        }
                    }
                }
            } else {
                if(opened) {

                    document.getElementById(uid).style.display = "flex";
                } else {
                    document.getElementById(uid).style.display = "none";
                }
            }

            obs.disconnect();
        }

    });

    observer.observe(document, {
        childList: true,
        subtree: true
    });
    icon.addEventListener('loadend', function(){

    });

}

// Function to add related item to the main item
function addRelatedToChild(elem, relatedElement, number, index, div, clone, needToBeAdded, inputRel){

    let rel = elem.related[relatedElement]

    let id = rel[0]['id'][0];

    let child = availableItem[id][id];

    let templateRelated = document.getElementById('templateDetailsRelatedItemChild');

    let related = templateRelated.content.cloneNode(true);

    let arrow = related.querySelector('img.arrow');
    let icon = related.querySelector('img.imgRelatedItemChild');
    let input = related.querySelector('input.inputRelatedItemChild');
    let tooltip = related.querySelector('p.tooltipText');

    tooltip.innerText = child.name;

    input.value = number*rel[0]['number'][0];

    let data = {

        input: input,
        number: rel[0]['number'][0],
        id: rel[0]['id'][0],
        event: null

    }

    icon.src = window.api.cwd+'/data/image/materials/'+child['image'];

    arrow.src = window.api.cwd+'/data/image/ui/plus_white.png';
    if(index === 0) arrow.src = window.api.cwd+'/data/image/ui/equals_white.png';

    if(rel[0]['details'] !== undefined) {
        if (rel[0]['details'][0] === "true") {
            data.event = new InputEvent(rel[0]['id'][0]);

            let need = {
                div: div,
                child: child,
                number: rel[0]['number'][0]*number,
                inputEvent: clone.querySelector('input.inputItemDetail'),
                self: related.querySelector('input.inputRelatedItemChild'),
                event: data.event
            }

            needToBeAdded.push(need);

        }
    }

    clone.querySelector('div.detailsRelatedItem').appendChild(related);

    inputRel.push(data);

    index++;
}

// Check if the load of availableItems was already done
if(!alreadyAvailable) loadAvailableItems();
