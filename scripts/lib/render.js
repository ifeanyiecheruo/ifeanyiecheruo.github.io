define(function(require) {
    return {
        renderQuestions: renderQuestions,
        renderModel: renderModel
    };

    function renderQuestions(elem, questions) {
        var list = elem.ownerDocument.createElement("ol");
        list.type = "1";

        questions.forEach(function(question, index) {
            var li = list.ownerDocument.createElement("li");
            renderQuestion(li, question, index);
            list.appendChild(li);
        });

        elem.appendChild(list);

        function renderQuestion(elem, question, questionIndex) {
            var span = elem.ownerDocument.createElement("span");
            var replacement = "<span id='option_" + questionIndex + "'>........</span>";
            span.innerHTML = question.text.replace("$placeholder$", replacement);

            var list = elem.ownerDocument.createElement("ol");
            list.type = "a";

            question.options.forEach(function(option) {
                var li = elem.ownerDocument.createElement("li");
                renderQuestionOption(li, option, questionIndex);
                list.appendChild(li);
            });

            elem.appendChild(span);
            elem.appendChild(list);
        }

        function renderQuestionOption(elem, option, questionIndex) {
            var radioName = "option_" + questionIndex;
            var radioElem = elem.ownerDocument.createElement("input");
            radioElem.type = "radio";
            radioElem.value = option;
            radioElem.name = radioName;
            radioElem.addEventListener("change", onQuestionSelectionChanged);

            var span = elem.ownerDocument.createElement("span");
            span.innerText = " " + option;

            elem.appendChild(radioElem);
            elem.appendChild(span);

            function onQuestionSelectionChanged(event) {
                var radioName = event.target.name;
                var radioSelection = event.target.value;
                var target = global.document.getElementById(radioName);

                target.innerText = radioSelection;

                return false;
            }
        }
    }

    function renderModel(elem, model) {
        var formElem = window.document.createElement("form");
        if (model.onChanged) {
            formElem.addEventListener("submit", function() {
                model.onChanged();
            });
        }

        var tableElem = window.document.createElement("table");

        // Build the header
        var tHeadElem = tableElem.createTHead();
        var trElem = window.document.createElement("tr");
        Object.keys(model.attributeMap).forEach(function(key) {
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
        model.items.forEach(function(process) {
            // for each row
            renderModelRow(tBodyElem, model, process);
        });
        tableElem.appendChild(tBodyElem);

        formElem.appendChild(tableElem);
        elem.appendChild(formElem);

        function renderModelRow(tHeadElem, model, process) {
            var trElem = tHeadElem.insertRow(-1);
            Object.keys(model.attributeMap).forEach(function(key) {
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
                value = (text || "").split(",").map(function(item) {
                    return item.trim();
                });
            } else {
                value = (text || "").trim();
            }

            return value;
        }

    }
});