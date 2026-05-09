const express = require('express');
const app = express(); 
const path = require('path');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('in.ejs');
});

// Dashboard route (button ke baad ye open hoga)
app.get('/menu', (req, res) => {
    res.render('menu.ejs');
});

 app.listen(3000, () => {
    console.log('Server is running');
}); 

