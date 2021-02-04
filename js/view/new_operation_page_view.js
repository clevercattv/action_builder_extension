window.addEventListener('load', async() => {
    const operationPageView = await OperationView();
    operationPageView.elements.createOperationButton.addEventListener('click', () =>
        storage.addOperation(operationPageView.createOperation()).then(console.log)) // todo change location
})
