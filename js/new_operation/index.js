const actions = [
    {
        'name': 'Click',
        'file': 'click.html',
    },
    {
        'name': 'Download',
        'file': 'download.html',
    },
    {
        'name': 'Wait',
        'file': 'wait.html',
    },
    {
        'name': 'Reload',
        'file': 'reload.html',
    },
].map(action => {
    action.file = 'html/action/' + action.file;
    return action;
});

const operationLaunchKeys = [];
const operationRegExes = [];

window.addEventListener('load', async () => {
    ui.init();
})
