// For any third party dependencies, like jQuery, place them in the scripts folder.

// Configure loading modules from the scripts directory,
// except for 'app' ones, which are in a sibling
// directory.
requirejs.config({
    baseUrl: 'scripts',
    paths: {
        'app': 'app'
    },
    map: {
        '*': {
            "react": 'extern/react.min',
            "react-dom": 'extern/react-dom.min',
        }
    }
});

// Start loading the main app file. Put all of
// your application logic in there.
requirejs(['app/main']);