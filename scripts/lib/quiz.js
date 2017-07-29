define(function(require) {
    return {
        create: create
    };

    function create(model, options) {
        var sampler = getReservoirSampler(options.questionCount);
        //var allOptionsPerKey = {};

        forEachOptionGroup(model, function(model, process, attributeKey, correctOptions) {
            correctOptions.forEach(function(option, index) {
                sampler.sample({
                    model: model,
                    process: process,
                    attributeKey: attributeKey,
                    correctOptions: correctOptions,
                    correctOptionIndex: index,
                });
            }, this);
        });

        return {
            questions: shuffle(sampler.getResult()).map(function(item) {
                var model = item.model;
                var process = item.process;
                var attributeKey = item.attributeKey;
                var correctOptions = item.correctOptions;
                var correctOptionIndex = item.correctOptionIndex;

                var processLabel = process[model.attributeMap.__name.index];
                var attributeLabel = model.attributeMap[attributeKey].label;
                var allOptions = getAllProcessAttributeValues(model, attributeKey);
                var allWrongOptions = removeKeys(allOptions, correctOptions);
                var correctOption = correctOptions[correctOptionIndex];
                var questionOptions = getRandomSubset(Object.keys(allWrongOptions), options.optionCount - 1);
                questionOptions.splice(randomInt(options.optionCount), 0, correctOption);

                return {
                    text: "$placeholder$ is " + prependAOrAn(attributeLabel).toLowerCase() + " of " + processLabel,
                    options: questionOptions,
                    answer: correctOption
                };
            })
        };
    }

    function isPublicAttributeKey(key) {
        return key.indexOf("__") !== 0;
    }

    function getAllProcessAttributeValues(model, attributeName) {
        var result = {};
        var attributeIndex = model.attributeMap[attributeName].index;

        model.items.forEach(function(item) {
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

    function removeKeys(dict, keyNames) {
        keyNames.forEach(function(key) {
            delete dict[key];
        });

        return dict;
    }

    function prependAOrAn(text) {
        var startsWithVowel = text.length > 0 && "aeiou".indexOf(text[0]) >= 0;

        return (startsWithVowel ? "an " : "a ") + text;
    }

    function forEachOptionGroup(model, callback) {
        var processIndex;
        var process;
        var attributeIndex;
        var attributeKey;
        var correctOptions;
        var attributeKeys = Object.keys(model.attributeMap).filter(isPublicAttributeKey);

        for (processIndex = 0; processIndex < model.items.length; processIndex++) {
            process = model.items[processIndex];
            for (attributeIndex = 0; attributeIndex < attributeKeys.length; attributeIndex++) {
                attributeKey = attributeKeys[attributeIndex];
                correctOptions = getProcessAttributeOptions(model, process, attributeKey);
                if (callback(model, process, attributeKey, correctOptions)) {
                    return;
                }
            }
        }

        function getProcessAttributeOptions(model, process, attributeKey) {
            var correctOptions = process[model.attributeMap[attributeKey].index];

            return Array.isArray(correctOptions) ? correctOptions : [];
        }
    }

    function randomInt(input) {
        return Math.floor(Math.random() * input);
    }

    function getRandomSubset(input, count) {
        var sampler = getReservoirSampler(count);

        input.forEach(sampler.sample, sampler);

        return sampler.getResult();
    }

    function shuffle(input) {
        var i, j;
        var temp;

        for (i = input.length - 1; i > 0; i--) {
            j = randomInt(i - 1);
            temp = input[i];
            input[i] = input[j];
            input[j] = temp;
        }

        return input;
    }

    function getReservoirSampler(maxSamples) {
        var result = [];
        var sampleCount = 0;
        return {
            sample: function(item) {
                sampleCount++;

                if (result.length < maxSamples) {
                    result.push(item);
                } else {
                    var dstIndex = Math.floor(Math.random() * sampleCount);
                    if (dstIndex < maxSamples) {
                        result[dstIndex] = item;
                    }
                }
            },
            getResult: function() {
                return result;
            },
        };
    }
});