// ===== Инициализация при загрузке страницы =====
document.addEventListener('DOMContentLoaded', () => {
  initRegisterForm();
  initLoginForm();
  initPasswordToggles();
  initThemeToggle();
});

// ===== Валидация формы регистрации =====
function initRegisterForm() {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const message = document.getElementById('formMessage');

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const errors = validateRegister(form);

    if (Object.keys(errors).length > 0) {
      showErrors(form, errors);
      message.hidden = false;
      message.textContent = 'Пожалуйста, исправьте ошибки в форме.';
      message.className = 'form__message form__message--error';
      return;
    }

    clearErrors(form);
    message.hidden = false;
    message.textContent = '✅ Регистрация прошла успешно!';
    message.className = 'form__message form__message--success';
    form.reset();
  });
}

function validateRegister(form) {
  const errors = {};
  const fullName = form.fullName.value.trim();
  const email = form.email.value.trim();
  const login = form.login.value.trim();
  const password = form.password.value;
  const passwordRepeat = form.passwordRepeat.value;

  if (!fullName) errors.fullName = 'Введите ФИО';
  else if (fullName.length < 3) errors.fullName = 'Слишком короткое ФИО';

  if (!email) errors.email = 'Введите email';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.email = 'Некорректный email';

  if (!login) errors.login = 'Введите логин';
  else if (login.length < 3) errors.login = 'Логин должен быть от 3 символов';

  if (!password) errors.password = 'Введите пароль';
  else if (password.length < 8) errors.password = 'Пароль должен быть не менее 8 символов';

  if (!passwordRepeat) errors.passwordRepeat = 'Повторите пароль';
  else if (password !== passwordRepeat) errors.passwordRepeat = 'Пароли не совпадают';

  return errors;
}

// ===== Валидация формы входа =====
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  const message = document.getElementById('loginMessage');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const errors = {};

    if (!form.login.value.trim()) errors.loginName = 'Введите логин';
    if (!form.password.value) errors.loginPassword = 'Введите пароль';

    if (Object.keys(errors).length > 0) {
      showErrors(form, errors);
      if (message) {
        message.hidden = false;
        message.textContent = 'Пожалуйста, заполните все поля.';
        message.className = 'form__message form__message--error';
      }
      return;
    }

    clearErrors(form);
    if (message) {
      message.hidden = false;
      message.textContent = '✅ Вход выполнен!';
      message.className = 'form__message form__message--success';
    }
    form.reset();
  });
}

// ===== Показ/скрытие ошибок =====
function showErrors(form, errors) {
  clearErrors(form);
  for (const fieldName in errors) {
    const errorSpan = form.querySelector(`[data-error-for="${fieldName}"]`);
    const input = form.elements[fieldName];
    if (errorSpan) errorSpan.textContent = errors[fieldName];
    if (input) input.classList.add('input--error');
  }
}

function clearErrors(form) {
  form.querySelectorAll('.form__error').forEach(el => el.textContent = '');
  form.querySelectorAll('.input--error').forEach(el => el.classList.remove('input--error'));
  const msg = form.querySelector('.form__message');
  if (msg) msg.hidden = true;
}

// ===== Показ/скрытие пароля =====
function initPasswordToggles() {
  document.querySelectorAll('[data-toggle]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-toggle');
      const input = document.getElementById(targetId);
      if (!input) return;
      input.type = input.type === 'password' ? 'text' : 'password';
      btn.textContent = input.type === 'password' ? '👁' : '🙈';
    });
  });
}

// ===== Переключение темы =====
function initThemeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  const saved = localStorage.getItem('theme');
  if (saved === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    btn.textContent = '☀️';
  }

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
      btn.textContent = '🌙';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
      btn.textContent = '☀️';
    }
  });
}