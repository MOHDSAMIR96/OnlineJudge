const mongoose = require('mongoose');
require('dotenv').config();

const DBConnection = async () => {
    const MONGODB_URL = process.env.MONGODB_URI || "fallback_connection_string_here";
    // console.log(MONGODB_URL);
    try{
        await mongoose.connect(MONGODB_URL);
        console.log("DB Connected Successfully!!");
    }catch(error){
        console.log("Error in DB Connection ",error);
    }
};

module.exports = { DBConnection };