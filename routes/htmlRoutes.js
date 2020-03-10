const path = require("path");

module.exports = (app) => {
    app.get("/", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/pages/index.html"));
    });
    app.get("*", (req, res) => {
        res.sendFile(path.join(__dirname, "../public/pages/404.html"));
    });
};