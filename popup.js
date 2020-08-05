import {toaster} from './toaster'
//TODO: add minimum width and height filter?
//TODO: make ui look a little nicer?
//TODO: delete from selected if open?
const formats = ["png", "jpg", "svg", "gif"];
let selectedImages = [];
let dlOpenButton = document.getElementById("downloadOpen");
let dlSelButton = document.getElementById("downloadSelected");
let dlPage = document.getElementById("downloadPage");
let settings = document.getElementById("settingsIcon");

let listCont = document.getElementById("listContainer");
chrome.runtime.onMessage.addListener((message, sender, sendRes) => {
    if ("images" in message) {
        message.images.forEach((image) => {
            if (!selectedImages.includes(image)) {
                selectedImages.push(image);
            }
        });
        chrome.storage.local.set({ downloadLinks: selectedImages }, () => {
            console.log("Added images on page");
        });
    }

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.update(tabs[0].id, { url: tabs[0].url });
    });
});

chrome.storage.local.get(["downloadLinks"], (links) => {
    selectedImages = links.downloadLinks;
    updateUL(selectedImages);
    displayClearButton();
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(changes);
    if ("downloadLinks" in changes) {
        selectedImages = changes["downloadLinks"].newValue;
        displayClearButton();
        updateUL(selectedImages);
    }
});

dlOpenButton.addEventListener("click", (event) => {
    chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
            const currUrl = tab.url;
            let downloadable = false;
            for (let i = 0; i < formats.length; i++) {
                if (currUrl.includes(formats[i])) {
                    downloadable = true;
                    break;
                }
            }

            if (downloadable) {
                chrome.downloads.download({ url: currUrl }, (downloadId) => chrome.tabs.remove(tab.id));
            }
        });
    });
});

dlSelButton.addEventListener("click", (event) => {
    selectedImages.forEach((url) => {
        chrome.downloads.download({ url: url }, (downloadId) => console.log(`Downloaded ${url}`));
    });

    selectedImages = [];
    chrome.storage.local.set({ downloadLinks: [] }, () => {
        console.log("downloaded all selected");
    });
});

dlPage.addEventListener("click", (event) => {
    console.log(selectedImages);
    chrome.tabs.executeScript({
        code:
            "let urls = [];document.querySelectorAll('img').forEach(img => urls.push(img.src));chrome.runtime.sendMessage({ images: urls }, (response) => console.log(response));",
    });
});

settings.addEventListener("click", (event) => {
    chrome.runtime.openOptionsPage();
})

function deleteChildren(node) {
    console.log(node);
    while (node.firstChild) {
        node.removeChild(node.lastChild);
    }
}

function updateUL(list) {
    deleteChildren(listCont);
    let item = {};
    console.log(list);
    list.forEach((url) => {
        item = document.createElement("li");
        item.className = "itemStyle";
        itemImage = document.createElement("img");
        itemImage.setAttribute("src", url);
        itemImage.setAttribute("style", "max-width:250px; max-height: 250px; border-radius: 8px; margin-bottom: 4px;");
        item.appendChild(itemImage);
        item.appendChild(document.createTextNode(url));
        item.addEventListener("mouseover", (event) => {
            const clickedElement = event.target || event.srcElement;
            clickedElement.style.color = "red";
        });
        item.addEventListener("mouseout", (event) => {
            const clickedElement = event.target || event.srcElement;
            clickedElement.style.color = "white";
        });
        item.addEventListener("click", (event) => {
            const clickedElement = event.target || event.srcElement;
            const clickedImage = clickedElement.src || clickedElement.textContent;
            let clickedIndex = -1;
            clickedIndex = selectedImages.indexOf(clickedImage);
            if (clickedIndex > -1) {
                selectedImages.splice(clickedIndex, 1);
            }

            chrome.storage.local.set({ downloadLinks: selectedImages }, () => {
                console.log("Updated deletion");
            });
        });
        listCont.appendChild(item);
    });
}

function insertAfter(newNode, refNode) {
    refNode.parentNode.insertBefore(newNode, refNode.nextSibling);
}

function displayClearButton() {
    if (selectedImages.length >= 1 && document.getElementById("clearButton") == undefined) {
        let clrButton = document.createElement("button");
        clrButton.id = "clearButton";
        clrButton.appendChild(document.createTextNode("Clear Images"));
        clrButton.addEventListener("click", (event) => {
            selectedImages = [];
            chrome.storage.local.set({ downloadLinks: [] }, () => console.log("cleared images"));
        });
        insertAfter(clrButton, document.getElementById("divider"));
    } else if (selectedImages.length == 0 && document.getElementById("clearButton") != undefined) {
        let clrButton = document.getElementById("clearButton");
        clrButton.parentNode.removeChild(clrButton);
    }
}
