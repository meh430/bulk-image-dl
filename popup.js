//warning for nothing to download
//TODO: download all in current page?
//back button, download button, list of image with check boxes?
//when scrape pressed, inject content script that then ends another message?
const formats = ["png", "jpg", "gif"];
let selectedImages = [];
let dlOpenButton = document.getElementById("downloadOpen");
let dlSelButton = document.getElementById("downloadSelected");
let dlPage = document.getElementById("downloadPage");

let listCont = document.getElementById('listContainer')

chrome.runtime.onMessage.addListener((message, sender, sendRes) => {
    if ('images' in message) {
        message.images.forEach(image => {
            if (!selectedImages.includes(image)) {
                selectedImages.push(image);
            }
        })
        chrome.storage.sync.set({ downloadLinks: selectedImages }, () => {
            console.log('Added images on page')
        })
    }
})

chrome.storage.sync.get(['downloadLinks'], links => {
    selectedImages = links.downloadLinks
    updateUL(selectedImages);
})

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(changes)
    if ('downloadLinks' in changes) {
        selectedImages = changes['downloadLinks'].newValue
        updateUL(selectedImages)
    }
})

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

dlSelButton.addEventListener("click", event => {
    selectedImages.forEach(url => {
        chrome.downloads.download({ url: url }, (downloadId) => console.log(`Downloaded ${url}`))
    })

    selectedImages = []
    chrome.storage.sync.set({downloadLinks: []}, () => {
        console.log("downloaded all selected");
    })
})

dlPage.addEventListener("click", (event) => {
    console.log(selectedImages)
    chrome.tabs.executeScript({code: "let imageTags = document.querySelectorAll('img');let urls = [];for (let i = 0; i < imageTags.length; i++) {urls.push(imageTags[i].src);}chrome.runtime.sendMessage({ images: urls }, (response) => console.log(response));"})
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
        //item.appendChild(document.createTextNode(word));
        itemImage = document.createElement("img")
        itemImage.setAttribute("src", url)
        item.appendChild(itemImage)
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
            const clickedImage = clickedElement.src
            let clickedIndex = -1;
            clickedIndex = selectedImages.indexOf(clickedImage);
            if (clickedIndex > -1) {
                selectedImages.splice(clickedIndex, 1);
            }
            

            chrome.storage.sync.set({downloadLinks: selectedImages }, () => {
                console.log("Updated deletion");
            });
        });
        listCont.appendChild(item);
    });
}