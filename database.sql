-- 1. Таблица жанров
CREATE TABLE IF NOT EXISTS genres (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);

-- 2. Таблица книг (связана с жанрами)
CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    price INTEGER NOT NULL,
    genre_id INTEGER NOT NULL,
    FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
);

-- 3. Начальные данные (чтобы каталог не был пустым)
INSERT INTO genres (name) VALUES ('Роман'), ('Фантастика'), ('Детектив'), ('Фэнтези');

INSERT INTO books (title, author, price, genre_id) VALUES 
('Мастер и Маргарита', 'М. Булгаков', 590, 1),
('1984', 'Дж. Оруэлл', 450, 2),
('Убийство в Восточном экспрессе', 'А. Кристи', 520, 3),
('Властелин колец', 'Дж. Толкин', 890, 4),
('Преступление и наказание', 'Ф. Достоевский', 610, 1),
('Дюна', 'Ф. Герберт', 720, 2),
('Шерлок Холмс', 'А. Конан Дойл', 480, 3),
('Гарри Поттер', 'Дж. Роулинг', 950, 4);