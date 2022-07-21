import { canvasData, canvasObject, canvasDataHistory, undoCanvas, selectCanvas, saveData, } from './index.js';

const renderHTML_CanvasList = () => {
    document.getElementById('canvasList').innerHTML = '';

    if (canvasObject.length > 0) {
        canvasObject.forEach((_, index) => {
            let canvasSelectBtn = document.createElement('button');
            canvasSelectBtn.innerHTML = index + 1;
            canvasSelectBtn.addEventListener("click", () => selectCanvas(index));
            canvasSelectBtn.className = (canvasData.SelectedIndex === index ? "active" : '');
            document.getElementById('canvasList').append(canvasSelectBtn);
        });
    }
}

const renderHTML_ImageList = () => {
    document.getElementById('imageList').innerHTML = '';

    if (canvasData.ImagesObj.length > 0) {
        canvasData.ImagesObj.forEach((img, index) => {
            let removeBtn = document.createElement('img');
            removeBtn.className = 'deleteFileBtn';
            removeBtn.src = "../assets/icons/cross.png";
            removeBtn.addEventListener("click", () => deleteImage(index));

            let thumbnail = document.createElement('img');
            thumbnail.className = 'thumbnail';
            thumbnail.src = img.imageData.image_b64;

            let thumbnailWrapper = document.createElement('div');
            thumbnailWrapper.className = 'thumbnailWrapper';
            thumbnailWrapper.appendChild(thumbnail);

            let li = document.createElement('li');
            li.innerHTML = `<span>${img.imageData.title}</span>`;
            li.prepend(thumbnailWrapper);
            li.prepend(removeBtn);
            document.getElementById('imageList').append(li);
        });
    } else {
        let li = document.createElement('li');
        li.innerHTML = '<div class="noRecord"> No Image </div>';
        document.getElementById('imageList').append(li);
    }

}

const renderHTML_TagsList = () => {
    document.getElementById('tagsList').innerHTML = '';

    if (canvasData.TagsObj.length > 0) {
        canvasData.TagsObj.forEach((tag, index) => {
            let removeBtn = document.createElement('img');
            removeBtn.className = 'deleteFileBtn';
            removeBtn.src = "../assets/icons/cross.png";
            removeBtn.addEventListener("click", () => deleteTag(index));
            removeBtn.addEventListener("touchstart", () => deleteTag(index));

            let thumbnail = document.createElement('img');
            thumbnail.className = 'thumbnail';
            thumbnail.src = '../assets/icons/tag.png';

            let li = document.createElement('li');
            li.innerHTML = `<span>${(tag.text === "") ? '<< Empty >>' : tag.text}</span>`;;
            li.prepend(thumbnail);
            li.prepend(removeBtn);
            document.getElementById('tagsList').append(li);
        });
    } else {
        let li = document.createElement('li');
        li.innerHTML = '<div class="noRecord"> No Tag </div>';
        document.getElementById('tagsList').append(li);
    }

}

const renderHTML_hiddenTextEditor = () => {
    if (!document.getElementById("textEditorWrapper")) {
        let wrapper = document.createElement('div');
        wrapper.setAttribute("id", "textEditorWrapper");

        let InputTextBox = document.createElement('input');
        InputTextBox.setAttribute('type', 'text');
        wrapper.append(InputTextBox);

        document.getElementsByClassName("rightWrapper")[0].append(wrapper);

    }
}

const renderHTML_RestoreData = () => {
    document.getElementsByClassName("restoreWrapper")[0].innerHTML = '';
    if (canvasDataHistory.length > 0) {
        let btn = document.createElement('img');
        btn.src = '../assets/icons/restore.png';
        btn.addEventListener("click", () => undoCanvas());
        btn.addEventListener("touchstart", () => undoCanvas());
        document.getElementsByClassName("restoreWrapper")[0].append(btn);
    }
}

const htmlRenderer = {
    init: () => {
        renderHTML_ImageList();
        renderHTML_CanvasList();
        renderHTML_TagsList();
        renderHTML_hiddenTextEditor();
        renderHTML_RestoreData();
    }
}

const deleteImage = (index) => {
    canvasData.ImagesObj.splice(index, 1);
    saveData(canvasData.ImagesObj);
    renderHTML_ImageList();
}

const deleteTag = (index) => {
    canvasData.TagsObj.splice(index, 1);
    saveData(canvasData.tagsObj);
    renderHTML_TagsList();
}

export {
    htmlRenderer
}
