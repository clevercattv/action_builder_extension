const newOperationUi = (() => {
    const hardcodedActionsInfo = [
        {
            'name': 'Click',
            'type': 'click',
            'file': 'click.html',
        },
        {
            'name': 'Download image',
            'type': 'downloadImage',
            'file': 'download_image.html',
        },
        {
            'name': 'Wait',
            'type': 'wait',
            'file': 'wait.html',
        },
        {
            'name': 'Reload',
            'type': 'reload',
            'file': 'reload.html',
        },
    ].map(action => {
        action.file = 'html/action/' + action.file;
        return action;
    });

    const operationLaunchKeys = [];
    const operationRegExes = [];
    const elements = {
        launchType: () => document.getElementById('launchType'),
        launchKeys: () => document.getElementById('launchKeys'),
        operationActions: () => document.getElementById('operationActions'),
    }

    function init() {
        addLaunchTypeEvents();
        fillActionsSelect();
        addActionButtonEvent();
        addPageRegExEvents();
        addCreateOperationEvent();
    }

    function addLaunchTypeEvents() {
        const launchKeys = elements.launchKeys();
        const launchType = elements.launchType();
        launchType.addEventListener('change',
            () => launchKeys.disabled = launchType.value !== 'key')
        launchKeys.addEventListener('keydown', event => {
            if (event.key === 'Backspace') {
                operationLaunchKeys.pop();
            } else if (operationLaunchKeys.length < 3) {
                operationLaunchKeys.push(event.key);
            }
            launchKeys.value = operationLaunchKeys.length ? operationLaunchKeys.reduce((prev, next) => {
                prev = prev + ' + ' + next;
                return prev;
            }) : '';
        })
    }

    function addPageRegExEvents() {
        const regExes = document.getElementById('regExes');
        const pageRegEx = document.getElementById('pageRegEx');

        const addPageRegEx = document.getElementById('addPageRegEx');
        addPageRegEx.addEventListener('click', () => {
            if (pageRegEx.value.length) {
                operationRegExes.push(pageRegEx.value);
            }
        });

        const removePageRegEx = document.getElementById('removePageRegEx');
        removePageRegEx.addEventListener('click', () => {
            operationRegExes.length = 0; // clear list
            operationRegExes.push(...[...regExes.options].filter(option => !option.selected).map(option => option.innerText));
        });

        const changePageRegEx = document.getElementById('changePageRegEx');
        changePageRegEx.addEventListener('click', () => {
            pageRegEx.value = operationRegExes[regExes.options.selectedIndex]; // get first selected
            operationRegExes.splice(regExes.options.selectedIndex, 1);
        });

        [addPageRegEx, removePageRegEx, changePageRegEx].forEach(element =>
            element.addEventListener('click', () => ui_generator.fillSelect(
                regExes,
                operationRegExes.map(regEx => {
                    return {'innerText': regEx}
                }))
            ))
    }

    function fillActionsSelect() {
        const selectedAction = document.getElementById('selectedAction');
        ui_generator.fillSelect(selectedAction, hardcodedActionsInfo.map(action => {
            return {'innerText': action.name}
        }));
    }

    /**
     * @param {Action[]} actions
     */
    function addActionsElements(actions) {
        const actionsElement = elements.operationActions();
        actions.forEach(action => {
            const actionInfo = hardcodedActionsInfo.filter(info => info.type === action.type).pop();
            ui_generator.action(actionInfo).then(element => {
                addActionEvents(element);
                Object.keys(action).filter(key => key !== 'type').forEach(key => {
                    element.querySelector(`#${key}`).value = action[key];
                })
                actionsElement.appendChild(element);
            });
        })
    }

    function addActionEvents(element) {
        const actionsElement = elements.operationActions();
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

    function addActionButtonEvent() {
        const addAction = document.getElementById('addAction');
        const selectedAction = document.getElementById('selectedAction');
        const actionsEl = elements.operationActions();

        addAction.addEventListener('click', async () => {
            const actionInfo = hardcodedActionsInfo[selectedAction.options.selectedIndex];
            const element = await ui_generator.action(actionInfo);
            addActionEvents(element);
            actionsEl.appendChild(element);
        });
    }

    function createOperationEvent() {
        const launchType = elements.launchType();
        const title = document.getElementById('operationTitle').value;
        const launch = 'key' === launchType.value ?
            new LaunchKeys(operationLaunchKeys) : new Launch(launchType.value);
        const htmlActions = elements.operationActions();
        const actions = Array.from(htmlActions.children)
            .map(htmlAction => mapper.elementToAction[htmlAction.getAttribute('data-action')](htmlAction));
        const priority = document.getElementById('operationPriority').value;

        const operation = new Operation(
            title,
            launch,
            operationRegExes,
            actions,
            priority > 0 ? priority : 1
        );
        storage.createOperation(operation).then(console.log);
        return true;
    }

    function addCreateOperationEvent() {
        const operationCreate = document.getElementById('operationCreate');
        operationCreate.addEventListener('click', createOperationEvent);
    }

    return {
        init,
        createOperationEvent,
        operationRegExes,
        addActionsElements
    }
})();
