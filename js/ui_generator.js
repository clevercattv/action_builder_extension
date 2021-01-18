const ui_generator = (() => {
    const containerPath = 'html/action/action_container.html';
    const operationCardPath = 'html/operation_card.html';

    /**
     *
     * @param {string} name
     * @param {string} type
     * @param {string} file
     * @return {Promise<Element>}
     */
    async function action({name, type, file}) {
        const container = await fetchFirstBodyElement(containerPath);
        container.setAttribute('data-action', type);

        const actionName = container.querySelector('#actionName');
        actionName.innerHTML = name + actionName.innerHTML;

        const body = await fetchFirstBodyElement(file);
        container.querySelector('div[class*=card-body]').append(body);

        return container;
    }

    function fillSelect(select, dataArray) {
        select.innerHTML = '';
        dataArray.forEach(data => {
            const element = document.createElement("option");
            element.innerText = data.innerText;
            select.appendChild(element);
        })
    }

    async function operationCard({title, launch, regExes, actions, priority}) {
        const card = await fetchFirstBodyElement(operationCardPath);

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

    return {
        fillSelect,
        action,
        operationCard
    };
})()
