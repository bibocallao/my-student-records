const express = require('express');
const pool = require('./db');

const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use('/bootstrap', express.static('node_modules/bootstrap/dist'));

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/students', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students ORDER BY last_name, first_name');
  res.render('students', { students: rows });
});

app.get('/students/new', (req, res) => {
  res.render('add');
});

app.get('/edit-students', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students ORDER BY last_name, first_name');
  res.render('edit-students', { students: rows });
});

// Show the edit form
app.get('/students/:id/edit', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [req.params.id]);

  if (rows.length === 0) {
    return res.status(404).send('Student not found');
  }

  res.render('edit', { student: rows[0] });
});

// Save the changes
app.post('/students/:id/update', async (req, res) => {
  const { first_name, last_name } = req.body;

  const [result] = await pool.query(
    'UPDATE students SET first_name = ?, last_name = ? WHERE id = ?',
    [first_name, last_name, req.params.id]
  );

  if (result.affectedRows === 0) {
    return res.status(404).send('Student not found');
  }

  res.redirect('/students');
});

app.post('/students', async (req, res) => {
  const { first_name, last_name } = req.body;
  await pool.query(
    'INSERT INTO students (first_name, last_name) VALUES (?, ?)',
    [first_name, last_name]
  );
  res.redirect('/students');
});

// Show the delete page
app.get('/delete-students', async (req, res) => {
  const [rows] = await pool.query('SELECT * FROM students ORDER BY last_name, first_name');
  res.render('delete-students', { students: rows });
});

// Delete one student
app.post('/students/:id/delete', async (req, res) => {
  await pool.query('DELETE FROM students WHERE id = ?', [req.params.id]);
  res.redirect('/delete-students');
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});