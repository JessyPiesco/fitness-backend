const express = require('express');
const cors = require('cors');
const { getAllRoutines, createRoutine, updateRoutine, getRoutineById } = require('../db');
const router = express.Router();
const { requireUser } = require('./utils');

router.use(cors())

// GET /api/routines
router.get('/', async(req,res)=>{
    const routines= await getAllRoutines();
    res.send(
      routines
    );
  });
// POST /api/routines
router.post('/', requireUser, async (req, res, next) => {
    const {creatorId, isPublic, name, goal} = req.body;
  
    const routineData = {creatorId: req.user.id , isPublic, name, goal}
  console.log(routineData, "ehl")
    try {
      const routine = await createRoutine(routineData)
  
      if(routine) {
        res.send(routine)
      } else {
        next({
        name:"DuplicateActivities",
        message:"Requires logged in user",
        error:"activity already made"
      })
      }
    } catch ({error}) {
      next({
        name:"DuplicateActivities",
        message:"Requires logged in user",
        error:"activity already made"
  })
    }
  })
// PATCH /api/routines/:routineId
router.patch('/:routineId', requireUser, async (req,res,next) => {
    const {routineId} = req.params
    const { isPublic, name, goal} = req.body
    console.log(req.body, "Yes")
    const updateFields = {}

  
    if(isPublic){
        updateFields.isPublic = isPublic
    }

    if (name){
      updateFields.name = name      
    }
  
    if (goal){
      updateFields.goal = goal
    }
  
    try {
      const originalRoutine = await getRoutineById(routineId)
  console.log(originalRoutine, "NOte")
  
      
      if (originalRoutine){ 
        if(req.user.id === originalRoutine.creatorId){

        
        const updatedRoutine = await updateRoutine ({id:originalRoutine.creatorId,isPublic,name,goal})
       
        res.send(updatedRoutine)
        } else {
            res.status(403)
            next({
                name: 'ActivityDoesNotExist',
                message: `User ${req.user.username} is not allowed to update ${originalRoutine.name}`,
                Error: 'Activity unavailable'  
            })
        }
      } 
    } catch (error) {
      next()
    }
  })

// DELETE /api/routines/:routineId

// POST /api/routines/:routineId/activities

module.exports = router;
