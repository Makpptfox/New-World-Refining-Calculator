
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
