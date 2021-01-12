const actions = [
    {
        'name': 'Click',
        'type': 'click',
        'file': 'click.html',
    },
    {
        'name': 'Download image',
        'type': 'downloadImage',
        'file': 'download_image.html',
    },
    {
        'name': 'Wait',
        'type': 'wait',
        'file': 'wait.html',
    },
    {
        'name': 'Reload',
        'type': 'reload',
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
