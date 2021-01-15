window.addEventListener('load', () => {
    const operationPageView = new OperationView();
    operationPageView.elements.createOperationButton.addEventListener('click', () =>
        storage.addOperation(operationPageView.createOperation()).then(console.log)) // todo change location
})
