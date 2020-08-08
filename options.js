let saveButton = document.getElementById("saveButton");
let checkDlTabImage = document.getElementById("checkDlTabImage");
let checkCloseTab = document.getElementById("checkCloseTab");
let heightInput = document.getElementById("heightInput");
let widthInput = document.getElementById("widthInput");

let toastCount = 0;

chrome.storage.sync.get(["dlTab", "closeTab", "minWidth", "minHeight"], (settings) => {
    checkDlTabImage.checked = settings.dlTab;
    checkCloseTab.checked = settings.closeTab;
    heightInput.value = settings.minHeight;
    widthInput.value = settings.minWidth;
    saveButton.addEventListener("click", (event) => {
        toastCount += 1;
        T.toaster(
            "Saved Settings",
            (count) => (toastCount = count),
            () => toastCount,
            saveButton
        );
        saveInfo();
    });
});

function saveInfo() {
    let minWidth = widthInput.value;
    let minHeight = heightInput.value;
    let dlTab = checkDlTabImage.checked;
    let closeTabs = checkCloseTab.checked;

    chrome.storage.sync.set({ dlTab: dlTab, closeTab: closeTabs, minWidth: minWidth, minHeight: minHeight });
}
