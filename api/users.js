const express = require('express');
const cors = require('cors');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { getUserByUsername, createUser, getAllRoutinesByUser } = require('../db');
const { requireUser } = require('./utils');
const { UserDoesNotExistError } = require('../errors');
const{ JWT_SECRET} = process.env
router.use(cors())

router.use((req, res, next) => {
    console.log("A request is being made to /users");
    next();
  });

// POST /api/users/login
router.post('/login', async (req, res, next) => {
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
        const token = jwt.sign({ id: user.id, username }, JWT_SECRET);
            res.send({
                user,
                message: "you're logged in!",
                token: token})
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
            res.status(401)
            next({
                name: "UserExistError",
                message: `User ${username} is already taken.`,
                error: "duplicateUsername"
            })

        }
       if(password.length<8){
        next({
            name:"password to short",
            message:"Password Too Short!",
            error:"passwordToShort"
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
            user,
            message: 'Thank you for signing up!',
            token
        });

    } catch ({name,message}) {
        next({name,message});
    }
})
// GET /api/users/me
router.get('/me', requireUser, async (req, res, next) => {
try {
    res.send(req.user)

} catch (error) {
    next(error)
}
})
// GET /api/users/:username/routines
router.get('/:username/routines', async (req, res, next)=>{
    let{username}=req.params;
    try {
        const allRoutines= await getAllRoutinesByUser({username});
        console.log(allRoutines)
        const routines= allRoutines.filter(routine=>{
            return routine.isPublic || routine.creatorId === req.user.id

        })
        res.send(routines)

    } catch ({name, message, error}) {
        next({
            name:"NoRoutines",
            message:"Nothing to grab",
            error:"nothing found in username/routines"
    })

    }
})

module.exports = router;
