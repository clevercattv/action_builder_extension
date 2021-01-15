const storage = (() => {
    const operationKey = 'operations';

    /**
     * @return {Promise<<Operation>[]>}
     */
    const getOperations = () => new Promise(resolve => {
        chrome.storage.local.get(operationKey,
            result => resolve(result[operationKey] ? result[operationKey] : []))
    });

    /**
     * @return {Promise<<Operation>[]>}
     */
    const getCurrentSiteOperation = async () => {
        const operations = await getOperations();
        const href = window.location.href;
        return Array.from(operations).filter(operation =>
            operation.regExes.some(regEx => href.match(regEx)));
    }

    /**
     * @param {string} id
     * @return {Promise<Operation>}
     */
    const getOperationById = async (id) => {
        const operations = await getOperations();
        return Array.from(operations)
            .filter(operation => operation.id === id)
            .pop();
    }

    /**
     * @param {Operation} operation
     * @return {Promise<<Operation>[]>} result operations
     */
    const addOperation = async operation => {
        let operations = await getOperations();
        operations = operations ? operations : [];
        operations.push(operation);
        chrome.storage.local.set({operations});
        console.log('await', await getOperations());
        return operations;
    }

    /**
     * @param {Operation} operation
     * @return {Promise<<Operation>[]>} result operations
     */
    const removeOperation = async operation => removeOperationById(operation.id);

    /**
     * @param {string} id
     * @return {Promise<<Operation>[]>} result operations
     */
    const removeOperationById = async id => {
        const operations = await getOperations();
        const filtered = operations.filter(operation => operation.id === id);
        operations.splice(operations.indexOf(filtered.pop()), 1);
        chrome.storage.local.set({operations});
        return operations;
    }

    return {
        getOperations,
        getOperationById,
        getCurrentSiteOperation,
        addOperation,
        removeOperation,
        removeOperationById,
    }
})()
