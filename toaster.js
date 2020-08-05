T = {
    toaster: (text, setCount, getCount, element) => {
        M.Toast.dismissAll();
        element.style.marginBottom = "50px";
        M.toast({
            html: text,
            completeCallback: () => {
                setCount(getCount() - 1);
                if (getCount() == 0) {
                    element.style.marginBottom = "0px";
                }
            },
            displayLength: 2000,
        });
    },
};
