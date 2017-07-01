(function () {
    var global = window;
    var expectedModelVersion = "1.0";
    var modelStore = createModelStorageClient("ittomodel");

    (global.app = global.app || {}).onQuestionChanged = function(event, radioName) {
        var sourceText = event.target.value;
        var target = global.document.getElementById(radioName);

        target.innerText = sourceText;

        return false;
    };

    (global.app = global.app || {}).create = function(itto, containerElem, modelElem) {
        var model = modelStore.load() || deepClone(itto.model);

        model.onChanged = function() {
            modelStore.save(model);
        };

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
        var questionItems = questions.map(function (question, index) {
            var optionItems = question.options.map(function (option) { 
                var radioName = "option_" + index;
                return "<li><input type='radio' onchange='return app.onQuestionChanged(event, \"" + radioName + "\");' value='" + option + "' name='" + radioName + "'> " + option + "</li>"; }
            );

            var replacement = "<span id='option_" + index + "'>........</span>";
            return "<li><span>" + question.text.replace("$placeholder$", replacement) + "</span>" +
                "<ol type='a'>" + optionItems.join("") + 
                "</ol></li>";
        });

        elem.innerHTML = "<ol type='1'>" + questionItems.join("") + "</ol>";
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
        var trElem = window.document.createElement("tr");
        Object.keys(model.attributeMap).forEach(function (key) {
            var attr = model.attributeMap[key];
            var attrIndex = attr.index;

            if (typeof attrIndex !== "undefined") {
                // for each column
                var thElem = window.document.createElement("th");
                thElem.innerText = attr.label;
                trElem.appendChild(thElem);
            }
        });
        tHeadElem.appendChild(trElem);

        // Build the body
        var tBodyElem = tableElem.createTBody();
        model.items.forEach(function (process) {
            // for each row
            renderModelRow(tBodyElem, model, process);
        });
        tableElem.appendChild(tBodyElem);

        formElem.appendChild(tableElem);
        elem.appendChild(formElem);
    }

    function renderModelRow(tHeadElem, model, process) {
        var trElem = tHeadElem.insertRow(-1);
        Object.keys(model.attributeMap).forEach(function (key) {
            // for each column
            var attr = model.attributeMap[key];
            var attrIndex = attr.index;

            if (typeof attrIndex !== "undefined") {
                var tdElem = trElem.insertCell(-1);
                var inputElem = window.document.createElement("input");
                inputElem.type = "text";
                inputElem.value = valueToText(process[attrIndex]);

                if (model.onChanged) {
                    var commitEdits = createCommitEditsCallback(inputElem, model, process, attrIndex);
                    inputElem.addEventListener("blur", commitEdits);
                }

                tdElem.appendChild(inputElem);
            }
        });
    }

    function createCommitEditsCallback(inputElem, model, process, attrIndex) {
        return function() {
            process[attrIndex] = textToValue(attrIndex > 0, inputElem.value);
            model.onChanged();
        };
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

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }

    function createModelStorageClient(modelItemsLocalStorageKey) {
        return {
            save: saveModel,
            load: loadModel
        };

        function loadModel() {
            var modelString = window.localStorage.getItem(modelItemsLocalStorageKey);
            var parsedModel;
            var model;

            if (typeof modelString !== "undefined" && modelString !== null) {
                try {
                    parsedModel = JSON.parse(modelString);
                    if (typeof parsedModel !== "undefined" && parsedModel !== null && parsedModel.__version === expectedModelVersion) {
                        model = parsedModel;
                    }
                } catch (error) {
                }
            }

            return model;
        }

        function saveModel(model) {
            try {
                window.localStorage.setItem(modelItemsLocalStorageKey, JSON.stringify(model));
            } catch (error) {
            }
        }
    }
})();
