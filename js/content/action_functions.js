const actionFunctions = (() => {
    const downloadImageFunctions = (element) => {
        return {
            name: () => {
                const fullName = element.src.split("/").pop();
                const extensionIndex = fullName.lastIndexOf(".") !== -1 ? fullName.lastIndexOf(".") : fullName.length;
                return fullName.substr(0, extensionIndex);
            },
            extension: () => {
                const fullName = element.src.split("/").pop().split('?')[0];
                const extensionIndex = fullName.lastIndexOf(".");
                return extensionIndex === -1 ? ".jpg" : fullName.substr(extensionIndex);
            },
            datetime: () => new Date().toLocaleDateString(navigator.language, {
                year: "2-digit", month: "2-digit", day: "2-digit",
                hour: "2-digit", minute: "2-digit", second: "2-digit"
            }),
            date: () => new Date().toLocaleDateString(navigator.language, {
                year: "2-digit", month: "2-digit", day: "2-digit",
            }),
            time: () => new Date().toLocaleDateString(navigator.language, {
                hour: "2-digit", minute: "2-digit", second: "2-digit"
            }),
            timestamp: () => new Date().getTime(),
            domain: () => window.location.hostname,
            imageDomain: () => new URL(element.src).hostname,
            title: () => document.title,
        }
    }

    return {
        click: {
            name: "Click on element",
            init: ({id}) => document.querySelector(id).click()
        },
        downloadImage: {
            name: "Download image",
            init: async ({id, download}) => {
                let imageElement = document.querySelector(id);

                const downloader = document.createElement("a");
                downloader.download = templateMapper.templateToText(
                    download, downloadImageFunctions(imageElement));
                downloader.href = URL.createObjectURL(await (await fetch(imageElement.src)).blob());
                downloader.style.display = 'none'
                document.body.appendChild(downloader);
                downloader.click();
                document.body.removeChild(downloader);
            }
        },
        timeout: {
            name: "Wait (ms)",
            init: (_) => new Promise(res => setTimeout(res, ms)),
        },
        reload: {
            name: "Reload",
            init: (_) => window.location.reload(),
        }
    }
})()
