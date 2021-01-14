window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const operationId = urlParams.get('operation');
    const operation = await storage.getOperationById(operationId);

    document.body.appendChild(await fetchActionBody('html/new_operation.html'));
    newOperationUi.init();

    editOperationUi.setUpdateOperationEvent(operation, newOperationUi);

    editOperationUi.fillTitle(operation, newOperationUi);
    editOperationUi.fillPriority(operation, newOperationUi);
    editOperationUi.fillLaunch(operation, newOperationUi);

    newOperationUi.setLaunchKeys(operation.launch.keys);
    newOperationUi.setRegExes(operation.regExes);
    newOperationUi.setActions(operation.actions);

    newOperationUi.fillEventListeners();
    newOperationUi.fillActionsSelect();
    newOperationUi.fillRegExSelect();
})
