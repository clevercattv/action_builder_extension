const mapper = (() => {
    const elementToAction = {
        'click': (element) => new ClickAction(element.querySelector('#selector').value),
        'downloadImage': (element) => new DownloadAction(
            element.querySelector('#name').value,
            element.querySelector('#extension').value,
            element.querySelector('#selector').value
        ),
        'wait': (element) => new WaitAction(Number.parseInt(element.querySelector('#ms').value)),
        'reload': (_) => new Action('reload'),
    }

    return {
        elementToAction
    }
})();
