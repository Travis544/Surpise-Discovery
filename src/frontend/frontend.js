var express = require("express");
let app = express();

app.use('/static', express.static("public"));
app.listen(8080);