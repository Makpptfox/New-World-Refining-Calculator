let addedItem = {};

let alreadyAvailable;

const inputEventCustom = new InputEvent('editData');

let availableItem = [];

Object.size = function(obj) {
    let size = 0,
        key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};

try {
    if (window["api"].testApp()) {

        console.log("Success");

    }
} catch (e){

}

function checkA() {
    let aTags = document.getElementsByTagName("a");
    for (let i = 0; i < aTags.length; i++) {

        aTags[i].addEventListener('click', (e) => {
            e.preventDefault();
            window["api"].openExternal(e.target.href);
        })
    }
}
function checkIMG(){
    let questionMark = document.getElementById("aboutIcon");
    let param = document.getElementById("paramIcon");

    questionMark.src = window["api"].cwd+"/data/image/ui/question_white.png";
    param.src = window["api"].cwd+"/data/image/ui/settings_white.png";
}
