var print = require("./printFromXML.js");
var jspdf = require("jspdf");
console.log(print);

const fs = require('fs');

let rawJSON = fs.readFileSync('./custom-proset.txt');
let json = JSON.parse(rawJSON);

print.printFromJSON(json, jspdf).then((docu) => {
    docu.save("blibli.pdf");
});
