let getCoordOfElem2 = (elem) => {
    return [elem.getAttribute("left"), elem.getAttribute("top")];
};
let getCoordOfElem3 = (elem) => {
    return [elem["left"], elem["top"]];
};
let printCross = (docu, x,y) => {
    docu.line(x-2,y,x+2,y);
    docu.line(x,y-2,x,y+2);  
};

function createCardVerso(docu, cx, cy, lx, ly, json) {
    let card = json.card;
    let printOptions = json.printOptions;
    let cardDim = [parseInt(card.width), parseInt(card.height)];
    let [cardDimX, cardDimY] = cardDim;

    let scale = card.scale;
    let crossChoice = printOptions["delimiter"];
    let versoImageInfo = card["other-side-image"];

    if(versoImageInfo["src"] != "") {
	let [x,y] = getCoordOfElem3(versoImageInfo);
	docu.addImage(versoImageInfo["src"], cx+x*scale, cy+y*scale, versoImageInfo["width"]*scale, versoImageInfo["height"]*scale);
	// docu.addImage(backgroundImage.substring("5", backgroundImage.length-2), cx,cy,lx,ly);
	// docu.addImage(document.querySelector('#background-input').files[0].stream(), cx,cy,lx,ly);
    }

}
function createCard(docu, cx, cy, lx, ly, n, json) {
    let card = json.card;
    let printOptions = json.printOptions;
    let cardDim = [parseInt(card.width), parseInt(card.height)];
    let [cardDimX, cardDimY] = cardDim;

    let scale = card.scale;
    let crossChoice = printOptions["delimiter"];
    let backgroundImageInfo = card["background-image"];

    if(backgroundImageInfo["src"] != "") {
	let [x,y] = getCoordOfElem3(backgroundImageInfo);
	docu.addImage(backgroundImageInfo["src"], cx+x*scale, cy+y*scale, backgroundImageInfo["width"]*scale, backgroundImageInfo["height"]*scale);
	// docu.addImage(backgroundImage.substring("5", backgroundImage.length-2), cx,cy,lx,ly);
	// docu.addImage(document.querySelector('#background-input').files[0].stream(), cx,cy,lx,ly);
    }
    // if(otherSideDataUrl != "") {
    //     docu.addImage(otherSideDataUrl, cx,cy,lx,ly);
    // docu.addImage(document.querySelector('#background-input').files[0].stream(), cx,cy,lx,ly);
    // }
    if(crossChoice == "intersection"){
	printCross(docu,cx,cy);
	printCross(docu,cx+lx,cy);
	printCross(docu,cx,cy+ly);
	printCross(docu,cx+lx,cy+ly);
    }
    else if (crossChoice == "box")
	docu.rect(cx,cy,lx,ly);
    json.items.forEach((item,i) => {
	if((n >> i) % 2) {
	    // console.log("image", i, "ajoutée");
	} else {
	    
	}
	if(item.src != "" && (n >> i) % 2) {
	    let [x,y] = getCoordOfElem3(item);
	    // console.log("addImage",item.src, margin+(n-1)%(nx)*cardDimX+x*scale, margin+Math.floor((n-1)%(nx*ny)/nx)*cardDimY+y*scale, item.width*scale, item.height*scale);
	    docu.addImage(item["src"], cx+x*scale, cy+y*scale, item["width"]*scale, item["height"]*scale);
	}
    });	
}

async function printFromJSON (json, jspdf2) {
    if(jspdf2)
	jspdf = jspdf2;
    let card = json.card;
    let printOptions = json.printOptions;
    let cardDim = [parseInt(card.width), parseInt(card.height)];
    let [cardDimX, cardDimY] = cardDim;

    let scale = card.scale;

    let format =  printOptions.format;
    let landscape = printOptions.orientation == "landscape";
    let pageDim, pageDimX, pageDimY;
    if(format == "a4")
	pageDim = [210,297];
    else if(format == "a3")
	pageDim = [297,420];
    else if(format == "a5")
	pageDim = [148,210];
    else if(format == "letter")
	pageDim = [215.9, 279.4];
    else if(format == "custom")
	pageDim = [parseInt(printOptions["customWidth"]),parseInt(printOptions["customHeight"])];
    if(landscape)
	[pageDimY, pageDimX] = pageDim;
    else
	[pageDimX, pageDimY] = pageDim;

    let margin = parseInt(printOptions["margin"]);
    
    let docu = new jspdf.jsPDF(landscape ? "l" : "p", "mm", pageDim);
    
    let nx = Math.floor((pageDimX-2*margin)/(card["width"]));
    let ny = Math.floor((pageDimY-2*margin)/(card["height"]));

    if(nx * ny == 0) {
	alert("card too big or paper size too small");
	return docu;
    }
    console.log("nx et ny",nx,ny);

    let crossChoice = printOptions["delimiter"];
    
    // if(// document.querySelector("input[value=\"box\"]").checked
    // 	printOptions["delimiter"] == "box"
    //   )
    // 	crossChoice = "box";
    // else if(// document.querySelector("input[value=\"none\"]").checked
    // 	printOptions["delimiter"] == "none"
    // )
    // 	crossChoice = "none";
    // else if(document.querySelector("input[value=\"intersection\"]").checked)
    // 	crossChoice = "intersection";

	
    docu.setDrawColor(220,220,220);

    let otherSide = card["other-side-image"];
    let otherSideDataUrl;
    if(typeof otherSide == "object")
	otherSideDataUrl = otherSide["src"];
    else if(typeof otherSide == "string")
	otherSideDataUrl = otherSide;
    else
	otherSideDataUrl = "";
    
    let nItem = json.items.length;
    let nPerPage = 0;
    let backgroundImage = card["background-image"];

    async function createCardInLoop(n) {
	return new Promise((resolve) => {
	    setTimeout(() => {
		if((n-1)%(nx*ny)==0 && n>1) {
		    docu.addPage();
		    if(otherSideDataUrl != "") {
			for(let n2=1; n2<=nPerPage; n2++) {
			    let [cx,cy,lx,ly] = [margin+(n2-1)%(nx)*cardDimX,margin+Math.floor((n2-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY];
			    createCardVerso(docu,cx,cy,lx,ly, json);
			    // docu.addImage(otherSideDataUrl, pageDimX-cx-lx,cy,lx,ly, "backgroundimage", "backgroundimage");
			}
			docu.addPage();
			nPerPage=0;
		    }
		}
		nPerPage++;
		// console.log("rect",margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY);
		let [cx,cy,lx,ly] = [margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY];
		createCard(docu, cx, cy, lx, ly, n, json);
		resolve();
	    });
	});
    }
    
    for(let n=1 ; n<Math.pow(2,nItem) ; n++){
	// TODO: change loop to function calls to be able to update dom inbetween
	if(typeof document != "undefined")
	    document.querySelector("#avancement").innerText=n+"/"+(Math.pow(2,nItem)-1);
	await createCardInLoop(n);
	console.log("étape", n);
	// docu.rect((n-1)%3*64+0,0,64,89);
    }
    if(otherSideDataUrl != "") {
	docu.addPage();
	for(let n2=1; n2<=nPerPage; n2++) {
	    let [cx,cy,lx,ly] = [margin+(n2-1)%(nx)*cardDimX,margin+Math.floor((n2-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY];
	    createCardVerso(docu,cx,cy,lx,ly, json);
	    // docu.addImage(otherSideDataUrl, pageDimX-cx-lx,cy,lx,ly, "backgroundimage", "backgroundimage");
	}
    }
    // alert("document created");
    return docu;
//    docu.save("my.pdf");

};

if(!(typeof exports === 'undefined')) {
    exports.printFromJSON = printFromJSON;
    exports.createCard = createCard;
}
