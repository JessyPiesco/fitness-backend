const { createActivity, getActivityById } = require('./activities');
const client = require('./client');
const { createRoutine } = require('./routines');

async function getRoutineActivityById(id){
}

async function addActivityToRoutine({routineId, activityId, count, duration,}) {
  try {
    const createActivityRoutinePromise= routineId.map((routine)=> createActivity(routine.name, activityId.description))
    await Promise.all(createActivityRoutinePromise);
    return await getActivityById(id)

  } catch (error) {
    console.error(error)
  }

}

async function getRoutineActivitiesByRoutine({id}) {
}

async function updateRoutineActivity ({id, ...fields}) {
}

async function destroyRoutineActivity(id) {
}

async function canEditRoutineActivity(routineActivityId, userId) {
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
