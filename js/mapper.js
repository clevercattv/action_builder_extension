const mapper = (() => {
    const elementToAction = {
        'Click': (element) => new ClickAction(element.querySelector('#selector').value),
        'Download': (element) => {},
        'Wait': (element) => {},
        'Reload': (element) => {},
    }

    return {
        elementToAction
    }
})();
