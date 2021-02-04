const optionsView = (() => {
    const moveTo = link => window.location = `${window.origin}${link}`;

    const buildTabs = async container => {
        const tabsElement = await fetchFirstBodyElement('html/operation/operations_tabs.html');
        const tabButtons = [
            {id: '#options', link: '/html/options.html'},
            {id: '#newOperation', link: '/html/new_operation.html'},
            {id: '#operations', link: '/html/operations.html'},
        ];
        tabButtons.forEach(data => tabsElement.querySelector(data.id).addEventListener('click', () => moveTo(data.link)));
        const currentTabId = tabButtons.find(tab => tab.link === window.location.pathname)?.id;
        if (currentTabId) tabsElement.querySelector(currentTabId).disabled = true;
        if (container) tabsElement.querySelector('#container').appendChild(container);
        return tabsElement;
    }

    return {
        buildTabs
    }
})()
