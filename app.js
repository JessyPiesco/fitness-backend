require("dotenv").config()
const express = require("express")
const app = express()

const morgan = require("morgan");
const  client  = require('./db/client')

client.connect();

app.use(morgan("dev"));
const cors = require("cors");
app.use(cors());


app.use(express.json());



const apiRouter = require('./api');
app.use('/api',apiRouter);


app.use((req,res,next) => {
    

    next();
})




module.exports = app;
