define(function(require) {
    return {
        createClient: createClient
    };

    function createClient(modelItemsLocalStorageKey, expectedModelVersion) {
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
                } catch (error) {}
            }

            return model;
        }

        function saveModel(model) {
            try {
                window.localStorage.setItem(modelItemsLocalStorageKey, JSON.stringify(model));
            } catch (error) {}
        }
    }
});