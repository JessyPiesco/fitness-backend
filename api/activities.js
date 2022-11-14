const express = require('express');
const cors = require('cors');
const { getAllActivities, getPublicRoutinesByActivity, createActivity, getActivityById, updateActivity, getActivityByName } = require('../db');
const { requireUser } = require('./utils');
const router = express.Router();

router.use(cors())

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next)=>{
  let {activityId: id}=req.params;

  try {
    const allActivities= await getPublicRoutinesByActivity({id});
   
    if(!allActivities.length){next({
      name:"NoActivities",
        message:`Activity ${id} not found`,
        error:"nothing found in activityid/routine"
    })} else {
      res.send(allActivities)
    }
    

} catch ({name, message, error}) {
    next({
        name:"NoActivities",
        message:`Activity ${id} not found`,
        error:"nothing found in activityid/routine"
})

}
})
// GET /api/activities
router.get('/', async(req,res)=>{
  const activities= await getAllActivities();
  res.send(
    activities
  );
});

// POST /api/activities
router.post('/', requireUser, async (req, res, next) => {
  const {name, description} = req.body;

  const activityData = {name, description, creatorId: req.user.id}

  try {
    const activity = await createActivity(activityData)

    if(activity) {
      res.send(activity)
    } else {
      next({
      name:"DuplicateActivities",
      message:"An activity with name Push Ups already exists",
      error:"activity already made"
    })
    }
  } catch ({error}) {
    next({
      name:"DuplicateActivities",
      message:"An activity with name Push Ups already exists",
      error:"activity already made"
})
  }
})

// PATCH /api/activities/:activityId
router.patch('/:activityId', requireUser, async (req,res,next) => {
  const {activityId} = req.params
  const {name, description} = req.body
  const updateFields = {}

  if (name){
    const possibleName = await getActivityByName(name)
    if(possibleName===undefined){
    updateFields.name = name}
    else{
      next({
        name: 'ActivityAlreadyExist',
        message: `An activity with name ${name} already exists`,
        Error: 'Activity duplicate'
      })
    }
  }

  if (description){
    updateFields.description = description
  }

  try {
    const originalActivity = await getActivityById(activityId)


    
    if (originalActivity){
      const updatedActivity = await updateActivity ({id:activityId,name,description})
      
      res.send(updatedActivity)
    } 
    
    else{
      next({
        name: 'ActivityDoesNotExist',
        message: `Activity ${activityId} not found`,
        Error: 'Activity unavailable'
      })
    } 
  } catch (error) {
    next({
      name: 'UnauthorizedUserError',
      message: 'You cannot update a activity that is not yours',
      Error: 'Unauthorized User'
    })
  }
})

module.exports = router;
