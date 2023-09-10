import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import connectDB from './config/connectdb.js';
import express from 'express';
import userRoutes from './routes/userRoutes.js';

const app = express()
const port = process.env.PORT
const DATABASE_URL = process.env.DATABASE_URL

//CORS policy
app.use(cors())

//Database Connection
connectDB(DATABASE_URL)

//JSON
app.use(express.json()) //json() is a built-in middleware function in Express. 
//This method is used to parse the incoming requests with JSON payloads and is based upon the bodyparser. 
//This method returns the middleware that only parses JSON and only looks at the requests where the content-type header matches the type option.

//Load Routes
app.use(`/api/user`, userRoutes)

app.listen(port, ()=>{
  console.log(`server listening at http://localhost:${port}`)
})