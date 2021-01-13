window.addEventListener('load', async () => {
    operationsUi.init(await storage.getOperations());
})
