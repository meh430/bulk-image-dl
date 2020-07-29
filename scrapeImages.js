let imageTags = document.querySelectorAll('img');
let urls = [];


for (let i = 0; i < imageTags.length; i++) {
    urls.push(imageTags[i].src);
}

chrome.runtime.sendMessage({ images: urls }, (response) => console.log(response));