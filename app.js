(function () {
    var global = window;

    (global.app = global.app || {}).create = function(itto, containerElem, modelElem) {
        var model = JSON.parse(JSON.stringify(itto.model));
        model.onChanged = function() {
            saveModel(model);
        };


        loadModel(model);

        var quiz = itto.quiz.create(model, {
            questionCount: 5,
            optionCount: 5,
        });

        renderQuestions(containerElem, quiz.questions);

        renderModel(modelElem, model);

        /*
        var form = document.getElementById('my-form');
        if (form.attachEvent) {
            form.attachEvent("submit", processForm);
        } else {
            form.addEventListener("submit", processForm);
        }*/
    };

    function processForm(e) {
        if (e.preventDefault) e.preventDefault();

        /* do what you want with the form */

        // You must return false to prevent the default form behavior
        return false;
    }

    function renderQuestions(elem, questions) {
        elem.innerHTML = "<ol type=\"1\">" +
            questions.map(function (question) {
                return "<li><span>" + question.text + "</span>" +
                    "<ol type=\"a\">" + 
                    question.options.map(function (option) { 
                        return "<li>" + option + "</li>"; }
                    ).join("") + 
                    "</ol></li>";
            }).join("") +
            "</ol>";
    }

    function renderModel(elem, model) {
        var formElem = window.document.createElement("form");
        if (model.onChanged) {
            formElem.addEventListener("submit", function () {
                model.onChanged();
            });
        }

        var tableElem = window.document.createElement("table");

        // Build the header
        var tHeadElem = tableElem.createTHead();
        Object.keys(model.attributeMap).forEach(function (key) {
            // for each column
            var trElem = window.document.createElement("tr");
            trElem.innerText = key;
        });

        // Build the body
        var tBodyElem = tableElem.createTBody();
        model.items.forEach(function (process) {
            // for each row
            renderModelRow(tHeadElem, model, process);
        });

        formElem.appendChild(tableElem);
        elem.appendChild(formElem);
    }

    function renderModelRow(tHeadElem, model, process) {
        var trElem = tHeadElem.insertRow(-1);
        Object.keys(model.attributeMap).forEach(function (key) {
            // for each column
            var attrIndex = model.attributeMap[key];
            var tdElem = trElem.insertCell(-1);
            var inputElem = window.document.createElement("input");
            inputElem.type = "text";
            inputElem.value = valueToText(process[attrIndex]);

            if (model.onChanged) {
                var commitEdits = createCommitEditsCallback(inputElem, model, process, attrIndex);
                inputElem.addEventListener("blur", commitEdits);
            }

            tdElem.appendChild(inputElem);
        });
    }

    function createCommitEditsCallback(inputElem, model, process, attrIndex) {
        return function() {
            process[attrIndex] = textToValue(attrIndex > 0, inputElem.value);
            model.onChanged();
        };
    }

    var modelItemsLocalStorageKey = "ittomodel";
    function loadModel(model) {
        var itemsString = window.localStorage.getItem(modelItemsLocalStorageKey);
        var items;

        if (typeof itemsString !== "undefined" && itemsString !== null) {
            try {
                items = JSON.parse(itemsString);
                if (typeof items !== "undefined" && items !== null) {
                    model.items = items;
                }
            } catch (error) {
                window.localStorage.removeItem(modelItemsLocalStorageKey);
            }
        }
    }

    function saveModel(model) {
        try {
            window.localStorage.setItem(modelItemsLocalStorageKey, JSON.stringify(model.items));
        } catch (error) {
        }
    }

    function valueToText(value) {
        return Array.isArray(value) ? value.join(", ") : value;
    }

    function textToValue(isArray, text) {
        var value;

        if (isArray) {
            value = (text || "").split(",").map(function (item) {
                return item.trim();
            });
        } else {
            value = (text || "").trim();
        }

        return value;
    }
})();
