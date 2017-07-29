define(function(require) {
    var ittoModel = require('lib/model');
    var ittoQuiz = require('lib/quiz');
    var ittoRender = require('lib/render');
    var ittoStorage = require('lib/storage');

    var containerElem = window.document.getElementById('ittoQuizContainer');
    var modelElem = window.document.getElementById('ittoModelContainer');
    var modelStore = ittoStorage.createClient("ittomodel", "1.0");

    setup(containerElem, modelElem, ittoModel, ittoQuiz, modelStore);

    function setup(containerElem, modelElem, ittoModel, ittoQuiz, modelStore) {
        var model = modelStore.load() || deepClone(ittoModel);

        model.onChanged = function() {
            modelStore.save(model);
        };

        var quiz = ittoQuiz.create(model, {
            questionCount: 20,
            optionCount: 5,
        });

        ittoRender.renderQuestions(containerElem, quiz.questions);

        ittoRender.renderModel(modelElem, model);

        /*
        var form = document.getElementById('my-form');
        if (form.attachEvent) {
            form.attachEvent("submit", processForm);
        } else {
            form.addEventListener("submit", processForm);
        }*/
    }

    function deepClone(value) {
        return JSON.parse(JSON.stringify(value));
    }
});