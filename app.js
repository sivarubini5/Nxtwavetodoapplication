const express = require('express')
const app = express()
const sqlite3 = require('sqlite3')
const {open} = require('sqlite')
app.use(express.json())
const path = require('path')
const {format} = require('date-fns')
const dbpath = path.join(__dirname, 'todoApplication.db')
let db = null
const initiate = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(`Error:${e}`)
  }
}
initiate()
app.get('/todos/', async (request, response) => {
  let {
    id = '',
    todo = '',
    priority = '',
    category = '',
    status = '',
    due_date = '',
  } = request.query
  let conditions = []
  if (id) {
    conditions.push(`id=${id}`)
  }
  if (todo) {
    conditions.push(`todo='${todo}'`)
  }
  if (category) {
    conditions.push(`category='${category}`)
  }
  if (priority) {
    conditions.push(`priority='${priority}'`)
  }
  if (status) {
    let s = status.replace(/%20/g, ' ')
    conditions.push(`status='${s}'`)
  }
  if (due_date) {
    let date = format(new Date(due_date), 'yyyy-MM-dd')
    conditions.push(`due_date='${date}'`)
  }
  let query =
    `SELECT * FROM todo` +
    (conditions.length ? ` WHERE ${conditions.join(' AND ')}` : '')
  let o = await db.all(query)
  response.send(o)
})
app.get('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let query = `select * from todo where id=${todoId}`
  let o = await db.get(query)
  response.send(o)
})
app.get('/agenda/', async (request, response) => {
  let {date} = request.query
  let due_date = format(new Date(date), 'yyyy-MM-dd')
  let query = `select * from todo where due_date='${due_date}'`
  console.log(date)
  console.log(due_date)
  let o = await db.get(query)
  console.log(o)
  response.send(o)
})
app.post('/todos/', async (request, response) => {
  let {id, todo, priority, status, category, dueDate} = request.body
  let query = `insert into todo values(${id},'${todo}','${category}','${priority}',
  '${status}','${dueDate}')`
  await db.run(query)
  response.send('Todo Successfully Added')
})
app.put('/todos/:todoId', async (request, response) => {
  let {todoId} = request.params
  let {
    todo = '',
    priority = '',
    status = '',
    category = '',
    dueDate = '',
  } = request.body
  responses = []
  let query
  if (todo) {
    query = `update todo set todo='${todo}' where id=${todoId}`
    responses.push('Todo Updated')
  }
  if (priority) {
    query = `update todo set priority='${priority}' where id=${todoId}`
    responses.push('Priority Updated')
  }
  if (status) {
    query = `update todo set status='${status}' where id=${todoId}`
    responses.push('Status Updated')
  }
  if (category) {
    query = `update todo set category='${category}' where id=${todoId}`
    responses.push('Category Updated')
  }
  if (dueDate) {
    query = `update todo set due_date='${dueDate}' where id=${todoId}`
    responses.push('Due Date Updated')
  }
  await db.run(query)
  response.send(responses)
})
app.delete('/todos/:todoId/', async (request, response) => {
  let {todoId} = request.params
  let query = `delete from todo where id=${todoId}`
  await db.run(query)
  response.send('Todo Deleted')
})
module.exports = app
