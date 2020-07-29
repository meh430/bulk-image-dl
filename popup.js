//right click to add image src to list, save list in storage
//when storage changes, update the list?
const formats = ["png", "jpg", "gif"];
let openImages = [];
let selectedImages = [];

let dlButton = document.getElementById("downloadButton");

dlButton.addEventListener("click", (event) => {
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
            if (viewingWords) {
                clickedIndex = blockedWords.indexOf(clickedText);
                if (clickedIndex > -1) {
                    blockedWords.splice(clickedIndex, 1);
                }
                updateUL(blockedWords);
            } else {
                clickedIndex = blockedUrls.indexOf(clickedText);
                if (clickedIndex > -1) {
                    blockedUrls.splice(clickedIndex, 1);
                }
                updateUL(blockedUrls);
            }

            chrome.storage.sync.set({ bWords: blockedWords, bUrls: blockedUrls, globalOff: filterOff }, () => {
                console.log("Updated deletion");
            });
        });
        listCont.appendChild(item);
    });
}