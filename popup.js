const formats = ["png", "jpg", "gif"];
let selectedImages = [];
let dlOpenButton = document.getElementById("downloadOpen");
let dlSelButton = document.getElementById("downloadSelected");
let dlPage = document.getElementById("downloadPage");

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
});

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(changes);
    if ("downloadLinks" in changes) {
        selectedImages = changes["downloadLinks"].newValue;
        if (selectedImages.length >= 1) {
            //clear button
            let clrButton = document.createElement("button")
            clrButton.id = "clearButton"
            clrButton.createTextNode("Clear Images")
            insertAfter(clrButton, document.getElementById("divider"))
        } else {
            let clrButton = document.getElementById("clearButton")
            clrButton.parentNode.removeChild(clrButton)
        }
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
            "let imageTags = document.querySelectorAll('img');let urls = [];for (let i = 0; i < imageTags.length; i++) {urls.push(imageTags[i].src);}chrome.runtime.sendMessage({ images: urls }, (response) => console.log(response));",
    });
});

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