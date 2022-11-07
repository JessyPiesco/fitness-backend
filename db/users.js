/* eslint-disable no-useless-catch */
const { getAllActivities } = require("./activities");
const client = require("./client");

// database functions

// user functions
async function createUser({ username, password }) {
  try {
    const {rows: [users]} = await client.query(`
      INSERT INTO users(username,password)
      VALUES ($1,$2)
      ON CONFLICT (username) DO NOTHING
      RETURNING *;
    `,[username, password]);
    delete users.password
    return users
  } catch (error) {
   console.error(error)
  }
}

async function getUser({ username, password }) {
  if(!username || !password){
    return null
  }
  
  if(username && password){

  try {
    const singleUser = await getUserByUsername(username)

    if(!singleUser){
      return null
    }

    if(password === singleUser.password){
      delete singleUser.password
      return singleUser
    } else {
      return null
    }

  } catch (error) {
    throw error
  }  
}
}

async function getUserById(userId) {
  try {
    const {rows: [user]} = await client.query(`
      SELECT id, username
      FROM users
      WHERE id =${userId}
    `)

    if(!user){
      return null
    }

    user.activities = await getAllActivities(userId)


    return user
  } catch (error) {
    console.error(error)
  }
}

async function getUserByUsername(userName) {
  try {
    const {rows: [user]} = await client.query(`
      SELECT *
      FROM users
      WHERE username=$1;
    `, [userName]);
    return user;
  } catch (error) {
    console.error(error)
  }
}

module.exports = {
  createUser,
  getUser,
  getUserById,
  getUserByUsername,
}
