const i18n = (() => {
    const attribute = 'data-i18n';
    /**
     * @param {HTMLElement} element
     */
    const translateElements = element => element?.querySelectorAll(`[${attribute}]`)
        .forEach(child => {
            child.innerText = chrome.i18n.getMessage(`${child.getAttribute(attribute)}`);
            child.removeAttribute(`${attribute}`);
        })

    return {
        translateElements
    }
})();

window.addEventListener('load', () => i18n.translateElements(document.body));
