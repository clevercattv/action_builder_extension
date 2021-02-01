(() => {
    const css = `
    .top-right {
      top: 1rem;
      right: 1rem;
    }
    .bottom-left {
      bottom: 1rem;
      left: 1rem;
    }
    .top-fixed-element {
      position: fixed;
      z-index: 999999;
      background: #888888;
      padding: 0.5rem;
    }
    `;
    const cssElement = document.createElement('style');
    cssElement.innerText = css;
    cssElement.id = 'ActionBuilderStyle';

    const toppestTextElement = document.createElement('a');
    toppestTextElement.innerHTML = 'Click on element for changing action selector';

    const toppestElement = document.createElement('div');
    toppestElement.classList.add('top-fixed-element', 'top-right');
    toppestElement.appendChild(toppestTextElement);

    toppestElement.onmouseover = () => {
        if (toppestElement.classList.contains('top-right')) {
            toppestElement.classList.remove('top-right');
            toppestElement.classList.add('bottom-left');
        } else {
            toppestElement.classList.remove('bottom-left');
            toppestElement.classList.add('top-right');
        }
    }

    document.head.appendChild(cssElement);
    document.body.appendChild(toppestElement);

    document.addEventListener('click', event => {
        event.stopPropagation();
        event.preventDefault();
        action.selector = getElementSelector(event.target);
        storage.updateOperationAction(action, operationId).then(() => {
            cssElement.remove();
            toppestElement.remove();
        });
    }, {once: true})
})()
