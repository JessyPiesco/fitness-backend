const { attachActivitiesToRoutines } = require('./activities');
const client = require('./client');

async function getRoutineById(id){
  try {
  const{ rows: [routine]}= await client.query(`
    SELECT *
    FROM routines
    WHERE id=$1;
  `, [id]);
  if(!routine){
    throw{
      name:"RoutineNotFoundError",
      message:"Could not find a routine with that id"
    };
  }
  return routine;
} catch (error) {
  console.error(error);
}
}


// async function getRoutinesWithoutActivities(){
// } Nick said big NO NO

async function getAllRoutines() {
  try{
    const {rows: results} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    ;
    `);
    const routines = await attachActivitiesToRoutines(results)
    return routines;
  }catch(error){
    console.error(error);
  }

}

async function getAllRoutinesByUser({username}) {
  try {const {rows: routineIds}= await client.query(`
  SELECT id
  FROM routines
  WHERE id=${username};
  `);
  const routines= await getRoutineById(routineIds.id)
  // const routines = await Promise.all(
  //   routineIds.map((routine)=> getRoutineById(routine.id))
  // );
    return routines;
  } catch (error) {
    console.error(error)
  }
}

async function getPublicRoutinesByUser({username}) {


}

async function getAllPublicRoutines() {
}

async function getPublicRoutinesByActivity({id}) {
}

async function createRoutine({creatorId, isPublic, name, goal}) {
  try {
    const{rows:[routine]}=await client.query(`
    INSERT INTO routines("creatorId", "isPublic", name, goal)
    VALUES($1, $2, $3, $4)
    RETURNING *;
    `, [creatorId, isPublic, name, goal]);
    return routine

  }catch (error) {
    console.error(error)

  }
}

async function updateRoutine({id, ...field}) {
  const setString = Object.keys(field).map((key,index) => `"${key}" = $${index + 1}`).join(',')

  try {
    await client.query(`
      UPDATE routines
      SET ${setString}
      WHERE id = ${id}
      RETURNING *;
    `,Object.values(field));

    const returnRoutine = await getRoutineById(id)

    return returnRoutine
  } catch (error) {
    console.error(error)
  }
}

async function destroyRoutine(id) {
  try {
    const {rows: [routine]} = await client.query(`
      DELETE FROM routines
      WHERE id = ${id};
    `);
    return routine
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  getRoutineById,
  // getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}
