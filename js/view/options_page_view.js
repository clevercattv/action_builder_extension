window.addEventListener('load', async () => {
    const tabs = optionsView.buildTabs();
    document.body.appendChild(await tabs);

})
