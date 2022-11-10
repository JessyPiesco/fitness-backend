const { createActivity, getActivityById } = require('./activities');
const client = require('./client');
const { createRoutine, getRoutineById } = require('./routines');

async function getRoutineActivityById(id){
  try {
    const{ rows: [routine_activities]}= await client.query(`
      SELECT routine_activities.*
      FROM routine_activities
      WHERE id=$1;
    `, [id]);
    if(!routine_activities){
      throw{
        name:"Routine_activityNotFoundError",
        message:"Could not find a routine_activity with that id"
      };
    }
    return routine_activities;
  } catch (error) {
    console.error(error);
  }
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
  try{
    const {rows: routineIds} = await client.query(`
    SELECT *
    FROM routine_activities
    WHERE "routineId"= $1
    ;
    `,[id]);
    return routineIds;
  }catch(error){
    console.error(error);
  }
}

async function updateRoutineActivity ({id, ...field}) {
  const setString = Object.keys(field).map((key,index) => `"${key}" = $${index + 1}`).join(',')

  try {
    await client.query(`
      UPDATE routine_activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `,Object.values(field));

    const returnRoutineActivity = await getRoutineActivityById(id)

    return returnRoutineActivity
  } catch (error) {
    console.error(error)
  }
}

async function destroyRoutineActivity(id) {

  try {
    const {rows: [routine_activity]} = await client.query(`
      DELETE FROM routine_activities
      WHERE id = ${id}
      RETURNING *;
    `);
    return routine_activity
  } catch (error) {
    console.error(error)
  }
}

async function canEditRoutineActivity(routineActivityId, userId) {
  try {
    const {rows: [routinePermission]}= await client.query(`
  SELECT *
  FROM routine_activities
  JOIN routines ON routine_activities."routineId"=routines.id
  WHERE routine_activities.id=$1
  `,[routineActivityId])
  if (userId==routinePermission.creatorId){
    return true
  } else {return false}
} catch (error) {
    console.error(error)
}
}

module.exports = {
  getRoutineActivityById,
  addActivityToRoutine,
  getRoutineActivitiesByRoutine,
  updateRoutineActivity,
  destroyRoutineActivity,
  canEditRoutineActivity,
};
