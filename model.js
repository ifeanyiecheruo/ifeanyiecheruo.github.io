(function () {
    var global = window;

    (global.itto = global.itto || {}).model = {
        attributeMap:{
            "__name": 0,
            "input": 1,
            "tool": 2,
            "technique": 3,
            "output": 4 
        },
        items: [
            ["bake", 
                ["flour", "sugar", "butter", "cinnamon"], 
                ["spatula", "sieve", "pan", "oven"], 
                ["whisking", "beating", "sifting"], 
                ["cake"]
            ],
            ["craft",
                ["cloth", "button", "thread", "googly-eyes", "glue"],
                ["scissors", "needle", "tape"],
                ["stitch", "tape", "hem"],
                ["puppet"]
            ],
            ["draw",
                ["subject"],
                ["pen", "paper"],
                ["cross-hatch"],
                ["portrait"]
            ]
        ]
    };
})();