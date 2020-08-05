chrome.runtime.onInstalled.addListener(() => {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
        chrome.declarativeContent.onPageChanged.addRules([
            {
                conditions: [new chrome.declarativeContent.PageStateMatcher({})],
                actions: [new chrome.declarativeContent.ShowPageAction()],
            },
        ]);
    });

    chrome.sync.local.set({dlTab: true, closeTab: false, minWidth: 100, minHeight: 100}, () => console.log("Set up sync storage"))

    chrome.storage.local.set(
        {
            downloadLinks: [],
        },
        () => {
            console.log("Set up local storage");
        }
    );

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
        chrome.storage.local.get(["downloadLinks"], (links) => {
            if (!links.downloadLinks.includes(info["srcUrl"])) {
                links.downloadLinks.push(info["srcUrl"]);
                chrome.storage.local.set(
                    {
                        downloadLinks: links.downloadLinks,
                    },
                    () => {
                        console.log("Updated links");
                    }
                );
            }
        });
    }
});
