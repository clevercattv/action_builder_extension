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
     * @param {Operation} operation
     * @return {Promise<<Operation>[]>} result operations
     */
    const createOperation = async operation => {
        let operations = await getOperations();
        operations = operations ? operations : [];
        operations.push(operation);
        chrome.storage.local.set({operations});
        return operations;
    }

    /**
     * @param {Operation} operation
     * @return {Promise<<Operation>[]>} result operations
     */
    const removeOperation = async operation => {
        const operations = await getOperations();
        const filtered = operations.filter(opr => opr.title === operation.title)
            .filter(opr => opr.regExes.every(oprRegEx =>
                operation.regExes.some(regEx => regEx === oprRegEx)));
        operations.splice(operations.indexOf(filtered.pop()), 1);
        chrome.storage.local.set({operations});
        return operations;
    }

    return {
        getOperations,
        getCurrentSiteOperation,
        createOperation,
        removeOperation
    }
})()
