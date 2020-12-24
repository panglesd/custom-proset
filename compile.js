var print = require("./printFromXML.js");
var jspdf = require("jspdf");
console.log(print);

const fs = require('fs');

let rawJSON = fs.readFileSync('./'+process.argv[2]);
let json = JSON.parse(rawJSON);

print.printFromJSON(json, jspdf).then((docu) => {
    docu.save(process.argv[3]);
});

let docu = new jspdf.jsPDF("p", "mm", [parseInt(json.card.width),parseInt(json.card.height)]);

let [cx, cy, lx, ly, nItem] = [0, 0, parseInt(json.card.width),parseInt(json.card.height),json.items.length];
print.createCard(docu, cx, cy, lx, ly, Math.pow(2,nItem)-1, json);

docu.save("thumbnail_"+process.argv[3]);
