define(function (require) {
    "use strict";

    const uuid = require('lib/uuid');
    const ReactDOM = require('react-dom');

    return {
        renderQuestions: renderQuestions,
        renderModel: renderModel
    };

    function renderQuestionsReact(elem, questions) {
        ReactDOM.render(
            QuestionList({ questions: questions }),
            elem
        );
    }

    function QuestionList(props) {
        const questionElements = props.questions.map(question => {
            const key = question.text + "|" + question.options.join("|");
        
            return <QuestionItem key={key} question={question} />;
        });
        
        return <ol type='1'>{questionElements}</ol>;
    }

    function QuestionItem(props) {
        const question = props.question;
        const selectedIndex = question.options.selectedIndex;
        let selectedText;
        
        if (typeof selectedIndex === "number") {
            selectedText = question.options[selectedIndex]; 
        }
        
        const replacement = selectedText || ".........";
        const displayText = question.text.replace("$placeholder$", replacement);
        const radioName = uuid();
        const optionElements = question.options.map((option, index) => {
            return <OptionItem 
                key={option}
                option={option}
                index={index}
                radioName={radioName}
                />;
        });
        
        return <li>
            <span>{displayText}</span>
            <ol type="a">{optionElements}</ol>
            </li>;
    }

    function OptionItem(props) {
        return <li>
            <input 
                type="radio"
                value={props.option}
                name={props.radioName}
                change={onChanged} />
            <span> {option}</span>
            </li>;
            
        function onChanged(e) {
            e.preventDefault();
            question.options.selectedIndex = props.index;
        }
    }

    function renderQuestions(elem, questions) {
        const list = elem.ownerDocument.createElement("ol");
        list.type = "1";

        questions.forEach((question, index) => {
            const li = list.ownerDocument.createElement("li");
            renderQuestion(li, question, index);
            list.appendChild(li);
        });

        elem.appendChild(list);

        function renderQuestion(elem, question, questionIndex) {
            const span = elem.ownerDocument.createElement("span");
            const replacement = "<span id='option_" + questionIndex + "'>........</span>";
            span.innerHTML = question.text.replace("$placeholder$", replacement);

            const list = elem.ownerDocument.createElement("ol");
            list.type = "a";

            question.options.forEach(option => {
                const li = elem.ownerDocument.createElement("li");
                renderQuestionOption(li, option, questionIndex);
                list.appendChild(li);
            });

            elem.appendChild(span);
            elem.appendChild(list);
        }

        function renderQuestionOption(elem, option, questionIndex) {
            const radioName = "option_" + questionIndex;
            const radioElem = elem.ownerDocument.createElement("input");
            radioElem.type = "radio";
            radioElem.value = option;
            radioElem.name = radioName;
            radioElem.addEventListener("change", onQuestionSelectionChanged);

            const span = elem.ownerDocument.createElement("span");
            span.innerText = " " + option;

            elem.appendChild(radioElem);
            elem.appendChild(span);

            function onQuestionSelectionChanged(event) {
                const target = event.target;
                const radioName = target.name;
                const radioSelection = target.value;
                const element = target.ownerDocument.getElementById(radioName);

                element.innerText = radioSelection;

                return false;
            }
        }
    }

    function renderModel(elem, model) {
        const formElem = window.document.createElement("form");
        if (model.onChanged) {
            formElem.addEventListener("submit", function() {
                model.onChanged();
            });
        }

        const tableElem = window.document.createElement("table");

        // Build the header
        const tHeadElem = tableElem.createTHead();
        const trElem = window.document.createElement("tr");
        Object.keys(model.attributeMap).forEach(function(key) {
            const attr = model.attributeMap[key];
            const attrIndex = attr.index;

            if (typeof attrIndex !== "undefined") {
                // for each column
                const thElem = window.document.createElement("th");
                thElem.innerText = attr.label;
                trElem.appendChild(thElem);
            }
        });
        tHeadElem.appendChild(trElem);

        // Build the body
        const tBodyElem = tableElem.createTBody();
        model.items.forEach(function(process) {
            // for each row
            renderModelRow(tBodyElem, model, process);
        });
        tableElem.appendChild(tBodyElem);

        formElem.appendChild(tableElem);
        elem.appendChild(formElem);

        function renderModelRow(tHeadElem, model, process) {
            const trElem = tHeadElem.insertRow(-1);
            Object.keys(model.attributeMap).forEach(function(key) {
                // for each column
                const attr = model.attributeMap[key];
                const attrIndex = attr.index;

                if (typeof attrIndex !== "undefined") {
                    const tdElem = trElem.insertCell(-1);
                    const inputElem = window.document.createElement("input");
                    inputElem.type = "text";
                    inputElem.value = valueToText(process[attrIndex]);

                    if (model.onChanged) {
                        const commitEdits = createCommitEditsCallback(inputElem, model, process, attrIndex);
                        inputElem.addEventListener("blur", commitEdits);
                    }

                    tdElem.appendChild(inputElem);
                }
            });
        }

        function createCommitEditsCallback(inputElem, model, process, attrIndex) {
            return () => {
                process[attrIndex] = textToValue(attrIndex > 0, inputElem.value);
                model.onChanged();
            };
        }

        function valueToText(value) {
            return Array.isArray(value) ? value.join(", ") : value;
        }

        function textToValue(isArray, text) {
            let value;

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