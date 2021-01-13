const operationsUi = (() => {
    let container;

    const init = operations => {
        container = document.getElementById('operations');
        container.innerHTML = '';
        operations.forEach(operation => createCard(operation));
    }

    const createCard = async operation => {
        const card = await ui_generator.operationCard(operation);

        const edit = card.querySelector('#edit');
        edit.addEventListener('click', () => {
            window.location = `${location.protocol}//${location.hostname}/html/edit_operation.html?operation=${operation.id}`;
        });

        const remove = card.querySelector('#remove');
        remove.addEventListener('click',
            () => storage.removeOperation(operation).then(result => init(result)));

        container.appendChild(card);
    }

    return {
        init
    }
})()
