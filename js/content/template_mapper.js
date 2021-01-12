const templateMapper = (() => {

    /**
     * Swap ${...} inside text with suitable var
     * @param {string} text
     * @param {Object<string, Function>} vars
     * @return {string|undefined}
     */
    const templateToText = async (text, vars) => {
        if (text === undefined || vars === undefined) {
            throw new Error(`Params can't be undefined or null! TEXT : ${text} | VARS : ${vars}`,);
        }
        if (text.length === 0) {
            return "";
        }

        return swapTemplateWithVariable(text, vars);
    }

    /**
     * @param {string} text
     * @param {Object<string, Function>} vars
     * @return {*}
     */
    const swapTemplateWithVariable = async (text, vars) => {
        if (text.indexOf('${') === -1) {
            return text;
        }

        const startIndex = text.indexOf('${');
        const endIndex = text.indexOf('}');
        const varName = text.substring(startIndex + 2, endIndex);

        const resultVar = vars[varName]();
        const result = text.substring(0, startIndex) +
            (resultVar !== undefined ? resultVar : " UNDEFINED ") +
            text.substring(endIndex + 1);
        return swapTemplateWithVariable(result, vars)
    }

    return {
        templateToText
    }

})();
