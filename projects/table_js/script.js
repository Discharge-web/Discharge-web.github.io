// Использование библиотеки Tippy.js
function createTooltips(element, text = 'Не указан текст') {
    tippy(element, {
        content: text,
        allowHTML: true,
        placement: 'top-start',
        duration: 0,
        arrow: false,
        trigger: 'none',
        onMount(instance) {
          const box = instance.popper.firstElementChild;
          requestAnimationFrame(() => {
            box.classList.add('animate__animated','animate__tada');
          });
        },
        onHidden(instance) {
          const box = instance.popper.firstElementChild;
          box.classList.remove('animate__animated','animate__tada');
        },
      })
}
// Навешивания подсказок из Tippy.js
function setTooltips() {
    const filmForm = document.querySelector('#film-form');
    createTooltips(filmForm.name);
    createTooltips(filmForm.genre);
    createTooltips(filmForm.releaseYear);
}


function handleFormSubmit(e) {
    e.preventDefault();

    const filmForm = document.querySelector('#film-form');
    const film = {
       name:        filmForm.name.value,
       genre:       filmForm.genre.value,
       releaseYear: filmForm.releaseYear.value,
       isWatched:   filmForm.isWatched.checked
    }
    // Проверка на пустые поля
    let hasEmptyField = false;
    for (const key in film) {
        if (film[key].length == 0 && key !== 'isWatched') {
            filmForm[key].classList.add('input-error');
            filmForm[key].focus();
            filmForm[key]._tippy.setContent('Поле не должно быть пустым');
            filmForm[key]._tippy.show();
            hasEmptyField = true;
            break;
        }
    }

    if (!hasEmptyField) {
        const films = JSON.parse(localStorage.getItem('films')) || [];
        // Проверка на существующий фильм
        let hasPresence;
        for (let i = 0; i < films.length; i++) {
            hasPresence = films[i].name == film.name && films[i].genre == film.genre && films[i].releaseYear == film.releaseYear;
            if (hasPresence) break;
        }
        // Дополнительная валидация для индивидуальных полей
        if (!hasPresence) {
            const isRegular = /(^[А-Яа-яЁёa-z]+[А-Яа-яЁёa-z,\s\-]{0,})([А-Яа-яЁёa-z]+$)/g.test(film.genre);
            if (isRegular) {
                if (film.releaseYear.length == 4 && Number(film.releaseYear) >= 1885) {
                    addFilmToLocalSrorage(film);
                } else {
                    filmForm.releaseYear.classList.add('input-error');
                    filmForm.releaseYear.focus();
                    filmForm.releaseYear._tippy.setContent('Неверно указан год.<br>Отсчет ведется с 1885');
                    filmForm.releaseYear._tippy.show();
                }
            } else {
                filmForm.genre.classList.add('input-error');
                filmForm.genre.focus();
                filmForm.genre._tippy.setContent('Неверный формат.<br>Поле должно быть минимум 2 символа и не содержать цифр');
                filmForm.genre._tippy.show();
            };
        } else alert('Такой фильму уже есть в базе');
    }
}
// Добавление фильма в localStorage
function addFilmToLocalSrorage(film) {
    const films = JSON.parse(localStorage.getItem('films')) || [];
    films.push(film);
    localStorage.setItem('films', JSON.stringify(films));
    renderTable();
}

function renderTable() {
    const films = JSON.parse(localStorage.getItem('films')) || [];
    const tableEl = document.querySelector('#film-tbody');
    tableEl.textContent = '';

    let filteredFilms = films; // массив фильмов проходит через сортировку и фильтрацию

    const inputTexObj = {
        nameFilter:         document.querySelector('#nameFilter'),
        genreFilter:        document.querySelector('#genreFilter'),
        releaseYearFilter:  document.querySelector('#releaseYearFilter'),
        selectFilter:       document.querySelector('#selectFilter')
    }
    // Поиск активного radio значения
    const inputSortEl = document.querySelectorAll('.input-sort');
    let radioValue = '';
    for (const element of inputSortEl) {
        if (element.checked == true) {
            radioValue = element.value;
            break;
        }
    }
    // Сортировка
    switch (radioValue) {
        case 'name':
            filteredFilms = filteredFilms
                .sort((a, b) => a.name.toUpperCase() > b.name.toUpperCase() ? 1 : -1);
            break;
        case 'genre':
            filteredFilms = filteredFilms
                .sort((a, b) => a.genre.toUpperCase() > b.genre.toUpperCase() ? 1 : -1);
            break;
        case 'releaseYear':
            filteredFilms = filteredFilms
                .sort((a, b) => a.releaseYear < b.releaseYear ? 1 : -1);
            break;
    }
    // Фильтрация по названию
    if (inputTexObj.nameFilter.value.length != 0) {
        filteredFilms = filteredFilms.filter((element) => {
            for (let i = 0; i < inputTexObj.nameFilter.value.length; i++) {
                if (element.name[i] == undefined) return false;
                if (element.name[i].toUpperCase() !== inputTexObj.nameFilter.value[i].toUpperCase()) return false;
            }
            return true;
        });
    } 
    // Фильтрация по жанру
    if (inputTexObj.genreFilter.value.length != 0) {
        filteredFilms = filteredFilms.filter((element) => {
            for (let i = 0; i < inputTexObj.genreFilter.value.length; i++) {
                if (element.genre[i] == undefined) return false;
                if (element.genre[i].toUpperCase() !== inputTexObj.genreFilter.value[i].toUpperCase()) return false;
            }
            return true;
        });
    }
    // Фильтрация по году
    if (inputTexObj.releaseYearFilter.value.length != 0) {
        filteredFilms = filteredFilms.filter((element) => {
            for (let i = 0; i < inputTexObj.releaseYearFilter.value.length; i++) {
                if (element.releaseYear[i] == undefined) return false;
                if (element.releaseYear[i] !== inputTexObj.releaseYearFilter.value[i]) return false;
            }
            return true;
        });
    }
    // Фильтрация по налицию просмотра
    switch (inputTexObj.selectFilter.value) {
        case 'yes':
            filteredFilms = filteredFilms.filter((element) => element.isWatched == true);
            break;
        case 'no':
            filteredFilms = filteredFilms.filter((element) => element.isWatched == false);
            break;
    }
    // Рендер
    filteredFilms.forEach((film, index) => {
        const rowEl = document.createElement('tr');
        for (const key in film) {
            const colEl = document.createElement('td');
            if (key == 'isWatched') {
                colEl.textContent = film[key] ? 'Да' : 'Нет';
            } else colEl.textContent = film[key];
            rowEl.append(colEl);
        }
        const colEl = document.createElement('td');
        // Создание кнопки удалить
        const btnDeleteEl = document.createElement('button');
        btnDeleteEl.textContent = 'Удалить';
        btnDeleteEl.classList.add('btn', 'btn--red');
        btnDeleteEl.addEventListener('click', (e) => deleteRow(film));
        // Создание кнопки редактировать
        const btnEditEl = document.createElement('button');
        btnEditEl.textContent = 'Редактировать';
        btnEditEl.classList.add('btn', 'btn--grey', 'btn--offset');
        btnEditEl.addEventListener('click', (e) => editRow(film));

        colEl.append(btnEditEl, btnDeleteEl);
        rowEl.append(colEl);
        tableEl.append(rowEl);
    })
}
// Поиск фильма в массиве фильмов
function findId(film, films) {
    for (let i = 0; i < films.length; i++) {
        hasPresence = films[i].name == film.name && films[i].genre == film.genre && films[i].releaseYear == film.releaseYear;
        if (hasPresence) return i;
    }
}
// Удаление фильма
function deleteRow(filmObj) {
    const films = JSON.parse(localStorage.getItem('films')) || [];
    const idRow = findId(filmObj, films);
    const newFilms = films.filter((film, index) => index !== idRow);
    localStorage.setItem('films', JSON.stringify(newFilms));

    document.querySelector('#btnSubmit').classList.remove('visually-hidden');
    document.querySelectorAll('.btn-label').forEach((element) => element.remove());

    renderTable();
}
// Редактирование фильма
function editRow(filmObj) {
    document.querySelector('#btnSubmit').classList.add('visually-hidden'); // Скрывает кнопку добавить
    // Удаляет старые кнопки при повторном нажатии на редактировать
    document.querySelectorAll('.btn-label').forEach((element) => element.remove());

    const films = JSON.parse(localStorage.getItem('films')) || [];
    const idRow = findId(filmObj, films);
    // Выводит значения редактируемого фильма в поля ввода
    const filmForm = document.querySelector('#film-form');
    for (const key in films[idRow]) {
        if (key !== 'isWatched') filmForm[key].value = films[idRow][key]
            else filmForm[key].checked = films[idRow][key];
    }
    // Создание кнопки обновить
    const btnUpdateEl = document.createElement('button');
    btnUpdateEl.textContent = 'Обновить';
    btnUpdateEl.classList.add('btn', 'btn--grey', 'btn--offset', 'btn-label');
    btnUpdateEl.addEventListener('click', (e) => updateRow(e, idRow));
    // Создание кнопки отмены редактирования + событие
    const btnСancelEl = document.createElement('button');
    btnСancelEl.textContent = 'Отменить редактирование';
    btnСancelEl.classList.add('btn', 'btn--grey', 'btn-label');
    btnСancelEl.addEventListener('click', (e) => {
        e.preventDefault();
        document.querySelector('#btnSubmit').classList.remove('visually-hidden');
        document.querySelectorAll('.btn-label').forEach((element) => element.remove());
    });

    document.querySelector('#film-form').append(btnUpdateEl, btnСancelEl);
}
// Событие для кнопки обновления фильма
function updateRow(e, idRow) {
    e.preventDefault();
    const films = JSON.parse(localStorage.getItem('films')) || [];

    const film = {
        name:        document.querySelector('#name').value,
        genre:       document.querySelector('#genre').value,
        releaseYear: document.querySelector('#releaseYear').value,
        isWatched:   document.querySelector('#isWatched').checked
    }
    // Проверка на наличие изменений редактируемого фильма
    let count = 0;
    for (const key in film) {
        if (film[key] == films[idRow][key]) count++;
    }
    const hasChanges = (count !== Object.keys(film).length) 
    // Проверка на существующий фильм
    let hasPresence;
    for (let i = 0; i < films.length; i++) {
        if (i != idRow) {
            hasPresence = films[i].name == film.name && films[i].genre == film.genre && films[i].releaseYear == film.releaseYear;
            if (hasPresence) break;
        }
    }
    // Внесение изменений
    if (hasChanges && !hasPresence) {
        films[idRow].name = film.name;
        films[idRow].genre = film.genre;
        films[idRow].releaseYear = film.releaseYear;
        films[idRow].isWatched = film.isWatched;

        localStorage.setItem('films', JSON.stringify(films));

        document.querySelector('#btnSubmit').classList.remove('visually-hidden');
        document.querySelectorAll('.btn-label').forEach((element) => element.remove());

        renderTable();
    } else alert('Такой фильму уже есть в базе');
}
// Создание событий
function createEvents() {
    // Ограничение(4 символа) для поля год
    const inputYearEl = document.querySelector('#releaseYear');
    inputYearEl.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length >= 4) e.target.value = value.slice(0, 4);
        const isRegular = /^[0-9]+$/g.test(value);
        if (!isRegular) e.target.value = '';
    });
    // Ограничение(только цифры) для поля год
    inputYearEl.addEventListener('beforeinput', (e) => {
        let isRegular = /[0-9]/.test(e.data);
        if (e.data == '-' || (!isRegular && (e.inputType == 'insertText'))) e.preventDefault();
    });

    // События для кнопки "удалить все"
    document.querySelector('#btnDeleteAll').addEventListener('click', (e) => {
        localStorage.setItem('films', JSON.stringify([]));
        renderTable();
    })
    // События для кнопки "очистить"
    const btnClearEl = document.querySelector('#btnClear');
    btnClearEl.addEventListener('click', (e) => {
        const filmForm = document.querySelector('#film-form');
        filmForm.name.value = '';
        filmForm.genre.value = '';
        filmForm.releaseYear.value = '';
        filmForm.isWatched.checked = false;
    });
    // События для radio (при повторном клике убрать checked) + рендер
    document.querySelectorAll('.input-sort').forEach((element) => {
        element.addEventListener('click', (e) => {
        e.preventDefault(); 
            setTimeout(() => {
                element.checked = !element.checked;
                renderTable();
            });
        });
    });
    // События для всех полей типа text (focus, blur)
    document.querySelectorAll('input[type=text]').forEach((element) => {
        element.addEventListener('focus', (e) => {
            element.classList.add('input-focus');
        });

        element.addEventListener('blur', (e) => {
            element.classList.remove('input-focus', 'input-error');
        });
    });

    const inputTexObj = {
        nameFilter:         document.querySelector('#nameFilter'),
        genreFilter:        document.querySelector('#genreFilter'),
        releaseYearFilter:  document.querySelector('#releaseYearFilter'),
        selectFilter:       document.querySelector('#selectFilter')
    }
    // События для полей фильтрации, которые вызывают рендер при изменении + визуал, если после активно
    for (const key in inputTexObj) {
        if (key !== 'selectFilter') {
            inputTexObj[key].addEventListener('input', (e) => {
                if (inputTexObj[key].value.length != 0) inputTexObj[key].classList.add('input-active')
                    else inputTexObj[key].classList.remove('input-active');
                renderTable();
            });
        } else {
            inputTexObj[key].addEventListener('input', (e) => {
                switch (inputTexObj[key].value) {
                    case 'yes':
                    case 'no':
                        inputTexObj[key].classList.add('input-active')
                        break;
                    default:
                        inputTexObj[key].classList.remove('input-active');
                        break;
                }
                renderTable();
            });
        }
    }
    // Ограничение(4 символа) для поля год(фильтрация)
    inputTexObj.releaseYearFilter.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value.length >= 4) e.target.value = value.slice(0, 4);
        const isRegular = /^[0-9]+$/g.test(value);
        if (!isRegular) e.target.value = '';
    });
    // Ограничение(только цифры) для поля год(фильтрация)
    inputTexObj.releaseYearFilter.addEventListener('beforeinput', (e) => {
        let isRegular = /[0-9]/.test(e.data);
        if (e.data == '-' || (!isRegular && (e.inputType == 'insertText'))) e.preventDefault();
    });
}

createEvents();
setTooltips();

document.querySelector('#btnSubmit').addEventListener('click', handleFormSubmit);

renderTable();