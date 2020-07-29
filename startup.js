chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({})],
            actions: [new chrome.declarativeContent.ShowPageAction()],
        }, ]);
    });

    chrome.storage.sync.set({
        closeTab: false,
        downloadLinks: []
    }, () => {
        console.log("Set up storage");
    });

    let conMenu = {
        id: "imId",
        title: "Add image to download list",
        visible: true,
        contexts: ["image"],
    };

    chrome.contextMenus.create(conMenu);
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if ("mediaType" in info && info["mediaType"] === "image" && info["srcUrl"] !== undefined) {
        chrome.storage.sync.get(["downloadLinks"], (links) => {
            if (!links.downloadLinks.includes(info["srcUrl"])) {
                links.downloadLinks.push(info["srcUrl"]);
                chrome.storage.sync.set({
                    downloadLinks: links.downloadLinks
                }, () => {
                    console.log("Updated links");
                });
            }
        });
    }
});