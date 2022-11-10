const express = require('express');
const cors = require('cors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserByUsername, createUser, getAllUsers } = require('../db');
const token = jwt.sign({id: 1, username: 'albert'}, process.env.JWT_SECRET)
router.use(cors())


// POST /api/users/login
router.post('./login', async (req, res, next) => {
    const {username,password} = req.body;

    if (!username || !password) {
        next({
            name: "MissingCredentialError",
            message: "Please supply both a username and password"
        });
    }

    try {
        const user = await getUserByUsername(username);

        if (user && user.password == password) {
            res.send({message: "you're logged in!", token: token})
        } else {
            next({
                name: "IncorrectCredentialError",
                message: "Username or password is incorrect"
            })
        }
    } catch (error) {
        console.log(error);
        next(error);
    }
})
// POST /api/users/register
router.post('/register', async (req, res, next) => {
    const {username, password} = req.body

    try {
        const _user = await getUserByUsername(username)

        if (_user){
            next({
                name: "UserExistError",
                message: "A user by that username already exists."
            })
        }

        const user = await createUser({username, password})

        const token = jwt.sign({
            id: user.id,
            username
        },process.env.JWT_SECRET,{
            expiresIn:'1w'
        })

        res.send({
            message: 'Thank you for signing up!',
            token
        });
        console.log(token, "BYE BYE")
    } catch ({name,message}) {
        next({name,message});
    }
})
// GET /api/users/me

// GET /api/users/:username/routines

module.exports = router;
