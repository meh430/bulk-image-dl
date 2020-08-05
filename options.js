let saveButton = document.getElementById('saveButton')
toastCount = 0
saveButton.addEventListener('click', (event) => {
    toastCount += 1
    T.toaster('Submitted', (count) => toastCount = count, () => toastCount, saveButton)
})