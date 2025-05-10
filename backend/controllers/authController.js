const User = require('../model/User');
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


exports.registerUser = async (req, res) => {
try{
    // get all the data from the request body/frontend/ui/web
    const {firstname,lastname,email,password} = req.body;

    console.log(firstname,lastname,email,password);
    // res.send("OK");
    // check that all the data should present
    if(!firstname || !lastname || !email || !password){
        return res.status(400).json({error: "All input fields are required!", status: false});
   }
    // check if the user is already in the database
    const existingUser = await User.findOne({email});
    if(existingUser){
        return res.status(400).json({error: "User Already exists", status: false});
    }
    //encrypt the password
    const hashedPassword = await bcrypt.hash(password,10);
    // save the user data to the database
    const user = await User.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
    });
    // generate a token for the user and send to it
    const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, {
        expiresIn: "4h",
      });
      user.token = token;
  
      // remove password from the user object before sending it to the client
      user.password = undefined;
  
      res.status(200).json({ message: "User registered successfully", status: true, user });
}catch(error){
    console.log("Error in register route",error);
    res.status(500).json({ error: "Internal Server Error" });
}
};
exports.loginUser = async (req, res) => {
try {
     // get all the data from the request body/frontend/ui/web
      const { email, password } = req.body;
  
       // check that all the data should present
      if (!email || !password) {
        return res.status(422).json({ error: "All input fields are required!" });
      }
  
      // find the user in the database
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(404).json({ error: "User not found!" });
      }
  
      // match/compare the password
      const isMatch = bcrypt.compareSync(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Invalid credentials!" });
      }

      // store cookies and send the server
     // Generate JWT token for authentication
      const token = jwt.sign({ _id: user._id, email }, process.env.JWT_SECRET, {
        expiresIn: "4h"});

     // Store token in the user object
      user.token = token;

    // Prepare response
    const userResponse = {
      _id: user._id,
      firstname: user.firstname,
      lastname: user.lastname,
      email: user.email,
      token
  };

      // remove password from the user object before sending it to the client
      user.password = undefined;
  
      // Send success response with user data
    res.status(200).json({
        message: "User logged in successfully",
        status: true,
        user: userResponse ,
      });
    } catch (error) {
      console.log("Error in login routes", error);
      res.status(500).json({ error: "Internal Server Error" });
    }

};
exports.getUserInfo = async (req, res) => {
    try {
      const { id } = req.params;
  
      const user = await User.findById(id).select('-password');
  
      if (!user) {
        return res.status(404).json({ error: "User not found" ,status: false });
      }
  
      user.password = undefined;
  
      res.status(200).json({ user,status: true });
    } catch (error) {
      console.log("Error in Get User Info", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
  
  exports.getAllUsers = async (req, res) => {
    try {
      const users = await User.find({}).select('-password');
      res.status(200).json({ users,  status: true  });
    } catch (error) {
      console.log("Error in Get All Users", error);
      res.status(500).json({ error: "Internal Server Error" ,  status: false });
    }
  };