window.addEventListener('load', async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const operationId = urlParams.get('operation');
    const operation = await storage.getOperationById(operationId);
    editOperationUi.init(await fetchActionBody('html/new_operation.html'), operation);
})
