const ui_generator = (() => {
    function fillSelect(select, dataArray) {
        select.innerHTML = '';
        dataArray.forEach(data => {
            let element = document.createElement("option");
            element.innerText = data.innerText;
            select.appendChild(element);
        })
    }

    return {
        fillSelect
    };
})()
