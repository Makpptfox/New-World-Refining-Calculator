let setting = {
    settings:{
        lang: "",
        autoupdate: ""
    }
}

let opened = false;
let about = false;

// Set base lang option for the selector
function setLangOption(){

    window["api"].sendAsync("getLanguage");

    window["api"].receiveOnce('getLanguageResponse', (lang)=>{

        let language = lang.chosen;
        let langs = lang.langs;

        let selector = document.getElementById('langSelector');

        langs.forEach(elem=>{

            let option = document.createElement('option');

            option.value = elem;
            option.innerText = elem;

            if(elem === language){

                option.selected = true;

            }

            selector.appendChild(option);

        });

        setting.settings.lang = language;

        selector.addEventListener('change', ()=>{

            setting.settings.lang = selector.value;

            window["api"].sendAsync('setSettings', setting);

            window["api"].receiveOnce('setSettingsResponse', ()=>{

                window["api"].sendAsync('restartApp');

            })

        })
        document.addEventListener("click",(event)=>{
                // noinspection JSUnresolvedFunction
                if (!event.target.closest("#containerParameter") && opened) {
                    closeModal()
                } else { // noinspection JSUnresolvedFunction
                    if (!opened && !event.target.closest("#containerParameter")){
                                        opened = true;
                                    }
                }
            },
            false
        )

        function closeModal() {
            opened = false;
            document.getElementById("backContainerParameter").style.display = "none"
            document.getElementById("paramContainer").className = "roundButton";
        }

    })



}

// Init each of the window
function initAutoUpdate(){

    window["api"].sendAsync('getAutoUpdate');

    window["api"].receiveOnce('getAutoUpdateResponse', (state)=>{

        let checkbox = document.getElementById('autoCheck');

        checkbox.checked = state;
        setting.settings.autoupdate = state;

        checkbox.addEventListener('change', ()=>{

            setting.settings.autoupdate = checkbox.checked;
            window["api"].sendAsync('setSettings', setting);

            window["api"].receiveOnce('setSettingsResponse', ()=>{

                window["api"].sendAsync('restartApp');

            })

        })

    })

}
function initAbout(){


    document.addEventListener("click",(event)=>{
            // noinspection JSUnresolvedFunction
            if (!event.target.closest("#containerAbout") && about) {
                closeModal()
            } else
                // noinspection JSUnresolvedFunction
                if (!opened && !event.target.closest("#containerAbout")){
                about = true;
            }
        },
        false
    )

    function closeModal() {
        about = false;
        document.getElementById("backContainerAbout").style.display = "none"
        document.getElementById("aboutContainer").className = "roundButton";
    }

}
function initResetSave(){

    let resetSaveButton = document.getElementById('resetSave');

    resetSaveButton.addEventListener('click', ()=>{

        window["api"].sendSync('clearTab');

    })

}

function openSettings(){
    document.getElementById("paramContainer").className = "roundButton clickRound";
    document.getElementById('backContainerParameter').style.display='flex';

}

function openAbout(){
    document.getElementById("aboutContainer").className = "roundButton clickRound";
    document.getElementById('backContainerAbout').style.display = 'flex';

}

initResetSave();
initAutoUpdate();
initAbout();

setLangOption();
