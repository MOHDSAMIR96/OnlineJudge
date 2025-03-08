const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
     firstname:{
        type: String,
        default: null,
     },
     lastname:{
        type: String,
        default: null,
     },
     email:{
        type: String,
        required: true,
        unique: true,
     },
     password:{
        type: String,
        required: true,
     }
});
module.exports = mongoose.model('user',userSchema);