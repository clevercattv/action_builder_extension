function OperationView(launchKeys = [], regExes = []) {
    const elements = {
        launchTypeSelect: document.querySelector('#launchType'),
        launchKeysInput: document.querySelector('#launchKeys'),
        addRegExButton: document.querySelector('#addPageRegEx'),
        changeRegExButton: document.querySelector('#changePageRegEx'),
        removeRegExButton: document.querySelector('#removePageRegEx'),
        addActionButton: document.querySelector('#addAction'),
        createOperationButton: document.querySelector('#createOperation'),
        actionSelect: document.querySelector('#action'),
        actionsElement: document.querySelector('#actions'),
        regExesSelect: document.querySelector('#regExes'),
        regExInput: document.querySelector('#pageRegEx'),
        operationTitleInput: document.querySelector('#operationTitle'),
        operationPriorityInput: document.querySelector('#operationPriority'),
    }

    const fillSelect = (select, innerTexts) => {
        select.innerHTML = '';
        innerTexts.forEach(text => {
            const element = document.createElement("option");
            element.innerText = text;
            select.appendChild(element);
        })
    };

    const fillRegExSelect = () => fillSelect(elements.regExesSelect, regExes);

    const changeLaunchType = () => elements.launchKeysInput.disabled = elements.launchTypeSelect.value !== 'key';

    const fillLaunchKeys = () => elements.launchKeysInput.value = launchKeys.length ?
        launchKeys.reduce((prev, next) => `${prev} + ${next}`) : '';

    const editLaunchKeysEvent = event => {
        if (event.key === 'Backspace') {
            launchKeys.pop();
        } else if (launchKeys.length < 3) {
            launchKeys.push(event.key);
        }
        fillLaunchKeys();
    };

    const addRegExEvent = () => {
        if (elements.regExInput.value.length) {
            regExes.push(elements.regExInput.value);
            fillRegExSelect();
        }
    };

    const changeRegExEvent = () => {
        const selectedIndex = elements.regExesSelect.options.selectedIndex;
        elements.regExInput.value = regExes[selectedIndex]; // get first selected
        regExes.splice(selectedIndex, 1);
        fillRegExSelect();
    };

    const removeRegExEvent = () => {
        regExes.length = 0; // clear list
        regExes.push(...[...elements.regExesSelect.options].filter(option => !option.selected).map(option => option.innerText));
        fillRegExSelect();
    };

    const addActionCard = async actionInfo => {
        const card = await createActionCard(actionInfo);
        elements.actionsElement.appendChild(card);
        return card;
    }

    const actionEvents = {
        downloadImage: element => {
            const templates = element.querySelector('#templates');
            const name = element.querySelector('#name');
            Array.from(templates.children).forEach(button => button.addEventListener('click', () => {
                name.value += `\$\{${button.getAttribute('data-name')}\}`
            }))
        }
    };

    /**
     *
     * @param {string} name
     * @param {string} type
     * @param {string} file
     * @return {Promise<Element>}
     */
    async function createActionCardElement({name, type, file}) {
        const actionContainer = await fetchFirstBodyElement('html/action/action_container.html');
        actionContainer.setAttribute('data-action', type);

        const actionName = actionContainer.querySelector('#actionName');
        actionName.innerHTML = name + actionName.innerHTML;

        const body = await fetchFirstBodyElement(file);
        actionContainer.querySelector('div[class*=card-body]').append(body);

        return actionContainer;
    }

    const createActionCard = async actionInfo => {
        const card = await createActionCardElement(actionInfo);
        if (actionEvents[actionInfo.type]) actionEvents[actionInfo.type](card);
        addActionCardEvents(card);
        return card;
    };

    const addActionCardEvents = (element) => {
        const actionsElement = elements.actionsElement;
        const removeAction = element.querySelector('#removeAction');
        removeAction.addEventListener('click',
            () => element.parentNode.removeChild(element));

        const hideAction = element.querySelector('#hideAction');
        hideAction.addEventListener('click', () => {
            const cardBody = hideAction.parentElement.parentElement.querySelector('div[class*=card-body]');
            cardBody.classList.contains('d-none') ? cardBody.classList.remove('d-none') : cardBody.classList.add('d-none');
        });

        const moveActionUp = element.querySelector('#moveActionUp');
        moveActionUp.addEventListener('click', () => {
            const prevIndex = Array.from(actionsElement.children).indexOf(element) - 1;
            const previousElement = actionsElement.children[prevIndex];
            if (!previousElement) return;
            actionsElement.insertBefore(element, previousElement);
        });

        const moveActionDown = element.querySelector('#moveActionDown');
        moveActionDown.addEventListener('click', () => {
            const nextIndex = Array.from(actionsElement.children).indexOf(element) + 1;
            const nextElement = actionsElement.children[nextIndex];
            if (!nextElement) return;
            actionsElement.insertBefore(nextElement, element);
        });
    }

    const createOperation = () => {
        const launchType = elements.launchTypeSelect;
        const title = document.getElementById('operationTitle').value;
        const launch = 'key' === launchType.value ?
            new LaunchKeys(launchKeys) : new Launch(launchType.value);
        const actions = Array.from(elements.actionsElement.children)
            .map(htmlAction => mapper.elementToAction[htmlAction.getAttribute('data-action')](htmlAction));
        const priority = document.getElementById('operationPriority').value;

        return new Operation(
            title,
            launch,
            regExes,
            actions,
            priority > 0 ? priority : 1,
            !actions.some(action => '' === action.selector)
        );
    }

    fillSelect(
        elements.actionSelect,
        Object.values(actionsInfo).map(value => value.name));

    fillRegExSelect();
    fillLaunchKeys();

    elements.launchTypeSelect.addEventListener('change', changeLaunchType);
    elements.launchKeysInput.addEventListener('keydown', editLaunchKeysEvent);
    elements.addRegExButton.addEventListener('click', addRegExEvent);
    elements.changeRegExButton.addEventListener('click', changeRegExEvent);
    elements.removeRegExButton.addEventListener('click', removeRegExEvent);
    elements.addActionButton.addEventListener('click', async () =>
        await addActionCard(Object.values(actionsInfo)[elements.actionSelect.options.selectedIndex]));

    return {
        addActionCard,
        createOperation,
        elements,
    }
}


