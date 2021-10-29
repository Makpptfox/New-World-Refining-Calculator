const   fs = require('fs'),
        path = require('path'),
        xml2js = require('xml2js');

const neededParameters = ["dataType", "title"]

const directory = [path.join(process.cwd(), "data", "jobs"), path.join(process.cwd(), "data", "materials")]

const dataTag = {
    jobs: ["name", "id","cats"],
    materials: ["name", "id", "jobId", "related", "image", "cat"]
}

const parser = new xml2js.Parser();

async function checkIfXMLValid(path, callback){

    await fs.readFile(path, (err, data)=>{

        parser.parseString(data, (err, result)=>{

            let xmlData = JSON.parse(JSON.stringify(result));

            neededParameters.forEach(elem=>{
                if(xmlData["data"][elem] === undefined){

                    callback(false);

                }
            })

        })

        callback(true);
    })


}

function getXMLData(path, callback){


    fs.readFile(path, (err, data)=>{
        parser.parseString(data, (err, result)=>{

            callback(result);

        })
    })

}

function getDataFiles(type, callback) {

    switch (type) {

        case 'jobs':{

            let promises = []

            let data = {}

            fs.readdir(directory[0], function (err, files){

                for (const file of files) {

                    if(path.extname(file) === ".xml"){

                        let pathOfXML = path.join(process.cwd(), "data", "jobs", file);

                        promises.push(new Promise(function (resolve) {

                            checkIfXMLValid(pathOfXML, (valid) => {

                                if (valid) {
                                    data[file.replace(path.extname(file), "")] = pathOfXML;
                                    resolve();
                                } else {

                                    console.error(`XMLFileError: ${file} as not all needed xml tag!`);

                                }

                            });
                        }))

                    }

                }

                Promise.all(promises)
                    .then(()=>{
                        callback(data);
                    })


            })

            break;
        }
        case 'materials':{

            let promises = []

            let data = {}

            fs.readdir(directory[1], function (err, files){

                for (const file of files) {

                    if(path.extname(file) === ".xml"){

                        let pathOfXML = path.join(process.cwd(), "data", "materials", file);

                        promises.push(new Promise(function (resolve) {

                            checkIfXMLValid(pathOfXML, (valid) => {

                                if (valid) {
                                    data[file.replace(path.extname(file), "")] = pathOfXML;
                                    resolve();
                                } else {

                                    console.error(`XMLFileError: ${file} as not all needed xml tag!`);

                                }

                            });
                        }))

                    }

                }

                Promise.all(promises)
                    .then(()=>{
                        callback(data);
                    })


            })

            break;
        }
        default:
            return false;

    }

}

async function getDataFrom(path, callback){

    let Rdata = {};

    await getXMLData(path, (data)=>{


        let dataType = data['data']['dataType'][0].toLowerCase();

        if(dataTag[dataType] === undefined) {

            console.error(`XMLDataError: The dataType "${dataType}" in ${path} is not valid!`);

            return;
        }

        Rdata['dataType'] = dataType;
        Rdata['title'] = data['data']['title'][0];
        Rdata[dataType] = [];

        data['data'][dataType].forEach(elem=>{
            for(let item in elem){

                elem[item].forEach(elem=>{

                    let itemData = {};

                    dataTag[dataType].forEach(tag=>{

                        if(elem[tag] !== undefined) {
                            itemData[tag] = elem[tag][0];
                        } else {
                            itemData[tag] = "";
                        }

                    })

                    Rdata[dataType].push(itemData);
                })

            }
        })
        callback(Rdata);
    })


}

exports.getDataFiles = getDataFiles;
exports.getDataFrom = getDataFrom;
