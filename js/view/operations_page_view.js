window.addEventListener('load', async () => {
    const container = document.getElementById('operations');

    const recreateCards = operations => {
        container.innerHTML = '';
        operations.forEach(operation => createCard(operation));
    }

    async function createOperationCardElement({title, launch, regExes, actions, priority}) {
        const card = await fetchFirstBodyElement('html/operation_card.html');

        const cardHeader = card.querySelector('[class*=card-header]');
        cardHeader.innerText = `${title} [priority: ${priority}]`;

        const cardTitle = card.querySelector('[class*=card-title]');
        cardTitle.innerText = `Launch type: ${launch.type} ${launch.type === 'key' ? '[' + launch.keys + ']' : ''}`;

        const cardRegExes = card.querySelector('#regExes');
        regExes.forEach(regEx => {
            let li = document.createElement('li');
            li.innerText = regEx;
            cardRegExes.appendChild(li);
        });

        const cardActions = card.querySelector('#actions');
        actions.forEach(act => {
            let li = document.createElement('li');
            li.innerText = act.type;
            cardActions.appendChild(li);
        });

        return card;
    }

    const createCard = async operation => {
        const card = await createOperationCardElement(operation);

        const edit = card.querySelector('#edit');
        edit.addEventListener('click', () => {
            window.location = `${location.protocol}//${location.hostname}/html/edit_operation.html?operation=${operation.id}`;
        });

        const remove = card.querySelector('#remove');
        remove.addEventListener('click',
            () => storage.removeOperation(operation).then(result => recreateCards(result)));

        container.appendChild(card);
    }

    recreateCards(await storage.getOperations());
})
