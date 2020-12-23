var print = require("./printFromXML.js");
var jspdf = require("jspdf");
console.log(print);

const fs = require('fs');

let rawJSON = fs.readFileSync('./'+process.argv[2]);
let json = JSON.parse(rawJSON);

print.printFromJSON(json, jspdf).then((docu) => {
    docu.save(process.argv[3]);
});
