var Handlebars = require("handlebars")
var fs = require("fs")
var path = require("path")

var walk = function(dir, done) {
    // this function is by "chjj" and from http://stackoverflow.com/a/5827895/2822450
    // it does a recursive search in a specific directory
    var results = [];
    fs.readdir(dir, function(err, list) {
        if (err) return done(err);
        var pending = list.length;
        if (!pending) return done(null, results);
        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    walk(file, function(err, res) {
                        results = results.concat(res);
                        if (!--pending) done(null, results);
                    });
                } else {
                    results.push(file);
                    if (!--pending) done(null, results);
                }
            });
        });
    });
};

function getTemplates(type, callback) {
    /* gather all the templates needed for a specific type of app */

    walk("./templates/" + type, function(error, templates) {
        if (error) console.log(error)
        else callback(templates)
    })
}

/* Handlebars helpers */

Handlebars.registerHelper('safestring', function(string) {
    /* this returns a safe string for use in paths etc
     * usage: {{safestring "some string"}}
     */

    // needs extending
    string = string.replace(/ /g, "-")

    return string
});

Handlebars.registerHelper('ifequals', function(lvalue, rvalue, options) {
    /* source: http://doginthehat.com.au/2012/02/comparison-block-helper-for-handlebars-templates/
     * usage: {{#ifequals "somestring" "anotherstring"}}
     */

    if (arguments.length < 3)
        throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
});

Handlebars.registerHelper('ifin', function(elem, list, options) {
    /* source: https://axiacore.com/blog/check-if-item-array-handlebars/
     * checks to see if list contains elem
     * usage: {{ifin "some string" [some array]}}
     */

    if (list.indexOf(elem) > -1) {
        return options.fn(this);
    }
    return options.inverse(this);
});

/* Templating */
module.exports.Template = function(query, callback) {
    // the main Django templating function

    getTemplates(query.platform, function(templates) {
        var Templates = {};
        for (var file = 0; file < templates.length; file++) {
            // loop through all files required for query.type (templates/type/*)

            // read the contents
            var contents = fs.readFileSync(templates[file]).toString()

            // compile the template
            var template = Handlebars.compile(contents)
            var templateLocation = templates[file].replace(__dirname + "/templates/" + query.platform + "/", "")
            Templates[templateLocation] = template(query)
        }
        callback(Templates);
    })
}