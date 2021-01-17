window.addEventListener('load', async () => {
    const displayNone = 'd-none';
    const container = document.querySelector('[class*=container]');

    const operations = await storage.getOperations();
    for (const operation of operations) {
        const cardElement = await fetchActionBody('html/popup_card.html');
        const cardBodyElement = cardElement.querySelector('[class*=card-body]');
        const actions = operation.actions;

        const launchSpan = cardElement.querySelector('#launch');
        launchSpan.innerText = 'Launch type: ' + operation.launch.type
            + (operation.launch.keys ? ` [${operation.launch.keys.reduce((prev, cur) => `${prev} + ${cur}`)}]` : '');

        const titleInput = cardElement.querySelector('#title');
        titleInput.innerText = operation.title;

        const hideActionButton = cardElement.querySelector('#hideAction');
        hideActionButton.addEventListener('click', () => cardBodyElement.classList.contains(displayNone) ?
            cardBodyElement.classList.remove(displayNone) : cardBodyElement.classList.add(displayNone));
        if (actions.length < 3) {
            cardBodyElement.classList.remove(displayNone)
        }

        const isEnabledInput = cardElement.querySelector('#isEnabled');
        isEnabledInput.checked = operation.isEnabled;
        isEnabledInput.addEventListener('click', () => {
            operation.isEnabled = isEnabledInput.checked;
            storage.updateOperationIsEnabled(operation.isEnabled, operation.id);
        })

        const actionsElement = cardElement.querySelector('#actions');
        for (const action of actions) {
            const divElement = document.createElement('div');
            divElement.classList.add('d-flex');

            const aElement = document.createElement('a');
            aElement.innerText = action.typeName;

            if (action.selector === '') {
                divElement.style.color = 'red';
                aElement.innerText += ' [need add selector]';
            } else {
                divElement.style.color = 'green';
            }

            const iconSvg = await fetchActionBody('icon/edit-solid.svg');

            divElement.appendChild(aElement);
            divElement.appendChild(iconSvg);
            actionsElement.appendChild(divElement);
        }

        container.appendChild(cardElement);
    }

})
