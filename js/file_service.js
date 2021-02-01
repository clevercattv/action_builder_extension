const fetchFirstBodyElement = (() => {
    const cache = {};
    return async (path) => {
        if (!cache[path]) {
            cache[path] = new DOMParser()
                .parseFromString(await (await fetch(chrome.runtime.getURL(path))).text(), 'text/html')
                .body
                .firstElementChild;
        }
        return cache[path].cloneNode(true);
    }
})();
