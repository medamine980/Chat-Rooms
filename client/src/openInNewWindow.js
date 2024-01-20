const openInNewWindow = (url, type = "regular") => {
    const win = window.open("");
    win.document.write(`<iframe width='100%' height='100%'></iframe>`);
    const iframe = win.document.querySelector("iframe");
    if (type === "regular") iframe.src = url;
    else if (type === "image") {
        iframe.src = "";
        setTimeout(() => iframe.contentDocument.body.innerHTML += url, 0);
    }
    // else if (type == "image") iframe.body.innerHTML += url;
}

export default openInNewWindow;