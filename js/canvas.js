import { canvasData, saveData, editTextMode } from './index.js';

let canvas, ctx;
let draggable = false;
let draggableItem = null;

let drawTextBoxState = false;
let selectedTextBoxIndex = null;
let textBoxPosition = { startX: 0, startY: 0, boxWidth: 0, boxHeight: 0, stokeColor: '#000', lineWidth: 0.1, text: "" }

const canvasBg = new Image();
canvasBg.src = '../assets/bg/dotted.png';

const initCanvas = () => {
    // Init
    canvas = document.getElementById('mainCanvas');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext('2d');

    addMouseLisiners();
    loadCanvasImages();
    animateFrame();
}

const canvas_ImageRender = () => {
    ctx.save();
    canvasData.ImagesObj.forEach(obj => {
        const img = new Image();
        img.src = obj.imageData.image_b64;
        if (obj.img) {
            ctx.beginPath();

            let cal_pos = {
                x: (canvas.clientWidth * obj.offset_x),
                y: (canvas.clientHeight * obj.offset_y)
            }
            // Create Main box
            ctx.rect(cal_pos.x, cal_pos.y, obj.imageData.width, obj.imageData.height);

            // Create Image
            ctx.drawImage(img, cal_pos.x, cal_pos.y, obj.imageData.width, obj.imageData.height);

            if (!editTextMode) {
                // For Image Text
                ctx.font = "18px Arial";
                ctx.textAlign = "start";
                ctx.fillStyle = "#000000";
                ctx.fillText(obj.imageData.title, cal_pos.x, cal_pos.y - 20);

                // Add Main Box border
                ctx.lineWidth = 0.1;
                ctx.strokeStyle = '#000000';
                ctx.stroke();
            }
        }
    });
    ctx.restore();
}

const canvas_textBoxRender = () => {
    canvasData.TagsObj.forEach((tb, index) => {
        let cal_pos = {
            x: (canvas.clientWidth * tb.startX),
            y: (canvas.clientHeight * tb.startY)
        }
        ctx.save();
        ctx.beginPath();
        if (editTextMode) {
            ctx.rect(cal_pos.x, cal_pos.y, tb.boxWidth, tb.boxHeight);
            ctx.lineWidth = tb.lineWidth;
            ctx.strokeStyle = tb.stokeColor;
            ctx.stroke();
            ctx.fillStyle = `rgba(0,0,0,${(selectedTextBoxIndex === index) ? 0.2 : 0})`;
            ctx.fill();
        }
        canvas_add_text(tb)
    });
    ctx.restore();
}

const canvas_add_text = (textObj) => {
    // Reference: https://codepen.io/nishiohirokazu/pen/jjNyye
    var words = (textObj.text !== "") ? textObj.text.split(' ') : "Please Type here";
    var line = '';
    var lineHeight = 24;
    let pedding = 15;

    let cal_pos = {
        x: (canvas.clientWidth * textObj.startX),
        y: (canvas.clientHeight * textObj.startY)
    }

    let x = cal_pos.x + pedding,
        y = cal_pos.y + pedding;
    ctx.font = "14px Roboto";

    for (var n = 0; n < words.length; n++) {
        var testLine = line + words[n] + ' ';
        var metrics = ctx.measureText(testLine);
        var testWidth = metrics.width;
        if (testWidth > textObj.boxWidth - pedding && n > 0) {
            ctx.fillStyle = "#000";
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        }
        else {
            line = testLine;
        }
    }
    ctx.fillStyle = "#000";
    ctx.fillText(line, x, y);
}

const loadCanvasImages = () => {
    canvasData.ImagesObj.forEach((d, index) => {
        const img = new Image();
        img.src = d.imageData.image_b64;
        img.onload = () => {
            canvasData.ImagesObj[index] = {
                ...d,
                img,
            };
        };
    });
}

const addMouseLisiners = () => {
    // For Computer
    canvas.onmousedown = (e) => mouseClick(e);
    canvas.onmouseup = (e) => mouseUp(e);
    canvas.onmouseout = (e) => mouseOut(e);
    canvas.onmousemove = (e) => mouseMove(e);

    // For mobile
    canvas.ontouchstart = (e) => mouseClick(e);
    canvas.ontouchend = (e) => mouseUp(e);
    canvas.ontouchcancel = (e) => mouseOut(e);
    canvas.ontouchmove = (e) => mouseMove(e);

    const mouseUp = (e) => {
        if (drawTextBoxState && e.shiftKey) {
            saveNewTextBox()
        } else if (draggable || drawTextBoxState) {
            saveData();
        };
        drawTextBoxState = false;
        draggable = false;
    }
    const mouseOut = (e) => {
        draggable = false;
        drawTextBoxState = false;
    }
    const mouseClick = (e) => {
        let pos_x = (e.touches) ? e.touches[0].pageX : e.pageX - e.currentTarget.offsetLeft,
            pos_y = (e.touches) ? e.touches[0].pageY : e.pageY - e.currentTarget.offsetTop;

        // Define which mode user selected.
        let targetObject = [...(editTextMode) ? canvasData.TagsObj : canvasData.ImagesObj];

        // for draw textbox
        if (editTextMode && e.shiftKey) {
            drawTextBoxState = true;
            textBoxPosition.startX = pos_x;
            textBoxPosition.startY = pos_y;
        }

        // Define draggable object. Image <or> TextBox ? 
        // reverse() for fixing the overlap rectangles. ## Can use findLastIndex() instead but it is not working in Firefox.
        let findObjIndex = targetObject.reverse().findIndex(obj =>
            pos_x >= ((editTextMode) ? (canvas.clientWidth * obj.startX) : (canvas.clientWidth * obj.offset_x)) &&
            pos_x <= ((editTextMode) ? (canvas.clientWidth * obj.startX) + obj.boxWidth : (canvas.clientWidth * obj.offset_x) + obj.img.width) &&
            pos_y >= ((editTextMode) ? (canvas.clientHeight * obj.startY) : (canvas.clientHeight * obj.offset_y)) &&
            pos_y <= ((editTextMode) ? (canvas.clientHeight * obj.startY) + obj.boxHeight : (canvas.clientHeight * obj.offset_y) + obj.img.height)
        );

        draggableItem = findObjIndex >= 0 ? (targetObject.length - 1) - findObjIndex : -1;
        if (draggableItem >= 0) {
            draggable = true;
            if (editTextMode) {
                selectedTextBoxIndex = draggableItem;
                document.getElementById("textEditorWrapper").querySelector('input').removeAttribute("disabled");
                document.getElementById("textEditorWrapper").querySelector('input').value = canvasData.TagsObj[selectedTextBoxIndex].text;
            }
        } else {
            draggable = false;
            selectedTextBoxIndex = null;
            document.getElementById("textEditorWrapper").querySelector('input').setAttribute("disabled", '');
        }
    }
    const mouseMove = (e) => {
        let pos_x = (e.touches) ? e.touches[0].pageX : e.pageX - e.currentTarget.offsetLeft,
            pos_y = (e.touches) ? e.touches[0].pageY : e.pageY - e.currentTarget.offsetTop;

        if (draggable) {
            // set the cursor position and fix cursor to center of the image.
            if (!editTextMode) {
                canvasData.ImagesObj[draggableItem].offset_x = (pos_x - canvasData.ImagesObj[draggableItem].imageData.width / 2) / canvas.clientWidth;
                canvasData.ImagesObj[draggableItem].offset_y = (pos_y - canvasData.ImagesObj[draggableItem].imageData.height / 2) / canvas.clientHeight;
            } else {
                canvasData.TagsObj[selectedTextBoxIndex].startX = (pos_x - canvasData.TagsObj[selectedTextBoxIndex].boxWidth / 2) / canvas.clientWidth;
                canvasData.TagsObj[selectedTextBoxIndex].startY = (pos_y - canvasData.TagsObj[selectedTextBoxIndex].boxHeight / 2) / canvas.clientHeight;
            }
        }

        // Draw Text Box
        if (editTextMode && drawTextBoxState && e.shiftKey) {
            textBoxPosition.boxWidth = pos_x - textBoxPosition.startX;
            textBoxPosition.boxHeight = pos_y - textBoxPosition.startY;
        } else {
            drawTextBoxState = false;
        }
    };

    // Add keydown event to document
    document.addEventListener("keydown", (e) => {
        if (selectedTextBoxIndex !== null) {
            document.getElementById("textEditorWrapper").querySelector('input').focus();
        }
    });
    document.addEventListener("keyup", (e) => {
        if (selectedTextBoxIndex !== null) {
            canvasData.TagsObj[selectedTextBoxIndex].text = document.getElementById("textEditorWrapper").querySelector('input').value;
            saveData();
        }
    });

    // Responsive
    window.addEventListener('load', resize, false);
    window.addEventListener('resize', resize, false);
}

const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Laptop Screen size.
    let errorWrapper = document.getElementById("screenError");
    if ((window.innerHeight < 760) || (window.innerWidth < 1336)) {
        errorWrapper.classList.add("active");
        errorWrapper.innerHTML = 'This website need to optimize under 1336x760 screen resolution';
    } else {
        errorWrapper.innerHTML = "";
        errorWrapper.classList.remove("active");
    }

}

const drawTextBox = () => {
    ctx.save();
    ctx.beginPath();
    ctx.rect(textBoxPosition.startX, textBoxPosition.startY, textBoxPosition.boxWidth, textBoxPosition.boxHeight);
    ctx.lineWidth = textBoxPosition.lineWidth;
    ctx.strokeStyle = textBoxPosition.stokeColor;
    ctx.stroke();
}

const saveNewTextBox = () => {
    textBoxPosition.startX = textBoxPosition.startX / canvas.width;
    textBoxPosition.startY = textBoxPosition.startY / canvas.height;

    canvasData.TagsObj = [...canvasData.TagsObj, textBoxPosition];
    // Reset textBoxPosition
    drawTextBoxState = false;
    textBoxPosition = { startX: 0, startY: 0, boxWidth: 0, boxHeight: 0, stokeColor: '#000', lineWidth: 0.1, text: "" };

    // Auto select new textbox
    selectedTextBoxIndex = canvasData.TagsObj.length - 1;
    document.getElementById("textEditorWrapper").querySelector('input').removeAttribute("disabled");
    document.getElementById("textEditorWrapper").querySelector('input').value = canvasData.TagsObj[selectedTextBoxIndex].text;
    saveData();
}

const animateFrame = () => {
    if (ctx && canvasData.ImagesObj) {
        // const pattern = ctx.createPattern(canvasBg, 'repeat');
        // ctx.fillStyle = pattern;
        // ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

        canvas_ImageRender();
        canvas_textBoxRender();
        if (drawTextBoxState) drawTextBox();
    }
    window.requestAnimationFrame(animateFrame);
}

export {
    initCanvas,
    loadCanvasImages
}