let updateItem = function(i) {
    let image = document.querySelector("#img-item-"+i);
    let reader  = new FileReader();
    let [dX,dY] = [document.querySelector(".card").offsetWidth, document.querySelector(".card").offsetHeight];
    let file = document.querySelector('#file'+i).files[0];
    reader.addEventListener("load", function () {
	image.onload= () => {
	    image.width = dX/3;
	    if(i%2)
		image.style.left = (5/9*dX)+"px";
	    else
		image.style.left = (1/9*dX)+"px";
	    // alert(image.offsetHeight);
	    image.style.top = (dY/4-image.offsetHeight/2+Math.floor(i/2)*dY/4)+"px";
	};

	image.src = reader.result;
    });
    if(file) {
	reader.readAsDataURL(file);
    }
};

for(let i=0; i<6;i++) {
    document.querySelector("#file"+i).addEventListener("change", () => {updateItem(i);});
}

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
	scaleTool.originTarget = ev.target;
    }
};
scaleTool.mouseClick = (ev) => {console.log(ev);};
scaleTool.mouseMove = (ev) => {
    if(typeof (scaleTool.originClick) != "undefined") {
	scaleTool.originTarget.width = scaleTool.originalWidth + (ev.pageX - scaleTool.originClick[0]);
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

let printCross = (docu, x,y) => {
    docu.line(x-2,y,x+2,y);
    docu.line(x,y-2,x,y+2);  
};

let print = () => {
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
    let docu = new jspdf.jsPDF(landscape ? "l" : "p", "mm", pageDim);
	
    docu.setDrawColor(220,220,220);
    
    for(let n=1 ; n<Math.pow(2,6) ; n++){
	console.log("étape", n);
	// docu.rect((n-1)%3*64+0,0,64,89);
	if((n-1)%(nx*ny)==0 && n>1)
	    docu.addPage();
	// console.log("rect",margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY);
	let [cx,cy,lx,ly] = [margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY];
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


////////////////////////////::
// Pour plus tard (svg to jpg)
////////////////////////////::

/**
 * converts a base64 encoded data url SVG image to a PNG image
 * @param originalBase64 data url of svg image
 * @param width target width in pixel of PNG image
 * @return {Promise<String>} resolves to png data url of the image
 */
function base64SvgToBase64Png (originalBase64, width) {
    return new Promise(resolve => {
	let img = document.createElement('img');
	img.onload = function () {
	    document.body.appendChild(img);
	    let canvas = document.createElement("canvas");
	    document.body.appendChild(canvas);
	    console.log(canvas);
	    let ratio = (img.clientWidth / img.clientHeight) || 1;
	    document.body.removeChild(img);
	    canvas.width = width*10;
	    canvas.height = canvas.width / ratio;
	    let ctx = canvas.getContext("2d");
	    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
	    try {
		let data = canvas.toDataURL('image/png');
		console.log("canvas.width", canvas.width);
		resolve([data, canvas.width, canvas.height]);
	    } catch (e) {
		resolve(null);
	    }
	};
	img.src = originalBase64;
    });
}
