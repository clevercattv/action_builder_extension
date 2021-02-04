const fetchFirstBodyElement = (() => {
    const cache = {};
    return async (path) => {
        if (!cache[path]) {
            cache[path] = new DOMParser()
                .parseFromString(await (await fetch(chrome.runtime.getURL(path))).text(), 'text/html')
                .body
                .firstElementChild;
            i18n.translateElements(cache[path])
        }
        return cache[path].cloneNode(true);
    }
})();
