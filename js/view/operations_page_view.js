window.addEventListener('load', async () => {
    const tabs = await optionsView.buildTabs();

    tabs.querySelector('#container').appendChild((() => {
        const div = document.createElement('div');
        div.classList.add('container');
        const row = document.createElement('div');
        row.classList.add('row');
        row.id = 'operations';
        div.appendChild(row);
        return div;
    })());
    const container = tabs.querySelector('#container #operations');
    document.body.appendChild(tabs);

    const recreateCards = operations => {
        container.innerHTML = '';
        operations.forEach(operation => createCard(operation));
    }

    async function createOperationCardElement({title, launch, regExes, actions, priority}) {
        const card = await fetchFirstBodyElement('html/operation/operation_card.html');

        const cardHeaderTitle = card.querySelector('[class*=card-header] #title');
        cardHeaderTitle.innerText = title;
        const cardHeaderPriority = card.querySelector('[class*=card-header] #priority');
        cardHeaderPriority.innerText = `[priority: ${priority}]`;

        const launchType = card.querySelector('[class*=card-title]');
        launchType.innerText = `Launch type: ${launch.type} ${launch.type === 'key' ? '[' + launch.keys + ']' : ''}`;

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
