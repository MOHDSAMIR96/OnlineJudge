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

app.listen(8000, ()=>{
    console.log('Server is running on port 8000');
})