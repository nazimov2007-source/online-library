const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const fs = require('fs');
const path = require('path');
const session = require('express-session');
const bcrypt = require('bcryptjs'); // Библиотека для паролей

const app = express();
const PORT = 3000;

// Настройка шаблонизатора EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Чтобы сервер понимал данные из форм
app.use(express.urlencoded({ extended: true }));

// Подключение статических файлов (CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Настройка сессий
app.use(session({
    secret: 'secret_library_key_123', 
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }
}));

// Передача данных пользователя во все EJS-шаблоны
app.use((req, res, next) => {
    res.locals.user = req.session.user || null; 
    next();
});

// Подключение к БД
const db = new DatabaseSync('./books.db');

// Инициализация БД
try {
    const sql = fs.readFileSync('./database.sql', 'utf8');
    db.exec(sql);
    console.log('База данных инициализирована.');
} catch (e) {
    console.log('БД уже существует, пропускаем инициализацию.');
}

// ================= CRUD КНИГ =================

// 1. READ: Каталог
app.get(['/', '/catalog'], (req, res) => {
    const query = `
        SELECT books.*, genres.name as genre_name 
        FROM books 
        JOIN genres ON books.genre_id = genres.id
    `;
    const books = db.prepare(query).all();
    res.render('catalog', { books });
});

// 2. CREATE: Страница добавления
app.get('/add', (req, res) => {
    const genres = db.prepare("SELECT * FROM genres").all();
    res.render('add-book', { genres, error: null });
});

// 3. CREATE: Обработка добавления
app.post('/add', (req, res) => {
    const { title, author, price, genre_id } = req.body;
    if (!title || !author || !price) {
        const genres = db.prepare("SELECT * FROM genres").all();
        return res.render('add-book', { genres, error: 'Заполните все поля!' });
    }
    const query = `INSERT INTO books (title, author, price, genre_id) VALUES (?, ?, ?, ?)`;
    db.prepare(query).run(title, author, price, genre_id);
    res.redirect('/catalog');
});

// 4. READ: Просмотр одной книги
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

// 5. UPDATE: Страница редактирования
app.get('/edit/:id', (req, res) => {
    const book = db.prepare("SELECT * FROM books WHERE id = ?").get(req.params.id);
    if (!book) return res.status(404).send("Книга не найдена");
    res.render('edit-book', { book });
});

// 6. UPDATE: Обработка редактирования
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

// ================= АУТЕНТИФИКАЦИЯ (ЛР №3) =================

// Открытие страниц входа и регистрации
app.get('/login', (req, res) => res.render('login', { error: null }));
app.get('/register', (req, res) => res.render('register', { error: null }));

// ОБРАБОТКА РЕГИСТРАЦИИ (POST)
app.post('/register', async (req, res) => {
    const { fullName, email, login, password, passwordRepeat } = req.body;
    
    if (!fullName || !email || !login || !password) {
        return res.render('register', { error: 'Заполните все обязательные поля!' });
    }
    if (password.length < 6) {
        return res.render('register', { error: 'Пароль должен быть не менее 6 символов!' });
    }
    if (password !== passwordRepeat) {
        return res.render('register', { error: 'Пароли не совпадают!' });
    }

    const existingUser = db.prepare("SELECT * FROM users WHERE login = ? OR email = ?").get(login, email);
    if (existingUser) {
        return res.render('register', { error: 'Пользователь с таким логином или email уже существует.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        db.prepare("INSERT INTO users (fullname, email, login, password, role) VALUES (?, ?, ?, ?, 'USER')")
          .run(fullName, email, login, hashedPassword);
        res.redirect('/login');
    } catch (e) {
        res.render('register', { error: 'Ошибка базы данных при регистрации.' });
    }
});

// ОБРАБОТКА ВХОДА (POST)
app.post('/login', async (req, res) => {
    const { login, password } = req.body;

    try {
        const user = db.prepare("SELECT * FROM users WHERE login = ?").get(login);
        if (!user) {
            return res.render('login', { error: 'Неверный логин или пароль' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.render('login', { error: 'Неверный логин или пароль' });
        }

        req.session.user = { id: user.id, login: user.login, role: user.role };
        res.redirect('/catalog');
    } catch (e) {
        res.render('login', { error: 'Ошибка при входе в систему.' });
    }
});

// ВЫХОД ИЗ СИСТЕМЫ (LOGOUT)
app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) console.log(err);
        res.redirect('/');
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен: http://localhost:${PORT}/catalog`);
});