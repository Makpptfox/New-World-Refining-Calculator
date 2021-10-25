console.info("Lang manager initiated!");

let lang = "";

function getLang(){

    lang = window.api.getLang;

    console.info(`Lang chosen: ${lang}`);

}

function translateAllTag(){

    let tags = document.getElementsByTagName('*');

    for(const tag of tags){

        if(tag.hasAttribute('data-lang')){

            console.info(tag.dataset['lang']);

            window.api.sendAsync('getLang', 'ui', 'null', tag.dataset['lang']);

            window.api.receive('getLangResponse', (type, data, key)=>{

                if(key === tag.dataset['lang']){

                    if(data[tag.dataset['lang']] !== undefined && data[tag.dataset['lang']][0] !== undefined){
                        tag.innerText = data[tag.dataset['lang']][0];
                    } else {
                        tag.innerText = "!!! "+lang+"_"+tag.dataset['lang'];
                    }


                }

            })

        }

    }

}


// NEEDED!
getLang();
translateAllTag();
