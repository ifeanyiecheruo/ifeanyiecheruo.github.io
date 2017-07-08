(function () {
    var global = window;

    (global.itto = global.itto || {}).model = {
        attributeMap:{
            "__version": "1.0",
            "__name": { label: "Process", index: 0, },
            "input": { label: "Input", index: 1, },
            "toolAndtechnique": { label: "Tool or Technique", index: 2, },
            "output": { label: "Output", index: 3, }, 
        },
        items: [
            ["bake", 
                ["flour", "sugar", "butter", "cinnamon"], 
                ["spatula", "sieve", "pan", "oven", "whisking", "beating", "sifting"], 
                ["cake"]
            ],
            ["fishing",
                ["bait"],
                ["fishing-rod", "reeling", "casting"],
                ["salmon"]
            ],
            ["painting",
                ["paint"],
                ["brush", "water-color"],
                ["portrait"]
            ]
        ]
    };
})();