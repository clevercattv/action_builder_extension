const ui_generator = (() => {

    const containerPath = 'html/action/action_container.html';

    async function action({name, type, file}) {
        const container = await fetchActionBody(containerPath);
        container.setAttribute('data-action', type);

        const actionName = container.querySelector('#actionName');
        actionName.innerHTML = name + actionName.innerHTML;

        const body = await fetchActionBody(file);
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

    return {
        fillSelect,
        action
    };
})()
