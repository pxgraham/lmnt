var path = require("path");

module.exports = function(app) {
    app.get("/", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/pages/index.html"));
    });
    app.get("*", function(req, res) {
        res.sendFile(path.join(__dirname, "../public/pages/404.html"));
    });
};