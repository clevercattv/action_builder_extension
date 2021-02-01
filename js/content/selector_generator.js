chrome.runtime.onMessage.addListener(message => {
    if ('getElementSelector' === message.type) return getElementSelector(message.element).toString();
    console.log('getElementSelector message get')
})

function getElementSelector(element) {
    let selectorGenerator = new SelectorGenerator(
        {querySelectorAll: window.document.querySelectorAll.bind(window.document)});
    let selector = selectorGenerator.getSelector(element);
    highlight(element);
    return selector;
}

function getElementXpath(element) {
    let selectorGenerator = new SelectorGenerator(
        {querySelectorAll: window.document.querySelectorAll.bind(window.document)});
    let xpath = selectorGenerator.getPath(element);
    highlight(element);
    return xpath;
}

function highlight(element) {
    if (!element) {
        return;
    }
    const higlightClass = "__copy-css-selector-highlighted";
    addClass(element, higlightClass);
    setTimeout(() => {
        removeClass(element, higlightClass);
    }, 2000);
}

function addClass(element, cls) {
    const classes = element.classList;
    if (!classes.contains(cls)) {
        classes.add(cls);
    }
}

function removeClass(element, cls) {
    let classes = element.classList;
    if (classes.contains(cls)) {
        classes.remove(cls);
    }
}

function SelectorGenerator(options) { //eslint-disable-line no-unused-consts

    options = options || {};

    function getPath(node) {
        if (!node || node.nodeType !== 1) {
            return "";
        }
        const selectorGeneratorStep = new SelectorGeneratorStep({
            withoutNthChild: true,
            targetNode: node
        });
        const steps = [];
        let contextNode = node;
        while (contextNode) {
            const step = selectorGeneratorStep.visit(contextNode);
            if (!step) {
                break;
            } // Error - bail out early.
            steps.push(step);
            contextNode = contextNode.parentNode;
        }

        steps.reverse();
        return steps.join(" ");
    }

    function getSelector(node) {
        if (!node || node.nodeType !== 1) {
            return "";
        }
        const selectorGeneratorStep = new SelectorGeneratorStep({targetNode: node});
        const steps = [];
        let contextNode = node;
        while (contextNode) {
            const step = selectorGeneratorStep.visit(contextNode);
            if (!step) {
                break; // Error - bail out early.
            }
            steps.push(step);
            if (step.optimized) {
                if (isUniqueSelector(buildSelector(steps))) {
                    break;
                }
            }
            contextNode = contextNode.parentNode;
        }

        const simplifiedSteps = simplifySelector(steps);
        return buildSelector(simplifiedSteps);
    }

    function simplifySelector(steps) {
        const minLength = 2;
        //if count of selectors is little, that not modify selector
        if (steps.length <= minLength) {
            return steps;
        }

        const stepsCopy = steps.slice();
        removeHtmlBodySteps(stepsCopy);

        const lastStep = stepsCopy[stepsCopy.length - 1];
        const parentWithId = lastStep.toString().indexOf("#") >= 0;
        const parentWithName = lastStep.toString().indexOf("name=") >= 0;

        if (parentWithId || parentWithName) {
            return simplifyStepsWithParent(stepsCopy);
        } else {
            return regularSimplifySteps(stepsCopy, minLength);
        }
    }

    function removeHtmlBodySteps(steps) {
        while (steps[steps.length - 1].toString() === "html" || steps[steps.length - 1].toString() === "body") {
            steps.pop();
        }
    }

    function simplifyStepsWithParent(steps) {
        const parentStep = steps.slice(-1);
        let sliced = steps.slice(0, 1);
        while (sliced.length < (steps.length - 1)) {
            const selector = buildSelector([sliced, parentStep]);
            if (isUniqueSelector(selector)) {
                break;
            }
            sliced = steps.slice(0, sliced.length + 1);
        }
        return [sliced, parentStep];
    }

    function regularSimplifySteps(steps, minLength) {
        minLength = minLength || 2;
        let sliced = steps.slice(0, minLength);
        while (sliced.length < steps.length) {
            const selector = buildSelector(sliced);
            if (isUniqueSelector(selector)) {
                break;
            }
            sliced = steps.slice(0, sliced.length + 1);
        }
        return sliced;
    }

    function buildSelector(steps) {
        const stepsCopy = steps.slice();
        stepsCopy.reverse();
        //check steps is regular array of steps
        if (typeof (stepsCopy[0].value) !== "undefined") {
            return stepsCopy.join(" > ");
        } else {
            return Array.from(stepsCopy).reduce(function (previousValue, currentValue) {
                const selector = buildSelector(currentValue);
                return previousValue ? previousValue + " " + selector : selector;
            });
        }
    }

    function isUniqueSelector(selector) {
        if (!options.querySelectorAll) {
            return true;
        }
        return options.querySelectorAll(selector).length < 2;
    }

    this.getSelector = getSelector;

    this.getPath = getPath;
}

/* =============================================================================================== */

function SelectorGeneratorStep(options) {
    options = options || {
        withoutNthChild: false,
        targetNode: null
    };

    const autogenRegexps = [
        /\d{4,}/,
        /^ember\d+/,
        /^[0-9_-]+$/,
        /^_\d{2,}/,
        /([a-f_-]*[0-9_-]){6,}/i
    ];

    function autogenCheck(val) {
        if (!val) {
            return false;
        }
        const autogenerated = Array.from(autogenRegexps).find(reg => reg.test(val));
        return !!autogenerated;

    }

    this.visit = function (node) {
        if (node.nodeType !== 1) {
            return null;
        }

        const nodeName = node.nodeName.toLowerCase();
        const parent = node.parentNode;
        const siblings = parent.children || [];
        const siblingsWithSameNodeName = getSiblingsWithSameNodeName(node, siblings);

        const needsId = hasId(node, siblingsWithSameNodeName);
        if (needsId) {
            const id = node.getAttribute("id");
            return new DomNodePathStep(nodeName + idSelector(id), true);
        }
        const isRootNode = !parent || parent.nodeType === 9;
        if (isRootNode) // document node
        {
            return new DomNodePathStep(nodeName, true);
        }

        const hasAttributeName = hasUniqueAttributeName(node, siblingsWithSameNodeName);
        const needsClassNames = siblingsWithSameNodeName.length > 0;
        const needsNthChild = isNeedsNthChild(node, siblingsWithSameNodeName, hasAttributeName);
        const needsType = hasType(node);

        let result = nodeName;

        if (hasAttributeName) {
            const attributeName = node.getAttribute("name");
            result += "[name=\"" + cssEscaper.escape(attributeName) + "\"]";
            return new DomNodePathStep(result, true);
        }

        if (needsType) {
            result += "[type=\"" + node.getAttribute("type") + "\"]";
        }

        if (needsNthChild && !options.withoutNthChild) {
            const ownIndex = Array.from(siblings).indexOf(node);
            result += ":nth-child(" + (ownIndex + 1) + ")";
        } else if (needsClassNames) {
            const prefixedOwnClassNamesArray = prefixedElementClassNames(node);
            for (const prefixedName in keySet(prefixedOwnClassNamesArray)) { //eslint-disable-line guard-for-in
                result += "." + cssEscaper.escape(prefixedName.substr(1));
            }
        }

        return new DomNodePathStep(result, false);
    };

    function hasUniqueAttributeName(node, siblingsWithSameNodeName) {
        const attributeName = node.getAttribute("name");
        if (!attributeName || autogenCheck(attributeName)) {
            return false;
        }
        const isSimpleFormElement = isSimpleInput(node, options.targetNode === node) || isFormWithoutId(node);
        return !!(isSimpleFormElement && attributeName && !Array.from(siblingsWithSameNodeName)
            .find(sibling => sibling.getAttribute("name") === attributeName));
    }

    function isNeedsNthChild(node, siblings, isUniqueAttributeName) {
        let needsNthChild = false;
        const prefixedOwnClassNamesArray = prefixedElementClassNames(node);
        for (let i = 0; (!needsNthChild) && i < siblings.length; ++i) {
            const sibling = siblings[i];
            if (needsNthChild) {
                continue;
            }

            const ownClassNames = keySet(prefixedOwnClassNamesArray);
            let ownClassNameCount = 0;

            for (const name in ownClassNames) {
                if (ownClassNames.hasOwnProperty(name)) {
                    ++ownClassNameCount;
                }
            }
            if (ownClassNameCount === 0 && !isUniqueAttributeName) {
                needsNthChild = true;
                continue;
            }
            const siblingClassNamesArray = prefixedElementClassNames(sibling);

            for (let j = 0; j < siblingClassNamesArray.length; ++j) {
                const siblingClass = siblingClassNamesArray[j];
                if (!ownClassNames.hasOwnProperty(siblingClass)) {
                    continue;
                }
                delete ownClassNames[siblingClass];
                if (!--ownClassNameCount && !isUniqueAttributeName) {
                    needsNthChild = true;
                    break;
                }
            }
        }
        return needsNthChild;
    }

    function getSiblingsWithSameNodeName(node, siblings) {
        return Array.from(siblings).filter(sibling =>
            sibling.nodeType === 1 && sibling !== node && sibling.nodeName.toLowerCase() === node.nodeName.toLowerCase())
    }

    function hasType(node) {
        return node.getAttribute("type") && ((isSimpleInput(node, options.targetNode === node) && !getClassName(node)) || isFormWithoutId(node) || isButtonWithoutId(node));
    }

    function idSelector(id) {
        return "#" + cssEscaper.escape(id);
    }

    function hasId(node, siblings) {
        const id = node.getAttribute("id");
        if (!id) {
            return false;
        }
        if (autogenCheck(id)) {
            return false;
        }
        return Array.from(siblings).filter(s => s.getAttribute("id") === id).length === 0;
    }

    function keySet(array) {
        const keys = {};
        for (let i = 0; i < array.length; ++i) {
            keys[array[i]] = true;
        }
        return keys;
    }

    function prefixedElementClassNames(node) {
        const classAttribute = getClassName(node);
        if (!classAttribute) {
            return [];
        }

        const classes = Array.from(node.classList);
        const existClasses = classes.filter(c => c && !autogenCheck(c));
        return Array.from(existClasses).map(name => "$" + name);
    }

    function isFormWithoutId(node) {
        return node.nodeName.toLowerCase() === "form" && !node.getAttribute("id");
    }

    function isButtonWithoutId(node) {
        return node.nodeName.toLowerCase() === "button" && !node.getAttribute("id");
    }

    function isSimpleInput(node, isTargetNode) {
        return isTargetNode && node.nodeName.toLowerCase() === "input";
    }

    function getClassName(node) {
        return node.getAttribute("class") || node.className;
    }

}

/* ========================================================== */

const DomNodePathStep = function (value, optimized) {
    this.value = value;
    this.optimized = optimized || false;
};

DomNodePathStep.prototype = {
    toString: function () {
        return this.value;
    }
};

/* ======================================================= */

const cssEscaper = (function () {

    function escapeIdentifierIfNeeded(ident) {
        if (isCssIdentifier(ident)) {
            return ident;
        }
        const shouldEscapeFirst = /^(?:[0-9]|-[0-9-]?)/.test(ident);
        const lastIndex = ident.length - 1;
        return ident.replace(/./g, function (c, i) {
            return ((shouldEscapeFirst && i === 0) || !isCssIdentChar(c)) ? escapeAsciiChar(c, i === lastIndex) : c;
        });
    }

    function escapeAsciiChar(c, isLast) {
        return "\\" + toHexByte(c) + (isLast ? "" : " ");
    }

    function toHexByte(c) {
        let hexByte = c.charCodeAt(0).toString(16);
        if (hexByte.length === 1) {
            hexByte = "0" + hexByte;
        }
        return hexByte;
    }

    function isCssIdentChar(c) {
        if (/[a-zA-Z0-9_-]/.test(c)) {
            return true;
        }
        return c.charCodeAt(0) >= 0xA0;
    }

    function isCssIdentifier(value) {
        return /^-?[a-zA-Z_][a-zA-Z0-9_-]*$/.test(value);
    }

    return {escape: escapeIdentifierIfNeeded};

})();
