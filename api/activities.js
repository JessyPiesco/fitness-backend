const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { getAllActivities, getAllPublicRoutines, getPublicRoutinesByActivity } = require('../db');
const router = express.Router();

router.use(cors())

// GET /api/activities/:activityId/routines
router.get('/:activityId/routines', async (req, res, next)=>{
  let {activityId: id}=req.params;
  console.log(id, "HERRE")
  try {
    const allActivities= await getPublicRoutinesByActivity({id});


    const activities= allActivities.filter(activity=>{
        return activity.id===req.activities.id

    })
    console.log(activities,"allacts");
    if(activities.length===0){next({
      name:"NoActivities",
        message:`Activity ${id} not found`,
        error:"nothing found in activityid/routine"
    })}
    res.send(activities)

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

// PATCH /api/activities/:activityId

module.exports = router;
