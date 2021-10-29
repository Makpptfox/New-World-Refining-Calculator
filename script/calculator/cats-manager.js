const mainCat = document.getElementById('cats');

const catTemplate = document.getElementById('templateCat');
const subTemplate = document.getElementById('templateSubCat');

let list = mainCat.querySelector('div#catsContainer');

let oldCat = null;

function showMainCat(){

    mainCat.style.display = "flex";

}

function hideMainCat(){

    mainCat.style.display = "none";

}

function _removeAllCat(){

    list.innerHTML = "";

}

function _addToCat(sub, cat){

    cat.appendChild(sub);

}

function _newCat(name){

    let cloneCat = catTemplate.content.cloneNode(true);

    let title = cloneCat.querySelector('p.titleCat');

    title.innerText = name;

    return cloneCat;

}

function _newSubCat(name, color, id){

    let cloneSubCat = subTemplate.content.cloneNode(true);

    let div = cloneSubCat.querySelector('div.subCatContainer');
    let title = cloneSubCat.querySelector('p.subCatName');
    let round = cloneSubCat.querySelector('div.roundSubCat');

    title.innerText = name;

    round.style.backgroundColor = color;

    div.addEventListener('click', ()=>{

        if(oldCat === null) {
            let container = div.parentElement.parentElement;

            container.style.background = "#4E727A";

            oldCat = container;
        } else {

            oldCat.style.background = "#3C585E";

            let container = div.parentElement.parentElement;

            container.style.background = "#4E727A";
            oldCat = container;
        }

        _loadCatItem(id[0], color, name);

    })

    return cloneSubCat;

}

// Add new cat on the left bar menu
function addCat(catName, elems){

    const keyCat = window["api"].generateNewUid();

    // Send request to get the translated element
    window["api"].sendAsync('getLang', "ui", keyCat);

    // Receive response
    window["api"].receiveOnce('getLangResponse', (type, data, key)=>{

        if(type !== "ui" && key !== keyCat) return;

        // Create new cat
        let cat= _newCat(data[catName][0]);

        let subCatList = cat.querySelector('div.subCatList');

        // check for all of his child elements
        for (const elem in elems[0]){

            const item = elems[0][elem][0];

            const uid = window["api"].generateNewUid();

            window["api"].sendAsync('getLang', "rarity", item, uid);

            window["api"].receive('getLangResponse', (type, rarity, key)=>{

                if(type === "rarity" && key === uid){

                    // Create the child
                    const subCat = _newSubCat(rarity, item['color'], item['id']);

                    // Add the child to the cat
                    _addToCat(subCat, subCatList);

                }

            })


        }

        list.appendChild(cat);

    })





}
