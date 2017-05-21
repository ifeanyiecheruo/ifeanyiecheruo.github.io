(function () {
    var global = window;

    (global.itto = global.itto || {}).quiz = {
        create: function(model, options) {
            var processes = getRandomSubset(model.items, options.questionCount);

            var questions = processes.map(function (process) {
                return createQuestion(process, model, options.optionCount);
            }).filter(function (question) {
                return typeof question !== "undefined";
            });

            return {
                questions: questions
            };
        }
    };

    return;

    function randomInt(input) {
        return Math.floor(Math.random() * input);
    }

    function getRandomSubset(input, count) {
        return shuffle(input.slice(0)).slice(0, count);
    }

    function getRandomItem(input) {
        return input[randomInt(input.length)];
    }

    function isPublicAttributeName(name) {
        return name.indexOf("__") !== 0;
    }

    function shuffle(input) {
        var i, j, tmp;
        for (i = input.length - 1; i > 0; i--) {
            j = randomInt(i);
            tmp = input[i];
            input[i] = input[j];
            input[j] = tmp;
        }

        return input;
    }

    function getAllProcessAttributeValues(model, attributeName) {
        var result = {};
        var attributeIndex = model.attributeMap[attributeName];

        model.items.forEach(function (item) {
            var attrValue = item[attributeIndex];
            if (Array.isArray(attrValue)) {
                attrValue.forEach(function(value) {
                    result[value] = undefined;
                });
            } else {
                result[attrValue] = undefined;
            }
        });

        return result;
    }

    function prependAOrAn(text) {
        var startsWithVowel = text.length > 0 && "aeiou".indexOf(text[0]) >= 0;

        return (startsWithVowel ? "an " : "a ") + text;
    }

    function removeKeys(dict, keyNames) {
        keyNames.forEach(function (key) {
            delete dict[key];
        });

        return dict;
    }

    function createQuestion(process, model, optionCount) {
        var attributeName;
        var attributeValues;
        var correctOptions;
        var attributeNames = Object.keys(model.attributeMap).filter(isPublicAttributeName);

        while (attributeNames.length > 0) {
            attributeName = getRandomItem(attributeNames);
            correctOptions = process[model.attributeMap[attributeName]];

            if (!Array.isArray(correctOptions) || correctOptions.length < 1) {
                // The process does not have values for the randomly selected attribute
                // Remove that attribute from the set of attribute candidates and try again
                attributeNames.splice(attributeNames.indexOf(attributeName), 1);
                continue;
            }

            break;
        }

        if (attributeNames.length < 1) {
            return;
        }

        var correctOption = getRandomItem(correctOptions);
        var allOptions = getAllProcessAttributeValues(model, attributeName);
        var allWrongOptions = removeKeys(allOptions, correctOptions);
        var options = getRandomSubset(Object.keys(allWrongOptions), optionCount - 1);
        options.splice(randomInt(optionCount), 0, correctOption);

        return {
            text: "_ _ _ _ _ is " + prependAOrAn(attributeName) + " of " + process[model.attributeMap.__name],
            options: options,
            answer: correctOption
        };
    }
})();