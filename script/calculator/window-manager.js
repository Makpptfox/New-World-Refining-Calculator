
const windowClose = window["api"].cwd+"/data/image/ui/closeFrame.png";
const windowMin = window["api"].cwd+"/data/image/ui/minFrame.png";
const windowExtend = window["api"].cwd+"/data/image/ui/extendFrame.png";
const windowSmall = window["api"].cwd+"/data/image/ui/smallFrame.png";

function initIcon(){

    let close = document.getElementById("frameClose");
    let min = document.getElementById("frameMinimize");
    let size = document.getElementById("frameSize");

    let title = document.getElementById("title");

    close.src = windowClose;
    min.src = windowMin;
    size.src = windowSmall;

    close.style.width = "12px"
    close.style.height = "12px"
    min.style.width = "12px"
    min.style.height = "12px"
    size.style.width = "12px"
    size.style.height = "12px"
    title.style.fontSize = "12px";

    let sizeFlipFlop = true;

    close.parentElement.addEventListener('click', ()=>{

        window["api"].sendAsync('closeApp');

    })

    min.parentElement.addEventListener('click', ()=>{

        window["api"].sendAsync('minApp');

    });

    size.parentElement.addEventListener('click', ()=>{

        if (sizeFlipFlop){

            size.src = windowExtend;
            window["api"].sendAsync('maxSize');

            sizeFlipFlop = false;

            title.style.fontSize = "16px";

            close.style.width = "16px"
            close.style.height = "16px"
            min.style.width = "16px"
            min.style.height = "16px"
            size.style.width = "16px"
            size.style.height = "16px"

        } else {
            size.src = windowSmall;
            window["api"].sendAsync('minSize');

            sizeFlipFlop = true;

            title.style.fontSize = "12px";

            close.style.width = "12px"
            close.style.height = "12px"
            min.style.width = "12px"
            min.style.height = "12px"
            size.style.width = "12px"
            size.style.height = "12px"
        }

    })

    window["api"].receive("maxSizeResponse", ()=>{

        size.src = windowExtend;

        sizeFlipFlop = false;
    })
    window["api"].receive('minSizeResponse', ()=>{

            size.src = windowSmall;

            sizeFlipFlop = true;
    })

}

initIcon();
