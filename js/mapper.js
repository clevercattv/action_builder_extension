const mapper = (() => {
    const elementToAction = {
        'Click': (element) => new ClickAction(element.querySelector('#selector').value),
        'Download image': (element) => new DownloadAction(
            element.querySelector('#name').value,
            element.querySelector('#extension').value,
            element.querySelector('#selector').value
        ),
        'Wait': (element) => new WaitAction(Number.parseInt(element.querySelector('#ms').value)),
        'Reload': (element) => new Action('Reload'),
    }

    return {
        elementToAction
    }
})();
