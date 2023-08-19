const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');


const verifyToken = (req, res, next) => {
  const bearerHeader = req.headers['authorization'];
  if (typeof bearerHeader !== 'undefined') {
    //split at the space
    const bearer = bearerHeader.split(' ');
    //get token from array
    const bearerToken = bearer[1];
    //set the token
    req.token = bearerToken;
    //next middleware
    next();
  } else {
    //forbidden
    res.sendStatus(403);
  }
}

/* GET home page. */
router.get('/', (req, res, next) => {
  res.json("start");
});


router.post('/login', (req, res, next) => {
  const user = {
    id: 1,
    username: 'john',
    email: 'quaidahmed@gmail.com',
  }
  const secretKey = "secretKey";

  //jwt token
  jwt.sign({ user }, secretKey, (err, token) => {
    res.json({
      token
    });
  });


});


router.post('/profile', verifyToken, (req, res, next) => {
  try {
    res.json({"message": "profile page"});
  } catch (error) {
    res.sendStatus(403);
  }
});








module.exports = router;
