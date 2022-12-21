const express = require('express');
const cors = require('cors')
const { requireUser } = require('./utils');
const { getRoutineActivityById, updateRoutineActivity, destroyRoutineActivity, getRoutineById } = require('../db');
const router = express.Router();

router.use(cors())

// PATCH /api/routine_activities/:routineActivityId
router.patch('/:routineActivityId', requireUser, async (req, res, next)=>{
  const {routineActivityId}=req.params;
const { activityId, duration, count }= req.body;
const updateFields={};
if(duration){
  updateFields.duration=duration;
}
if(count){
  updateFields.count=count
}
 const orginalRoutine = await getRoutineActivityById(routineActivityId);
  const routineUser= await getRoutineById(orginalRoutine.routineId)
try{
  if (orginalRoutine && routineUser.id == req.user.id){
    const updateRoutine= await updateRoutineActivity({id:routineActivityId,activityId: orginalRoutine.activityId, duration, count});
    res.send(updateRoutine);
  }else{
    next({
      error: "unauthroizedUser",
      message:`User ${req.user.username} is not allowed to update ${routineUser.name}`,name:"unauthorizedUserError",
    });
  }
}catch (error){
  next({
    error: "unauthroizedUser",
    message:`user ${req.user.username} is not allowed to update ${orginalRoutine}`,
    name:"unauthorizedUserError",
  });
  }

}
);

// DELETE /api/routine_activities/:routineActivityId
router.delete("/:routineActivityId", requireUser, async (req, res, next)=>{
  const {routineActivityId}= req.params;
  try{
    const deleteRoutineItem = await destroyRoutineActivity(routineActivityId);
    console.log(deleteRoutineItem, "what is this?")
    res.send(deleteRoutineItem);
  }catch(error){
    next({
      error: "unauthroizedUser",
      message:`user ${req.user.username} is not allowed to delete ${routineActivityId}`,name:"unauthorizedUserError",
    });
  }
});

module.exports = router;
