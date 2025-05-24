const express = require('express');
const cors = require('cors');
const {DBConnection } = require('./database/db');
const routes = require("./routes/routes");
const app = express();

//middleware
app.use(express.json());
app.use(express.urlencoded({extended: true}));

DBConnection();

app.use(cors());
app.use("/", routes); 

const PORT = process.env.PORT || 8000;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}!`);
});