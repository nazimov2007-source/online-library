const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Чтобы сервер понимал данные из форм
app.use(express.urlencoded({ extended: true }));

// Подключение статических файлов (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Подключение к БД
const db = new DatabaseSync('./books.db');

// Инициализация БД (создание таблиц из database.sql)
try {
    const sql = fs.readFileSync('./database.sql', 'utf8');
    db.exec(sql);
    console.log('База данных инициализирована.');
} catch (e) {
    console.log('БД уже существует, пропускаем инициализацию.');
}

// ================= CRUD =================

// 1. READ: Каталог (SELECT с JOIN)
app.get(['/', '/catalog'], (req, res) => {
    const query = `
        SELECT books.*, genres.name as genre_name 
        FROM books 
        JOIN genres ON books.genre_id = genres.id
    `;
    const books = db.prepare(query).all();
    res.render('catalog', { books });
});

// 2. CREATE: Страница добавления (GET)
app.get('/add', (req, res) => {
    const genres = db.prepare("SELECT * FROM genres").all();
    res.render('add-book', { genres, error: null });
});

// 3. CREATE: Обработка формы добавления (POST)
app.post('/add', (req, res) => {
    const { title, author, price, genre_id } = req.body;
    
    // Серверная валидация
    if (!title || !author || !price) {
        const genres = db.prepare("SELECT * FROM genres").all();
        return res.render('add-book', { genres, error: 'Заполните все поля!' });
    }

    const query = `INSERT INTO books (title, author, price, genre_id) VALUES (?, ?, ?, ?)`;
    db.prepare(query).run(title, author, price, genre_id);
    
    res.redirect('/catalog');
});

// 4. READ: Просмотр одной книги (GET параметр)
app.get('/book/:id', (req, res) => {
    const query = `
        SELECT books.*, genres.name as genre_name 
        FROM books JOIN genres ON books.genre_id = genres.id 
        WHERE books.id = ?
    `;
    const book = db.prepare(query).get(req.params.id);
    
    if (!book) {
        return res.status(404).send("<h1>404 - Книга не найдена</h1><a href='/catalog'>Вернуться в каталог</a>");
    }
    res.render('book-detail', { book });
});

// 5. UPDATE: Страница редактирования (GET)
app.get('/edit/:id', (req, res) => {
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
    if (!book) return res.status(404).send("Книга не найдена");
    res.render('edit-book', { book });
});

// 6. UPDATE: Обработка формы редактирования (POST)
app.post('/edit/:id', (req, res) => {
    const { title, author, price } = req.body;
    const query = `UPDATE books SET title = ?, author = ?, price = ? WHERE id = ?`;
    db.prepare(query).run(title, author, price, req.params.id);
    res.redirect('/catalog');
});

// 7. DELETE: Удаление книги
app.get('/delete/:id', (req, res) => {
    db.prepare("DELETE FROM books WHERE id = ?").run(req.params.id);
    res.redirect('/catalog');
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/catalog`);
});