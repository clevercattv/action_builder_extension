const editOperationUi = (() => {
    const init = (container, operation) => {
        document.body.appendChild(container);
        newOperationUi.init();

        const operationCreate = document.getElementById('operationCreate');
        operationCreate.onclick = () => {
            if (newOperationUi.createOperationEvent()) {
                setTimeout(() => {
                    storage.removeOperation(operation).then(console.log);
                    window.location = `${location.protocol}//${location.hostname}/html/operations.html`;
                }, 100);
            }
        }

        fillOperationData(operation);
    }

    function fillOperationData({title, launch, regExes, actions, priority}) {
        const operationTitle = document.getElementById('operationTitle');
        operationTitle.value = title;

        const operationPriority = document.getElementById('operationPriority');
        operationPriority.value = priority;

        const launchType = document.getElementById('launchType');
        launchType.value = launch.type;
        if (launch.type === 'key') {
            const launchKeys = document.getElementById('launchKeys');
            launchKeys.value = launch.keys;
            launchKeys.disabled = false;
        }

        newOperationUi.operationRegExes.push(...regExes);
        ui_generator.fillSelect(
            document.getElementById('regExes'),
            newOperationUi.operationRegExes.map(regEx => {
                return {'innerText': regEx}
            }));

        newOperationUi.addActionsElements(actions);
    }

    return {
        init
    }
})();
