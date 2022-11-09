const client = require("./client")

// database functions
async function getAllActivities() {
  try{
    const {rows: activityIds} = await client. query(`
    SELECT id
    FROM activities;
    `);
    const activities= await Promise.all(
      activityIds.map((activity)=> getActivityById(activity.id))
    );
    return activities;
  }catch(error){
    console.error(error);
  }
}

async function getActivityById(id) {
try {
  const{ rows: [activity]}= await client.query(`
    SELECT *
    FROM activities
    WHERE id=$1;
  `, [id]);
  if(!activity){
    throw{
      name:"ActivityNotFoundError",
      message:"Could not find an activity with that id"
    };
  }
  return activity;
} catch (error) {
  console.error(error);
}
}

async function getActivityByName(name) {
    try {
      const {rows: [activityIds]} = await client.query(`
        SELECT id
        FROM activities
        WHERE name=$1
      `,[name])
      console.log(activityIds, "this is activityIds")
      const activities = await getActivityById(activityIds.id)

      return activities
    } catch (error) {
      console.error(error)
    }
}

// return the new activity
async function createActivity({ name, description }) {
try {
  const{rows: [activity]}= await client.query(`
  INSERT INTO activities(name, description)
  VALUES($1, $2)
  RETURNING *;
  `, [name, description]);
  return activity
} catch (error) {
  console.error(error);
}
}

// don't try to update the id
// do update the name and description
// return the updated activity
async function updateActivity({ id, ...field }) {

  const setString = Object.keys(field).map((key,index) => `"${key}" = $${index + 1}`).join(',')

  try {
    await client.query(`
      UPDATE activities
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `,Object.values(field));

    const returnActivity = await getActivityById(id)

    return returnActivity
  } catch (error) {
    console.error(error)
  }
}


async function attachActivitiesToRoutines(routines) {
  // no side effects
  const routinesToReturn = [...routines];
  const binds = routines.map((_, index) => `$${index + 1}`).join(', ');
  const routineIds = routines.map(routine => routine.id);
  if (!routineIds?.length) return [];

  try {
    // get the activities, JOIN with routine_activities (so we can get a routineId), and only those that have those routine ids on the routine_activities join
    const { rows: activities } = await client.query(`
      SELECT activities.*, routine_activities.duration, routine_activities.count, routine_activities.id AS "routineActivityId", routine_activities."routineId"
      FROM activities
      JOIN routine_activities ON routine_activities."activityId" = activities.id
      WHERE routine_activities."routineId" IN (${ binds });
    `, routineIds);

    // loop over the routines
    for(const routine of routinesToReturn) {
      // filter the activities to only include those that have this routineId
      const activitiesToAdd = activities.filter(activity => activity.routineId === routine.id);
      // attach the activities to each single routine
      routine.activities = activitiesToAdd;
    }
    return routinesToReturn;
  } catch (error) {
    console.error(error)
  }
}


module.exports = {
  getAllActivities,
  getActivityById,
  getActivityByName,
  attachActivitiesToRoutines,
  createActivity,
  updateActivity,
}
