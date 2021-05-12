let readFile = (file) => {
    return new Promise((resolve) => {
	let reader = new FileReader();
	if(file.type == "image/svg+xml") {
	    reader.addEventListener("load", () => {
		// alert("here");
		console.log(reader.result);
		svgToBase64Png(reader.result, 50).then((data) => {
		    resolve(data);
		});
	    });
	    reader.readAsText(file);
	}
    });
};


let fitInBox = (image, x, y,lx, ly) => {
    let [imageX, imageY ] = [image.offsetWidth, image.offsetHeight];
    let newX, newY;
    if(imageX/imageY>lx/ly) {
	newX = lx;
	newY = newX*imageY/imageX;
	image.style.left = x+"px";
	image.style.top = (y+(ly-newY)/2)+"px";
    }
    else {
	newY = ly;
	newX = newY*imageX/imageY;
	image.style.top = y+"px";
	image.style.left = (x+(lx-newX)/2)+"px";
    }
    image.width = newX;
    // cardElem.style.height = newY+"px";
};

let placeItem = (image,i) => {
    let [lineNumber, columnNumber] = [parseInt(document.querySelector("#card-line-number").value), parseInt(document.querySelector("#card-column-number").value)];
    let [dX,dY] = [document.querySelector(".card").offsetWidth, document.querySelector(".card").offsetHeight];
    let rx = parseFloat(document.querySelector("#ratio-number").value), ry=parseFloat(document.querySelector("#ratio-number").value);
    // let rx = 3/4, ry=3/4;
    let lX = (1-rx)/(columnNumber+1)*dX;
    let LX = (rx)/columnNumber*dX;
    let lY = (1-ry)/(lineNumber+1)*dY;
    let LY = (ry)/(lineNumber)*dY;
    let boxX,boxY,boxLX=LX,boxLY=LY;

    boxX = lX + (i%columnNumber)*(LX+lX);
    boxY = lY + Math.floor(i/columnNumber)*(lY+LY);

    fitInBox(image, boxX, boxY, boxLX, boxLY);
    
};

let defaultItem = function(i) {
    let svg = document.querySelector("svg");
    let color;
    switch(i) {
    case 0: color = "rgb(212,0,0)"; break;
    case 1: color = "rgb(255,102,0)"; break;
    case 2: color = "rgb(255,204,0)"; break;
    case 3: color = "rgb(136, 170, 0)"; break;
    case 4: color = "rgb(0, 102, 255)"; break;
    case 5: color = "rgb(102, 0, 128)"; break;
    default:     color = "rgb("+Math.floor(Math.random() * 255) + ","+Math.floor(Math.random() * 255) + ","+Math.floor(Math.random() * 255) + ")"; break;
	
    }


    svg.querySelector("circle").style.fill = color;
    var svg64 = btoa(new XMLSerializer().serializeToString(svg));
    var svg65 = new XMLSerializer().serializeToString(svg);
    svgToBase64Png(new XMLSerializer().serializeToString(svg),100).then((image65) => {
	// var image64 = 'data:image/svg+xml;base64,' + svg64;
	let image = (typeof(i) == "number") ? document.querySelector("#img-item-"+i) : i;
	image.onload= () => {
	    placeItem(image,i);
	};
	image.src = image65;
	
    });
};
let updateItem = function(i) {
    console.log("updateItem called");
    let image = (typeof(i) == "number") ? document.querySelector("#img-item-"+i) : i;
    let reader  = new FileReader();
    let file = document.querySelector('#file'+i).files[0];
    if(file && file.type == "image/svg+xml") {
	readFile(file).then((data) => {
	    // alert(data);
	    image.onload= () => {
		placeItem(image,i);
	    };
	    image.src = data;
	    
	});
	return;
    }
    if(file && file.type != "image/png" && file.type != "image/jpeg" && file.type != "image/svg+xml") {
	alert("Only jpg and png files are allowed");
	document.querySelector('#file'+i).value="";
	return;
    }
    reader.addEventListener("load", function () {
	image.onload= () => {
	    placeItem(image,i);
	};
	image.src = reader.result;
    });
    if(file) {
	reader.readAsDataURL(file);
    }
};

for(let i=0; i<6;i++) {
    document.querySelector("#file"+i).addEventListener("change", () => {updateItem(i);});
    document.querySelector("#default-"+i).addEventListener("click", () => {defaultItem(i);});
    updateItem(i);
}

let updateBackground = function() {
    let reader  = new FileReader();
    let file = document.querySelector('#background-input').files[0];
    // alert(file ?  file.type:"");
    if(file && file.type != "image/png" && file.type != "image/jpeg" && file.type != "image/svg+xml") {
	alert("Only jpg, svg and png files are allowed");
	document.querySelector('#background-input').value="";
	return;
    }
    if(file && file.type == "image/svg+xml") {
	readFile(file).then((data) => {
	    // alert(data);
	    document.querySelector(".card").style.backgroundImage = "url("+ data +")";	    
	});
	return;
    }
    // let image = document.querySelector("#card-background");
    reader.addEventListener("load", function () {
	// image.src = reader.result;
	document.querySelector(".card").style.backgroundImage = "url("+ reader.result +")";
    });
    if(file) {
	reader.readAsDataURL(file);
    }
};

let otherSideDataUrl = "";
let saveOtherSide = function() {
    let reader  = new FileReader();
    let file = document.querySelector('#other-side-input').files[0];
    if(file && file.type != "image/png" && file.type != "image/jpeg") {
	alert("Only jpg and png files are allowed");
	document.querySelector('#other-side-input').value="";
	return;
    }
    reader.addEventListener("load", function () {
	otherSideDataUrl = reader.result;
    });
    if(file) {
	reader.readAsDataURL(file);
    }
};

document.querySelector("#background-input").addEventListener("change", () => {updateBackground();});
updateBackground();
document.querySelector("#other-side-input").addEventListener("change", () => {saveOtherSide();});
saveOtherSide();

let getCoordInElem = (ev) => {
    return [ev.pageX - ev.target.offsetLeft, ev.pageY - ev.target.offsetTop];
};
let getCoordOfElem = (elem) => {
    return [elem.offsetLeft, elem.offsetTop];
};

let scaleDistance = (x,y) => {
    return Math.sqrt((x[0]-y[0])*(x[0]-y[0])+(x[1]-y[1])*(x[1]-y[1]));
};

////////////////////////////::
// Scale Tool
////////////////////////////::

let scaleTool = new Object();
scaleTool.elem = document.querySelector("#scale-tool");
scaleTool.mouseUp = (ev) => {
    scaleTool.originClick = undefined;
    scaleTool.originTarget = undefined;
    scaleTool.originalWidth = undefined;
};
scaleTool.mouseDown = (ev) => {
    if(ev.target.classList.contains("item")){
	ev.preventDefault();
	scaleTool.originClick = [ev.pageX, ev.pageY];
	scaleTool.originalWidth = ev.target.width;
	scaleTool.originalHeight = ev.target.offsetHeight;
	scaleTool.originalLeft = ev.target.offsetLeft;
	scaleTool.originalTop = ev.target.offsetTop;
	scaleTool.originTarget = ev.target;
    }
};
scaleTool.mouseClick = (ev) => {console.log(ev);};
scaleTool.mouseMove = (ev) => {
    if(typeof (scaleTool.originClick) != "undefined") {
	scaleTool.originTarget.width = scaleTool.originalWidth + (ev.pageX - scaleTool.originClick[0]);
	scaleTool.originTarget.style.left = (scaleTool.originalLeft - (ev.pageX - scaleTool.originClick[0])/2)+"px";
	scaleTool.originTarget.style.top = ((scaleTool.originalTop + (scaleTool.originalHeight - scaleTool.originTarget.offsetHeight)/2))+"px";
    }
};

////////////////////////////::
// Move Tool
////////////////////////////::

let moveTool = new Object();
moveTool.elem = document.querySelector("#move-tool");
moveTool.mouseUp = (ev) => {
    console.log("mouseup");
    moveTool.originClick = undefined;
    moveTool.originTarget = undefined;
    moveTool.originPosition = undefined;
};
moveTool.mouseDown = (ev) => {
    if(ev.target.classList.contains("item")){
	ev.preventDefault();
	console.log("mousedown");
	moveTool.originClick = [ev.pageX, ev.pageY];
	moveTool.originTarget = ev.target;
	moveTool.originPosition = getCoordOfElem(ev.target);
    }
};
moveTool.mouseClick = (ev) => {console.log(ev);};
moveTool.mouseMove = (ev) => {
    if(typeof (moveTool.originClick) != "undefined") {
	// console.log(ev.target);
	moveTool.originTarget.style.left=(moveTool.originPosition[0]+(ev.pageX-moveTool.originClick[0]))+"px";
	moveTool.originTarget.style.top=(moveTool.originPosition[1]+(ev.pageY-moveTool.originClick[1]))+"px";
	
	moveTool.originClick = [ev.pageX, ev.pageY];
	moveTool.originPosition = getCoordOfElem(moveTool.originTarget);
	
	// console.log([ev.pageX - ev.target.offsetLeft, ev.pageY - ev.target.offsetTop]);
    }
};

////////////////////////////::
// Redispose Tool
////////////////////////////::

let redisposeTool = new Object();
redisposeTool.elem = document.querySelector("#redispose-tool");
redisposeTool.mouseUp = (ev) => {
};
redisposeTool.mouseDown = (ev) => {
};
redisposeTool.mouseClick = (ev) => {
    console.log(ev.target);
    if(ev.target.classList.contains("item")){
	placeItem(ev.target, parseInt(ev.target.getAttribute("item-number")));
    }
    
};
redisposeTool.mouseMove = (ev) => {
};

let noTool = new Object();
noTool.mouseUp = () => {};
noTool.mouseDown = () => {};
noTool.mouseClick = (ev) => {};
noTool.mouseMove = () => {};

let currentTool;


let setCurrentTool = (tool) => {
    document.querySelectorAll(".selected-tool").forEach((elem) => {elem.classList.remove("selected-tool");});
    if(tool.elem) tool.elem.classList.add("selected-tool");
    currentTool = tool;
};
setCurrentTool(noTool);

document.querySelector("#scale-tool").addEventListener("click", () => {setCurrentTool(scaleTool);});
document.querySelector("#move-tool").addEventListener("click", () => {setCurrentTool(moveTool);});
document.querySelector("#redispose-tool").addEventListener("click", () => {setCurrentTool(redisposeTool);});

document.querySelectorAll("#card-container").forEach((item) =>{
    item.addEventListener("mouseup", (ev) => {currentTool.mouseUp(ev);});
    item.addEventListener("mouseleave", (ev) => {currentTool.mouseUp(ev);});
    item.addEventListener("mousedown", (ev) => {currentTool.mouseDown(ev);});
    item.addEventListener("click", (ev) => {currentTool.mouseClick(ev);});
    item.addEventListener("mousemove", (ev) => {currentTool.mouseMove(ev);});
});



////////////////////////////::
// Printing
////////////////////////////::

// let printCross = (docu, x,y) => {
//     docu.line(x-2,y,x+2,y);
//     docu.line(x,y-2,x,y+2);  
// };

async function print () {
    let json = prosetToJSON();
    setTimeout(() =>{
	document.querySelector("#window").style.display = "block";
    },0);
    document.querySelector("#json-source").value = JSON.stringify(json);
    let docu = await printFromJSON(json);
    document.querySelector("#download").style.display="block";
    document.querySelector("#download").onclick = () => {
	docu.save("custom-proset.pdf");
    };
    // printFromXML(prosetToXML());
    return;
    let cardDim = [parseInt(document.querySelector("#card-width").value), parseInt(document.querySelector("#card-height").value)];
    let [cardDimX, cardDimY] = cardDim;

    let cardWidth = document.querySelector(".card").offsetWidth;
    let scale = cardDimX/cardWidth;

    let format = document.querySelector("#print-format").value;
    let landscape = document.querySelector("[value=\"landscape\"]").checked;
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
	pageDim = [parseInt(document.querySelector("#customX").value),parseInt(document.querySelector("#customY").value)];
    if(landscape)
	[pageDimY, pageDimX] = pageDim;
    else
	[pageDimX, pageDimY] = pageDim;

    let margin = parseInt(document.querySelector("#print-margin").value);
    
    let nx = Math.floor((pageDimX-2*margin)/(document.querySelector("#card-width").value));
    let ny = Math.floor((pageDimY-2*margin)/(document.querySelector("#card-height").value));

    if(nx * ny == 0) {
	alert("card too big or paper size too small");
	return;
    }
    console.log("nx et ny",nx,ny);

    let crossChoice;
    if(document.querySelector("input[value=\"box\"]").checked)
	crossChoice = "box";
    else if(document.querySelector("input[value=\"none\"]").checked)
	crossChoice = "none";
    else if(document.querySelector("input[value=\"intersection\"]").checked)
	crossChoice = "intersection";
    // let docu = new jspdf.jsPDF(landscape ? "l" : "p", "mm", pageDim);
	
    docu.setDrawColor(220,220,220);

    let nItem = document.querySelectorAll(".item").length;
    let nPerPage = 0;
    for(let n=1 ; n<Math.pow(2,nItem) ; n++){
	console.log("étape", n);
	// docu.rect((n-1)%3*64+0,0,64,89);
	if((n-1)%(nx*ny)==0 && n>1) {
	    docu.addPage();
	    if(otherSideDataUrl != "") {
		for(let n2=1; n2<=nPerPage; n2++) {
		    let [cx,cy,lx,ly] = [margin+(n2-1)%(nx)*cardDimX,margin+Math.floor((n2-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY];
		    docu.addImage(otherSideDataUrl, pageDimX-cx-lx,cy,lx,ly);
		}
		docu.addPage();
		nPerPage=0;
	    }
	}
	nPerPage++;
	// console.log("rect",margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY);
	let [cx,cy,lx,ly] = [margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY];
	if(document.querySelector(".card").style.backgroundImage != "") {
	    docu.addImage(document.querySelector(".card").style.backgroundImage.substring("5", document.querySelector(".card").style.backgroundImage.length-2), cx,cy,lx,ly);
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
	document.querySelectorAll(".item").forEach((item,i) => {
	    if((n >> i) % 2) {
		// console.log("image", i, "ajoutée");
	    } else {
		
	    }
	    if(item.src != "" && (n >> i) % 2) {
		let [x,y] = getCoordOfElem(item);
		// console.log("addImage",item.src, margin+(n-1)%(nx)*cardDimX+x*scale, margin+Math.floor((n-1)%(nx*ny)/nx)*cardDimY+y*scale, item.width*scale, item.height*scale);
		docu.addImage(item.src, margin+(n-1)%(nx)*cardDimX+x*scale, margin+Math.floor((n-1)%(nx*ny)/nx)*cardDimY+y*scale, item.width*scale, item.height*scale);
	    }
 	});
    }
    if(otherSideDataUrl != "") {
	docu.addPage();
	for(let n2=1; n2<=nPerPage; n2++) {
	    let [cx,cy,lx,ly] = [margin+(n2-1)%(nx)*cardDimX,margin+Math.floor((n2-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY];
	    docu.addImage(otherSideDataUrl, pageDimX-cx-lx,cy,lx,ly);
	}
    }
    docu.save("my.pdf");

};


let updateFormat = () => {
    let val = document.querySelector("#print-format").value;
    if(val == "custom") {
	document.querySelectorAll(".customSizeInput").forEach((elem) => {
	    elem.style.display = "inline";
	});
    }
    else {
	document.querySelectorAll(".customSizeInput").forEach((elem) => {
	    elem.style.display = "none";
	});
    }
};
updateFormat();
document.querySelector("#print-format").addEventListener("change", updateFormat);
updateFormat();


let updateCardSize = () => {
    let dX = parseInt(document.querySelector("#card-width").value);
    let dY = parseInt(document.querySelector("#card-height").value);
    let containerX = document.querySelector("#card-container").offsetWidth;
    let containerY = document.querySelector("#card-container").offsetHeight;

    let cardElem = document.querySelector(".card");
    let newX, newY;
    if(dX/dY>(containerX-40)/(containerY-40)) {
	newX = containerX-40;
	newY = newX*dY/dX;
	cardElem.style.left = 20+"px";
	cardElem.style.top = ((containerY-newY)/2)+"px";
    }
    else {
	newY = containerY-40;
	newX = newY*dX/dY;
	cardElem.style.top = (20)+"px";
	cardElem.style.left = ((containerX-newX)/2)+"px";
    }
    cardElem.style.width = newX+"px";
    cardElem.style.height = newY+"px";
};

document.querySelector("#card-width").addEventListener("change", updateCardSize);
document.querySelector("#card-height").addEventListener("change", updateCardSize);
updateCardSize();


let addNewItem = () => {
    let nItem= document.querySelectorAll(".item").length;
    let newItem = document.createElement("img");
    document.querySelector(".card").appendChild(newItem);
    newItem.outerHTML = '<img width="100px" draggable="false" class="item" alt="" id="img-item-'+nItem+'" item-number="'+nItem+'"/>';
    let newInput = document.createElement("li");
    document.querySelector("#list-inputs").appendChild(newInput);
    newInput.outerHTML = '<li>Item '+nItem+': <input class="file-input" type="file" id="file'+nItem+'"><input name="" type="button" id="default-'+nItem+'" value="Default"/></li>';
    console.log('<li>Item '+nItem+': <input class="file-input" type="file" id="file'+nItem+'"></li>');
    console.log(newInput);
    document.querySelector("#file"+nItem).addEventListener("change", () => {updateItem(nItem);});
    document.querySelector("#default-"+nItem).addEventListener("click", () => {defaultItem(nItem);});
};
let removeItem = () => {
    let nItem= document.querySelectorAll(".item").length;
    document.querySelectorAll("#list-inputs li")[nItem-1].remove();
    document.querySelectorAll(".item")[nItem-1].remove();
};

let updateNItem = () => {
    let newValue = parseInt(document.querySelector("#n-item").value);
    let oldValue = document.querySelectorAll(".item").length;
    while(oldValue != newValue && !isNaN(newValue)) {
	if(newValue<oldValue) {
	    removeItem();
	    oldValue--;
	}
	else {
	    addNewItem();
	    oldValue++;
	}
    }    
};
document.querySelector("#n-item").addEventListener("change", updateNItem);
updateNItem();

////////////////////////////::
// Pour plus tard (svg to jpg)
////////////////////////////::

/**
 * converts a base64 encoded data url SVG image to a PNG image
 * @param originalBase64 data url of svg image
 * @param width target width in pixel of PNG image
 * @return {Promise<String>} resolves to png data url of the image
 */
function svgToBase64Png (originalSvg, width) {
    return new Promise(resolve => {
	let img = document.createElement('img');
	img.classList.add("debug");
	img.onload = function () {
	    document.body.appendChild(img);
	    let canvas = document.createElement("canvas");
	    canvas.classList.add("debug");
	    document.body.appendChild(canvas);
	    console.log(canvas);
	    let ratio = (img.clientWidth / img.clientHeight) || 1;
	    // console.log((originalBase64));
	    if(img.naturalWidth*img.naturalHeight == 0) {
		alert("Your svg file has no width and height defined. This won't work in Firefox due to a longstanding bug. Either use another browser, or manually add size in your svg file");
		// console.log(btoa(originalBase64));
		// console.log(atob(originalBase64));
	    }
	    document.body.removeChild(img);
	    canvas.width = width*10;
	    canvas.height = canvas.width / ratio;
	    let ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	    try {
		let data = canvas.toDataURL('image/png');
		document.body.removeChild(canvas);		
		console.log("canvas.width", canvas.width);
		// resolve([data, canvas.width, canvas.height]);
		resolve(data);
	    } catch (e) {
		resolve(null);
	    }
	};
	var parser = new DOMParser();
	var result = parser.parseFromString(originalSvg, 'text/xml');
	var inlineSVG = result.getElementsByTagName("svg")[0];
	if(!inlineSVG.hasAttribute("width") || !inlineSVG.hasAttribute("height")) {
	    inlineSVG.setAttribute('width', '48px');
	    inlineSVG.setAttribute('height', '48px');
	}
	var svg64 = btoa(new XMLSerializer().serializeToString(result));
	var image64 = 'data:image/svg+xml;base64,' + svg64;
	img.src = image64;
    });
}

function prosetToXML () {
    let saveXMLDoc = document.implementation.createDocument(null, "custom-proset");

    let root = saveXMLDoc.firstChild;

    let printOptions = saveXMLDoc.createElement("print-options");
    printOptions.setAttribute("format", document.querySelector("#print-format [selected]").value);
    printOptions.setAttribute("custom-width", document.querySelector("#customX").value);
    printOptions.setAttribute("custom-height", document.querySelector("#customY").value);
    printOptions.setAttribute("margin", document.querySelector("#print-margin").value);
    printOptions.setAttribute("orientation", document.querySelector('[name="portrait"]:checked').value);
    printOptions.setAttribute("delimiter", document.querySelector('[name="delimiter"]:checked').value);

    root.appendChild(printOptions);

    let card = saveXMLDoc.createElement("card");
    card.setAttribute("width", document.querySelector("#card-width").value);
    card.setAttribute("height", document.querySelector("#card-height").value);
    card.setAttribute("line-number", document.querySelector("#card-line-number").value);
    card.setAttribute("column-number", document.querySelector("#card-column-number").value);
    card.setAttribute("ratio-number", document.querySelector("#ratio-number").value);
    card.setAttribute("background-image", document.querySelector(".card").style.backgroundImage);
    card.setAttribute("other-side-image", otherSideDataUrl);

    let cardWidth = document.querySelector(".card").offsetWidth;
    card.setAttribute( "scale", (parseInt(card.getAttribute("width")))/cardWidth);

    root.appendChild(card);

    let items = saveXMLDoc.createElement("items");
    document.querySelectorAll(".item").forEach((item) => {
	let itemXML = saveXMLDoc.createElement("item");
	itemXML.setAttribute("width", item.width);
	itemXML.setAttribute("height", item.height);
	itemXML.setAttribute("left", item.offsetLeft);
	itemXML.setAttribute("top", item.offsetTop);
	itemXML.setAttribute("src", item.src);
	items.appendChild(itemXML);
    });
    root.appendChild(items);
    return saveXMLDoc;
    // return (new XMLSerializer().serializeToString(saveXMLDoc));
    
}
function prosetToJSON () {
    let json = {};

    let printOptions = {};
    printOptions["format"] = document.querySelector("#print-format [selected]").value;
    printOptions["customWidth"] = document.querySelector("#customX").value;
    printOptions["customHeight"] = document.querySelector("#customY").value;
    printOptions["margin"] = document.querySelector("#print-margin").value;
    printOptions["orientation"] = document.querySelector('[name="portrait"]:checked').value;
    printOptions["delimiter"] = document.querySelector('[name="delimiter"]:checked').value;

    json.printOptions = printOptions;

    let card = {};
    card["width"] = document.querySelector("#card-width").value;
    card["height"] = document.querySelector("#card-height").value;
    card["line-number"] = document.querySelector("#card-line-number").value;
    card["column-number"] = document.querySelector("#card-column-number").value;
    card["ratio-number"] = document.querySelector("#ratio-number").value;
    card["background-image"] = document.querySelector(".card").style.backgroundImage;
    card["other-side-image"] = otherSideDataUrl;

    let cardWidth = document.querySelector(".card").offsetWidth;
    card["scale"] = (parseInt(card["width"]))/cardWidth;

    json.card = card;

    let items = [];
    document.querySelectorAll(".item").forEach((item) => {
	let itemJSON = {};
	itemJSON["width"] = item.width;
	itemJSON["height"] = item.height;
	itemJSON["left"] = item.offsetLeft;
	itemJSON["top"] = item.offsetTop;
	itemJSON["src"] = item.src;
	items.push(itemJSON);
    });
    json.items = items;
    return json;
    // return (new XMLSerializer().serializeToString(saveXMLDoc));
    
}

function XMLToText(xml) {
    return (new XMLSerializer().serializeToString(xml));    
}
function JSONToText(json) {
    return (JSON.stringify(json));    
}

function save() {
    let jsonText = JSONToText(prosetToJSON());
    // let xmlText = XMLToText(prosetToXML());
    
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(jsonText));
    element.setAttribute('download', "custom-proset.txt");

    element.style.display = 'none';
    document.body.appendChild(element);

    element.click();
    
    console.log(jsonText);
    
    document.body.removeChild(element);
}

function load(file) {
    let parser = new DOMParser();
    let xmlDoc = parser.parseFromString(file,"text/xml");
    let card = xmlDoc.querySelector("card");

    // TODO: Load print-options
    document.querySelector("#card-width").value = card.getAttribute("width");
    document.querySelector("#card-width").dispatchEvent(new Event("change"));

    document.querySelector("#card-height").value = card.getAttribute("height");
    document.querySelector("#card-height").dispatchEvent(new Event("change"));

    document.querySelector("#card-column-number").value = card.getAttribute("column-number");
    document.querySelector("#card-column-number").dispatchEvent(new Event("change"));

    document.querySelector("#card-line-number").value = card.getAttribute("line-number");
    document.querySelector("#card-line-number").dispatchEvent(new Event("change"));

    document.querySelector("#ratio-number").value = card.getAttribute("ratio-number");
    document.querySelector("#ratio-number").dispatchEvent(new Event("change"));

    document.querySelector(".card").style.backgroundImage = card.getAttribute("background-image");

    otherSideDataUrl = card.getAttribute("other-side-image");

    xmlDoc.querySelectorAll("items item").forEach((item,i) => {
	let image = document.querySelectorAll(".card .item")[i];
	image.onload= () => {
	    image.style.left = item.getAttribute("left")+"px";
	    image.style.top = item.getAttribute("top")+"px";
	    image.width = item.getAttribute("width");
	};
	image.src = item.getAttribute("src");
    });

}
function loadJSON(file) {
    let json = JSON.parse(file);
    let card = json["card"];
    console.log(json);
    // TODO: Load print-options
    document.querySelector("#card-width").value = card["width"];
    document.querySelector("#card-width").dispatchEvent(new Event("change"));

    document.querySelector("#card-height").value = card["height"];
    document.querySelector("#card-height").dispatchEvent(new Event("change"));

    document.querySelector("#card-column-number").value = card["column-number"];
    document.querySelector("#card-column-number").dispatchEvent(new Event("change"));

    document.querySelector("#card-line-number").value = card["line-number"];
    document.querySelector("#card-line-number").dispatchEvent(new Event("change"));

    document.querySelector("#ratio-number").value = card["ratio-number"];
    document.querySelector("#ratio-number").dispatchEvent(new Event("change"));

    document.querySelector(".card").style.backgroundImage = card["background-image"];

    otherSideDataUrl = card["other-side-image"];

    json.items.forEach((item,i) => {
	let image = document.querySelectorAll(".card .item")[i];
	image.onload= () => {
	    let cardOldWidth = (parseInt(card["width"]))/ card["scale"];
	    let cardNewWidth = document.querySelector(".card").offsetWidth;
	    image.style.left = (parseInt(item["left"])*(cardNewWidth/cardOldWidth))+"px";
	    image.style.top = (parseInt(item["top"])*(cardNewWidth/cardOldWidth))+"px";
	    // image.style.top = (parseInt(item["top"])*(card.scale*document.querySelector(".card").offsetWidth))+"px";
	    image.width = (item["width"]*(cardNewWidth/cardOldWidth));
	};
	image.src = item["src"];
    });

}
let loadCaller = () => {
    let reader  = new FileReader();
    let file = document.querySelector('#load-input').files[0];
    reader.addEventListener("load", function () {
	loadJSON(reader.result);
    });
    if(file) {
	reader.readAsText(file);
    }
};

document.querySelector("#save-input").addEventListener("click", save);
document.querySelector("#load-input").addEventListener("change", loadCaller);

function hideWindows() {
    document.querySelector("#window").style.display="none";   
    document.querySelector("#window2").style.display="none";   
}
function showIntro() {
    document.querySelector("#window2").style.display="block";   
}
