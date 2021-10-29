
window.api.receive('update_downloaded', ()=>{

    let updaterWindow = document.getElementById('menuDownload');

    updaterWindow.style.display = 'inherit'

})

function InstallUpdate(){

    window.api.sendAsync('installUpdate');

}

function openApp(){

    window.api.sendAsync('openApp');

}

function initUpdate(){
    let logo = document.getElementById("logo");

    logo.src = window.api.cwd+"/data/image/ui/NWRC.png";
}

initUpdate();
