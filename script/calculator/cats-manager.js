const mainCat = document.getElementById('cats');
let list = mainCat.querySelector('div#catsContainer');
const catTemplate = document.getElementById('templateCat');
const subTemplate = document.getElementById('templateSubCat');

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

        _loadCatItem(id[0]);

    })

    return cloneSubCat;

}

function addCat(catName, elems){

    let cat = _newCat(catName);

    let subCatList = cat.querySelector('div.subCatList');

    console.log(subCatList);


    for (const elem in elems[0]){

        const item = elems[0][elem][0];
        console.log(item);

        const uid = window.api.generateNewUid();

        window.api.sendAsync('getLang', "rarity", item, uid);

        window.api.receive('getLangResponse', (type, rarity, key)=>{

            if(type === "rarity" && key === uid){

                const subCat = _newSubCat(rarity, item['color'], item['id']);

                _addToCat(subCat, subCatList);

            }

        })


    }


    list.appendChild(cat);

}
