//right click to add image src to list, save list in storage
//when storage changes, update the list?
const formats = ["png", "jpg", "gif"];
let selectedImages = [];
let dlOpenButton = document.getElementById("downloadOpen");
let dlSelButton = document.getElementById("downloadSelected");

let listCont = document.getElementById('listContainer')

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
    list.forEach((word) => {
        item = document.createElement("li");
        item.className = "itemStyle";
        item.appendChild(document.createTextNode(word));
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
            const clickedText = clickedElement.textContent;
            let clickedIndex = -1;
            clickedIndex = selectedImages.indexOf(clickedText);
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