const fetchActionBody = (() => {
    const cache = {};
    return async (path) => {
        if (!cache[path]) {
            cache[path] = new DOMParser()
                .parseFromString(await (await fetch(chrome.runtime.getURL(path))).text(), 'text/html')
                .body
                .firstElementChild;
        }
        return cache[path];
    }
})();

(async function () {
    const clickActionBody = await fetchActionBody('html/action/click.html');
    document.getElementById('actions').appendChild(clickActionBody);
    launchTypeEvents();

})()

function addPage() {

}

function launchTypeEvents() {
    const launchKeysList = [];
    const launchKeys = document.getElementById('launchKeys');
    const launchType = document.getElementById('launchType');
    launchType.addEventListener('change',
        () => launchKeys.disabled = launchType.value !== 'key')
    launchKeys.addEventListener('keydown', event => {
        if (event.key === 'Backspace') {
            launchKeysList.pop();
        } else if (launchKeysList.length < 3){
            launchKeysList.push(event.key);
        }
        launchKeys.value = launchKeysList.length ? launchKeysList.reduce((prev, next) => {
            prev = prev + ' + ' + next;
            return prev;
        }) : '';
    })
}
