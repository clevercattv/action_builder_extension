const ui = (() => {
    function init() {
        addLaunchTypeEvents();
        fillActionsSelect();
        addActionEvent();
        addPageRegExEvents();

    }

    function addLaunchTypeEvents() {
        const launchKeys = document.getElementById('launchKeys');
        const launchType = document.getElementById('launchType');
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
        changePageRegEx.addEventListener('click', event => {
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
        let selectedAction = document.getElementById('selectedAction');
        ui_generator.fillSelect(selectedAction, actions.map(action => {
            return {'innerText': action.name}
        }));
    }

    function addActionEvent() {
        let addAction = document.getElementById('addAction');
        let selectedAction = document.getElementById('selectedAction');
        let actionsEl = document.getElementById('actions');

        addAction.addEventListener('click', async () => {
            let action = actions[selectedAction.options.selectedIndex];
            let element = await fetchActionBody(action.file);
            actionsEl.appendChild(element);
        });
    }

    return {
        init
    }
})();
