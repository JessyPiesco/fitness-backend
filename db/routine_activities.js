const { createActivity, getActivityById } = require('./activities');
const client = require('./client');
const { createRoutine } = require('./routines');

async function getRoutineActivityById(id){
}

async function addActivityToRoutine({routineId, activityId, count, duration}) {
  try {
    const {rows: [routine_activity]} = await client.query(`
    INSERT INTO routine_activities("routineId", "activityId",count, duration)
    VALUES($1, $2, $3, $4)
    ON CONFLICT ("routineId", "activityId") DO NOTHING
    RETURNING *
    `, [routineId, activityId, count, duration])

    return routine_activity


  } catch (error) {
    console.error(error)
  }

}

async function getRoutineActivitiesByRoutine({id}) {
}

async function updateRoutineActivity ({id, ...fields}) {
}

async function destroyRoutineActivity(id) {
  try {
    const {rows: [routine_activity]} = await client.query(`
      DELETE FROM routine_activities
      WHERE id = ${id};
    `);
    return routine_activity
  } catch (error) {
    console.error(error)
  }
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
