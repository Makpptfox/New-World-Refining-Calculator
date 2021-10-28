const   fs = require('fs'),
    path = require('path'),
    xml2js = require('xml2js');

const langFile = path.join(process.cwd(), "lang");

let file = {
    jobs: "",
    materials: "",
    ui: ""
}

let availableLang = [];

const parser = new xml2js.Parser();

const langDir = {
    jobs: path.join(process.cwd(), "lang", "jobs"),
    materials: path.join(process.cwd(), "lang", "materials"),
    ui: path.join(process.cwd(), "lang", "ui")
};

function checkLang(callback){

    availableLang = [];

    fs.readFile(langFile+"\\lang.xml", (err, data)=>{

        parser.parseString(data, (err, result)=>{

            for(let lang in result["lang"]){

                availableLang.push(result["lang"][lang][0]);

            }

            callback(availableLang);

        })

    })

}

function getLangFiles(forData, language, callback){

    if(!availableLang.includes(language)){

        console.error(`Lang: language ${language} not exist!`);
        callback(false);
        return;

    }

    fs.readdir(langDir[forData], (err, files)=>{

        for(const file of files){

            if(file.replace(path.extname(file), "") === language){

                fs.readFile(path.join(langDir[forData], file), ((err1, data) => {

                    parser.parseString(data, (err2, result)=>{
                        callback(result);
                    })

                }))

            }

        }

    })

}

function getLangString(data, key){
    return data[0][key][0];
}

exports.getLangFiles = getLangFiles;
exports.getLangString = getLangString;
exports.checkLang = checkLang;
