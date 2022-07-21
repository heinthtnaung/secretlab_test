import { htmlRenderer } from './html_renderer.js';
import { initCanvas, loadCanvasImages } from './canvas.js';

const canvasObject = JSON.parse(window.localStorage.getItem("canvasObjs"))
    ? [...JSON.parse(window.localStorage.getItem("canvasObjs"))]
    : [{ data: [], tags: [] }];

let canvasData = {
    SelectedIndex: 0,
    // To make it easy to debug; You can directly access "canvasObject"
    ImagesObj: canvasObject[0].data,
    TagsObj: canvasObject[0].tags,
}

let canvasDataHistory = [];

let editTextMode = false // true: focus on text edit and re-position. false: focus image re-position

const uploadImages = (evt) => {
    let canvas = document.getElementById('mainCanvas');

    let fileList = evt.target.files;
    for (let i = 0; i < fileList.length; i++) {
        let file = fileList.item(i);

        // Upload file validation
        if (['image/jpeg', 'image/png'].includes(file.type)) {
            let reader = new FileReader();
            reader.onload = (newImage) => {
                let image_b64 = newImage.target.result;
                const img = new Image();
                img.src = image_b64;
                img.onload = () => {
                    fixBoxSize(canvas, img, (image_size) => {
                        canvasData.ImagesObj.push(
                            {
                                offset_x: 0.5 - ((image_size.width / 2) / canvas.width), // percentage
                                offset_y: 0.5 - ((image_size.height / 2) / canvas.height), // percentage
                                imageData: {
                                    title: file.name,
                                    image_b64,
                                    width: image_size.width,
                                    height: image_size.height
                                }
                            }
                        );
                        saveData();
                        loadCanvasImages();
                        htmlRenderer.init();
                    });
                }
            }
            reader.readAsDataURL(file);
        }

    }

    // Reset input data
    evt.target.value = null;
}

// if "true",data won't store into canvasDataHistory.
const saveData = (restore) => {
    if (JSON.parse(window.localStorage.getItem("canvasObjs")) && !restore)
        canvasDataHistory.push(JSON.parse(window.localStorage.getItem("canvasObjs")));

    canvasObject[canvasData.SelectedIndex].data = canvasData.ImagesObj;
    canvasObject[canvasData.SelectedIndex].tags = canvasData.TagsObj;
    window.localStorage.setItem("canvasObjs", JSON.stringify(canvasObject));
    htmlRenderer.init();
}

const createNewCanvas = () => {
    // Assign empty data for new canvas
    canvasObject.push({ data: [], tags: [] });
    canvasDataHistory = [];
    // Select Last index
    selectCanvas(canvasObject.length - 1);
}

const deleteCanvas = () => {
    if (canvasObject.length > 1) {
        canvasObject.splice(canvasData.SelectedIndex, 1);
        // Select Last index
        selectCanvas(canvasObject.length - 1);
    } else {
        canvasData.SelectedIndex = 0;
    }
}

const selectCanvas = (index) => {
    canvasData.SelectedIndex = index;
    canvasData.ImagesObj = canvasObject[canvasData.SelectedIndex].data;
    canvasData.TagsObj = canvasObject[canvasData.SelectedIndex].tags;

    loadCanvasImages();
    restartHistoryData();
    saveData(true);
}

const undoCanvas = () => {
    if (canvasDataHistory.length > 0) {
        let undoData = [...canvasDataHistory[canvasDataHistory.length - 1]];

        canvasData.ImagesObj = undoData[canvasData.SelectedIndex].data;
        canvasData.TagsObj = undoData[canvasData.SelectedIndex].tags;
        loadCanvasImages();
        canvasDataHistory.pop();
        saveData(true);
    }
    htmlRenderer.init();
}

const restartHistoryData = () => {
    canvasDataHistory = [];
    htmlRenderer.init();
}

const changeEditorMode = () => {
    editTextMode = !editTextMode;
    document.getElementById('changeEditor').classList.toggle("active");
    document.getElementById('currentMode').innerHTML = editTextMode ? "Tagging" : "Image";

    let messageBox = document.getElementById("messageBox");
    messageBox.innerHTML = "";
    if (editTextMode) {
        messageBox.innerHTML = "<p>Press <span> Shift Key </span> to create the Tagging box on the canvas</p>"
    }
    messageBox.classList.toggle("active");
    restartHistoryData();
}

const fixBoxSize = async (frame, source, callback) => {

    let padding = 0;
    let ratio = Math.min(frame.width / (source.width + padding), frame.height / (source.height + padding));
    let width = source.width;
    let height = source.height;

    if (((source.width - padding) > frame.width) || ((source.height - padding) > frame.height)) {
        width = source.width * ratio;
        height = source.height * ratio;
    }

    callback({ width, height })
}

const init = () => {
    document.getElementById('uploadFiles').addEventListener('change', (event) => { uploadImages(event); });
    document.getElementById('createNewCanvas').addEventListener('click', () => { createNewCanvas(); });
    document.getElementById('deleteCanvas').addEventListener('click', () => { deleteCanvas(); });
    document.getElementById('changeEditor').addEventListener('click', () => { changeEditorMode(); });

    initCanvas();
    htmlRenderer.init();
}

export {
    canvasObject,
    canvasData,
    canvasDataHistory,
    undoCanvas,

    editTextMode,
    selectCanvas,
    saveData,
    fixBoxSize
}

init();
