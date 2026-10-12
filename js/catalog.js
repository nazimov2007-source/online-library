const BOOKS = [
  { id: 1, title: 'Мастер и Маргарита',              author: 'М. Булгаков',     genre: 'Роман',      price: 590, cover: '📕' },
  { id: 2, title: '1984',                            author: 'Дж. Оруэлл',      genre: 'Фантастика', price: 450, cover: '📘' },
  { id: 3, title: 'Убийство в Восточном экспрессе',  author: 'А. Кристи',       genre: 'Детектив',   price: 520, cover: '📗' },
  { id: 4, title: 'Властелин колец',                 author: 'Дж. Толкин',      genre: 'Фэнтези',    price: 890, cover: '📙' },
  { id: 5, title: 'Преступление и наказание',        author: 'Ф. Достоевский',  genre: 'Роман',      price: 610, cover: '📕' },
  { id: 6, title: 'Дюна',                            author: 'Ф. Герберт',      genre: 'Фантастика', price: 720, cover: '📘' },
  { id: 7, title: 'Шерлок Холмс',                    author: 'А. Конан Дойл',   genre: 'Детектив',   price: 480, cover: '📗' },
  { id: 8, title: 'Гарри Поттер',                    author: 'Дж. Роулинг',     genre: 'Фэнтези',    price: 950, cover: '📙' }
];

document.addEventListener('DOMContentLoaded', () => {
  const catalogEl = document.getElementById('catalog');
  if (!catalogEl) return;

  const searchInput = document.getElementById('searchInput');
  const genreFilter = document.getElementById('genreFilter');
  const emptyMessage = document.getElementById('emptyMessage');

  function render(list) {
    catalogEl.innerHTML = '';
    if (list.length === 0) {
      emptyMessage.hidden = false;
      return;
    }
    emptyMessage.hidden = true;

    list.forEach(book => {
      const card = document.createElement('article');
      card.className = 'book-card';
      card.innerHTML = `
        <div class="book-card__cover">${book.cover}</div>
        <div class="book-card__body">
          <h3 class="book-card__title">${book.title}</h3>
          <p class="book-card__author">${book.author}</p>
          <span class="book-card__genre">${book.genre}</span>
          <p class="book-card__price">${book.price} ₽</p>
        </div>
      `;
      catalogEl.appendChild(card);
    });
  }

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const genre = genreFilter.value;

    const filtered = BOOKS.filter(book => {
      const matchesQuery =
        !query ||
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query);
      const matchesGenre = !genre || book.genre === genre;
      return matchesQuery && matchesGenre;
    });

    render(filtered);
  }

  searchInput.addEventListener('input', applyFilters);
  genreFilter.addEventListener('change', applyFilters);

  render(BOOKS);
});