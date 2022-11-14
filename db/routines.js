/* eslint-disable no-useless-catch */
const { attachActivitiesToRoutines } = require('./activities');
const { getUserByUsername } = require('./users');
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
  try {
    const {rows} = await client.query(`
    SELECT * FROM routines;
    `);
    return rows;
  } catch (error) {
    throw error
  }

}

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
   try{
    const user = await getUserByUsername(username)
    const {rows: results} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "creatorId"= $1
    ;
    `,[user.id]);
    const routines = await attachActivitiesToRoutines(results)
    return routines;
  }catch(error){
    throw error
  }
}

async function getPublicRoutinesByUser({username}) {
  try{
    const user = await getUserByUsername(username)
    const {rows: results} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "creatorId"= $1
    AND "isPublic"=true
    ;
    `,[user.id]);
    const routines = await attachActivitiesToRoutines(results)
    return routines;
  }catch(error){
    console.error(error);
  }
}

async function getAllPublicRoutines() {
  try{
    const {rows: results} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    WHERE "isPublic" = true
    ;
    `);
    const routines = await attachActivitiesToRoutines(results)
    return routines;
  }catch(error){
    console.error(error);
  }
}

async function getPublicRoutinesByActivity({id}) {

  try{
    const {rows: results} = await client.query(`
    SELECT routines.*, users.username AS "creatorName"
    FROM routines
    JOIN users ON routines."creatorId" = users.id
    JOIN routine_activities ON routine_activities."routineId" = routines.id
    WHERE routine_activities."activityId" = $1
    AND routines."isPublic" = true
    ;
    `,[id]);
    const routines = await attachActivitiesToRoutines(results)
  
    return routines;
  }catch(error){
    console.error(error);
  }
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
     await client.query(`
      DELETE FROM routine_activities
      WHERE "routineId" = ${id};
    `);
    const {rows: [routine]} = await client.query(`
      DELETE FROM routines
      WHERE id = ${id}
      RETURNING *;
    `);
    return routine
  } catch (error) {
    console.error(error)
  }
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
