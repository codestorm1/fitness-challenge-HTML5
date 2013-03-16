({
    appDir: "../web/",
    baseUrl: "../web/js/",
    mainConfigFile: "../web/js/main.js",
    dir: "../webapp-build",
    //Comment out the optimize line if you want
    //the code minified by UglifyJS.
    //optimize: "none",
    name : "../webapp-build/js/main.js",
    keepBuildDir: true,

    paths: {
//        "jquery": "./libs/jquery-1.8.2.min",
//        "backbone": "./libs/backbone-0.9.2-min",
//        "stackmob": "./libs/stackmob-js-0.8.0-min",
//        "mustache": "./libs/mustache",
        "json2": "libs/json2-min",
        "underscore": "libs/underscore-1.4.1-min",
        //"underscore": "libs/lodash",
        "jquery": "libs/jquery-1.8.2.min",
        "jquerymobile": "libs/jquery.mobile-1.3.0.min",
        "backbone": "libs/backbone-0.9.2-min",
        "stackmob" : "libs/stackmob-js-0.8.0-min",
        "mustache": "libs/mustache"

    }


//
//    modules: [
//        {
//            "": "main"
//
//        }
//    ]
})