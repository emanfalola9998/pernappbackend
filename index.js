const express = require('express');
// const favicon = require('express-favicon');
const app = express();
const cors = require('cors');
// const pool = require('./db');
const {Pool} = require('pg');
const dbConfig = require('./dbConfig');
// const db = require('./db');
const dotenv = require('dotenv'); // Import dotenv

// Load environment variables from .env file
dotenv.config()

let pool;

const checkRemoteConnection = async () => {
    try {
        const tempPool = new Pool({
            connectionString: dbConfig.connectionString,
            ssl: {
                rejectUnauthorized: false, // Set to true in production with a valid certificate
            },
        });

        // Try connecting and immediately end the connection
        await tempPool.connect();
        tempPool.end();

        return true;
    } catch (error) {
        console.error('Failed to connect to the remote server:', error.message);
        return false;
    }
};

// Perform the check and choose the database pool during server startup
(async () => {
    if (await checkRemoteConnection()) {
        // If remote connection is successful, use remote pool
        pool = new Pool({
            connectionString: dbConfig.connectionString,
            ssl: {
                rejectUnauthorized: false, // Set to true in production with a valid certificate
            },
        });
    } else {
        // If remote connection fails, use a fallback local pool
        pool = new Pool({
            user: process.env.user,
            password: process.env.password,
            host: process.env.host,
            port: process.env.port,
            database: process.env.database,
        });
    }

//middleware
app.use(cors())
app.use(express.json())

//ROUTES//

//create a todo

app.post("/todos", async (req, res) => {
    try {
        const { description } = req.body;
        const newTodo = await pool.query("INSERT INTO todo (description) VALUES($1) RETURNING *", // We include RETURNING - so we can see what is being posted (in psotman)
            [description])

        res.json(newTodo.rows[0]); // only see the todo instead of the whole JSON
    } catch (err) {
        console.error(err);
    }
})


//get all todos
app.get("/todos", async (req, res) => {
    try {
        const allTodos = await pool.query("SELECT * FROM todo")
        res.json(allTodos.rows);
    }
    catch (err) {
        console.error(err.message);
    }
})

//get a todo

app.get("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params // const {id} = req.params: This line extracts the value of the id parameter from the request parameters.
        const todo = await pool.query("SELECT * FROM todo WHERE todo_id =  $1", [id])

        res.json(todo.rows)
    } catch (error) {
        console.error(error.message); // console.log appear in frontend on the webpage and in backend in the terminal
    }
}
)

//update a todo
app.put("/todos/:id", async (req, res) => {
    try {
        const { id } = req.params
        const { description } = req.body
        const updateTodo = await pool.query("UPDATE todo SET description = $1 WHERE todo_id = $2", [description, id])

        res.json('Todo was updated')
    }

    catch (error) {
        console.error(error.message); //
    }
})

//delete a todo
app.delete('/todos/:id', async (req, res) => {
    try {
        const { id } = req.params
        const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id])

        res.json(deleteTodo)
    } catch (error) {
        console.error(error.message); //
    }
})

app.listen(5000, () => {
    console.log('server has started on port 5000');
})
})()