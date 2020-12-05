let updateItem = function(i) {
    let image = document.querySelector("#img-item-"+i);
    let reader  = new FileReader();
    let file = document.querySelector('#file'+i).files[0];
    reader.addEventListener("load", function () {
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
scaleTool.mouseUp = (ev) => {scaleTool.originClick = undefined;};
scaleTool.mouseDown = (ev) => {
    scaleTool.originClick = [ev.pageX, ev.pageY];
    scaleTool.originalWidth = ev.target.width;
};
scaleTool.mouseClick = (ev) => {console.log(ev);};
scaleTool.mouseMove = (ev) => {
    if(typeof (scaleTool.originClick) != "undefined") {
	ev.target.width = scaleTool.originalWidth + (ev.pageX - scaleTool.originClick[0]);
    }
};

////////////////////////////::
// Move Tool
////////////////////////////::

let moveTool = new Object();
moveTool.mouseUp = (ev) => {moveTool.originClick = undefined;};
moveTool.mouseDown = (ev) => {
    moveTool.originClick = [ev.pageX, ev.pageY];
    moveTool.originPosition = getCoordOfElem(ev.target);
};
moveTool.mouseClick = (ev) => {console.log(ev);};
moveTool.mouseMove = (ev) => {
    if(typeof (moveTool.originClick) != "undefined") {
	console.log(ev.target);
	ev.target.style.left=(moveTool.originPosition[0]+(ev.pageX-moveTool.originClick[0]))+"px";
	ev.target.style.top=(moveTool.originPosition[1]+(ev.pageY-moveTool.originClick[1]))+"px";
	
	moveTool.originClick = [ev.pageX, ev.pageY];
	moveTool.originPosition = getCoordOfElem(ev.target);
	
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
    currentTool = tool;
};
setCurrentTool(noTool);

document.querySelector("#scale-tool").addEventListener("click", () => {setCurrentTool(scaleTool);});
document.querySelector("#move-tool").addEventListener("click", () => {setCurrentTool(moveTool);});

document.querySelectorAll(".item").forEach((item) =>{
    item.addEventListener("mouseup", (ev) => {currentTool.mouseUp(ev);});
    item.addEventListener("mousedown", (ev) => {currentTool.mouseDown(ev);});
    item.addEventListener("click", (ev) => {currentTool.mouseClick(ev);});
    item.addEventListener("mousemove", (ev) => {currentTool.mouseMove(ev);});
});



////////////////////////////::
// Printing
////////////////////////////::

let print = () => {
    let cardDim = [parseInt(document.querySelector("#card-width").value), parseInt(document.querySelector("#card-height").value)];
    let [cardDimX, cardDimY] = cardDim;

    let cardWidth = document.querySelector(".card").offsetWidth;
    let scale = cardDimX/cardWidth;

    let format = document.querySelector("#print-format").value;
    let pageDim, pageDimX, pageDimY;
    if(format == "a4")
	pageDim = [210,297];
    else if(format == "a3")
	pageDim = [210,297];
    else if(format == "a5")
	pageDim = [210,297];
    else if(format == "custom")
	pageDim = [210,297];
    [pageDimX, pageDimY] = pageDim;

    let margin = parseInt(document.querySelector("#print-margin").value);
    
    let nx = Math.floor((pageDimX-2*margin)/(document.querySelector("#card-width").value));
    let ny = Math.floor((pageDimY-2*margin)/(document.querySelector("#card-height").value));

    console.log("nx et ny",nx,ny);
    
    let docu = new jspdf.jsPDF("p", "mm", "a4");
    docu.setDrawColor(220,220,220);
    
    for(let n=1 ; n<Math.pow(2,6) ; n++){
	console.log("étape", n);
	// docu.rect((n-1)%3*64+0,0,64,89);
	if((n-1)%(nx*ny)==0 && n>1)
	    docu.addPage();
	// console.log("rect",margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY);
	docu.rect(margin+(n-1)%(nx)*cardDimX,margin+Math.floor((n-1)%(nx*ny)/(nx))*cardDimY+0,cardDimX,cardDimY);
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
		console.log("canvas.width", canvas.width)
		resolve([data, canvas.width, canvas.height]);
	    } catch (e) {
		resolve(null);
	    }
	};
	img.src = originalBase64;
    });
}
