const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const {runCode} = require("../controllers/compilerController");
const {updateLeaderboard, getLeaderboard} = require('../controllers/leaderboardController');


const {
    registerUser,
    loginUser,
    getUserInfo,
    getAllUsers,
  } = require("../controllers/authController");

  const {
    addProblem,
    editProblem,
    getAllProblems,
    getSingleProblem,
    deleteProblem,
  } = require("../controllers/problemController");
  
  const router = express.Router();
  
  router.get("/", (req, res) => {
    res.send("Home Page");
  });
  
  // register new user
  router.post("/register", registerUser);
  
  // login user
  router.post("/login", loginUser);
  
  // get user info
  router.get("/user/:id", getUserInfo);
  
  // get all users
  router.get("/users", getAllUsers);

  
  // add a problem
  router.post("/problem", addProblem);
  
  // edit a problem
  router.put("/problem/:id", editProblem);
  
  // get single problem
  router.get("/problem/:id", getSingleProblem);
  
  // get all problems
  router.get("/problems", getAllProblems);

  // delete a problem
  router.delete("/problem/:id", deleteProblem);

  // run code for cpp.java and python
  router.post("/run",runCode);

  // Update or create leaderboard entry
router.post('/updateLeaderboard', updateLeaderboard);

// Get top leaderboard
router.get('/getLeaderboard', getLeaderboard);
  
  module.exports = router;
