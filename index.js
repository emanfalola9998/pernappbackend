const express = require('express');
const favicon = require('express-favicon');
const app = express();
const cors = require('cors');
const pool = require('./db');
// const firebaseApp = require('firebase/app');

//middleware
app.use(cors())
app.use(express.json())
app.use(favicon(__dirname + '/public/favicon.png'));
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
app.get("/", async (req, res) => {
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
        const {id} = req.params
        const deleteTodo = await pool.query("DELETE FROM todo WHERE todo_id = $1", [id])

        res.json(deleteTodo)
    } catch (error) {
        console.error(error.message); //
    }
})

app.listen(5000, () => {
    console.log('server has started on port 5000');
})
