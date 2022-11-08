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


async function getRoutinesWithoutActivities(){
}

async function getAllRoutines() {
  try{
    const {rows: routineIds} = await client.query(`
    SELECT id
    FROM routines;
    `);
    console.log(routineIds, "this is routineIds")
    const routines= await Promise.all(
    routineIds.map((routine)=> getRoutineById(routine.id))
    );
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

async function updateRoutine({id, ...fields}) {
}

async function destroyRoutine(id) {
}

module.exports = {
  getRoutineById,
  getRoutinesWithoutActivities,
  getAllRoutines,
  getAllPublicRoutines,
  getAllRoutinesByUser,
  getPublicRoutinesByUser,
  getPublicRoutinesByActivity,
  createRoutine,
  updateRoutine,
  destroyRoutine,
}
