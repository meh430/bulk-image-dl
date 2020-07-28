const formats = ['png', 'jpg', 'gif']
chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
        const currUrl = tab.url
        let downloadable = false
        for (let i = 0; i < formats.length; i++) {
            if (currUrl.includes(formats[i])) {
                downloadable = true
                break
            }
        }

        chrome.downloads.download({url: currUrl}, downloadId => chrome.tabs.remove(tab.id))
    });
})