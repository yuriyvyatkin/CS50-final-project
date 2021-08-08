'use strict';

class Calendar {
  constructor(args) {
    this.container = args.container;
    this.year = args.date.getFullYear();
    this.month = args.date.getMonth();
    this.day = args.date.getDate();
    this.language = args.language;
    this.container.innerHTML = this.getCalendarHTML();
    this.tBody = this.container.querySelector('tbody');
    this.controlForm = this.container.querySelector('#control-form');
    this.selectedDay = null;
    this.fillTableHead();
    this.fillTableBody();
    this.registerEvents();
  }

  getFirstDay() {
    const firstDay = new Date(this.year, (this.month)).getDay();

    return (firstDay === 0 ? 7 : firstDay) - 1;
  }

  getLastDay() {
    return new Date(this.year, this.month + 1, 0).getDate();
  }

  getMonth(value) {
    const monthsNamesRu = [
      'Янв',
      'Фев',
      'Мар',
      'Апр',
      'Май',
      'Июн',
      'Июл',
      'Авг',
      'Сен',
      'Окт',
      'Ноя',
      'Дек'
    ];
    const monthsNamesEn = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec'
    ];
    let monthName;

    if (typeof value === 'number') {
      if (this.language === 'ru') {
        monthName = monthsNamesRu[value];
      }
  
      if (this.language === 'en') {
        monthName = monthsNamesEn[value];
      }

      return monthName;
    }

    if (typeof value === 'string') {
      monthName = value.charAt(0).toUpperCase()
        + value.substring(1).toLowerCase();
      let monthNumber;

      if (this.language === 'ru') {
        monthNumber = monthsNamesRu.indexOf(monthName);
      }

      if (this.language === 'en') {
        monthNumber = monthsNamesEn.indexOf(monthName);
      }

      if (monthNumber !== -1) {
        return {
          name: monthName,
          number: monthNumber
        };
      } else {
        return 'Invalid value!';
      }
    }
  }

  getCalendarHTML() {
    const month = this.getMonth(this.month);
    const chosenDate = `${this.year}/${this.month + 1}/${this.day}`;

    return `
      <table>
        <thead></thead>
        <tbody></tbody>
      </table>
      <form id='control-form'>
        <a class='green' id='left' href='#'>&larr;</a>
        <input id='date' value='${month} ${this.year}' data-chosen-date='${chosenDate}' data-last-date='${month} ${this.year}' onCopy='return false' onDrag='return false' onDrop='return false' onPaste='return false' autocomplete='off' maxlength='8'>
        <a class='green' id='right' href='#'>&rarr;</a>
      </form>
    `;
  }

  fillTableHead() {
    const tHead = this.container.querySelector('thead');

    tHead.textContent = '';

    let weekdays = '';

    if (this.language === 'ru') {
      const weekdaysRu = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      for (let i = 0; i < 7; i++) {
        weekdays += `<th>${weekdaysRu[i]}</th>`;
      }
    }

    if (this.language === 'en') {
      const weekdaysEn = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let i = 0; i < 7; i++) {
        weekdays += `<th>${weekdaysEn[i]}</th>`;
      }
    }

    tHead.insertAdjacentHTML('afterbegin', weekdays);
  }

  fillTableBody() {
    this.tBody.textContent = '';

    const firstDay = this.getFirstDay();
    const lastDay = this.getLastDay();

    // вставляем строки и ячейки
    for (let i = 0; i < 6; i++) {
      this.tBody.insertRow();
    }

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 7; j++) {
        this.tBody.rows[i].insertCell();
      }
    }

    // заполняем ячейки датами
    const cells = this.tBody.getElementsByTagName('td');

    let day = 0;

    while(day < lastDay) {
      const cell = cells[firstDay + day];
      cell.textContent = ++day;
      cell.dataset.name = 'day';
    }

    this.selectedDay = cells [firstDay + this.day - 1];
    this.selectedDay.classList.add('selected');
  }

  updateTableBody(data) {
    const date = new Date(data);
    this.year = date.getFullYear();
    this.month = date.getMonth();
    this.day = 1;
    this.fillTableBody();
  }

  updateLanguage(language) {
    if (language === 'en' || language === 'ru') {
      this.language = language;
      this.fillTableHead();
      const date = this.controlForm.querySelector('#date');
      const month = this.getMonth(this.month);
      date.value = `${month} ${this.year}`;
      date.dataset.lastDate = date.value;
      date.setCustomValidity('');
    }
  }

  registerEvents() {
    const date = this.controlForm.querySelector('#date');
    const leftBtn = this.controlForm.querySelector('#left');
    const rightBtn = this.controlForm.querySelector('#right');

    this.tBody.addEventListener('click', (event) => {
      const {target} = event;

      if (target.dataset.name === 'day' && target !== this.selectedDay) {
        target.classList.add('selected');
        this.selectedDay.classList.remove('selected');
        this.selectedDay = target;
        date.dataset.chosenDate = `${this.year}/${this.month + 1}
          / ${target.textContent}`;
        results.updateValues();
      }
    });

    date.addEventListener('input', (event) => {
      const target = event.currentTarget;
      const value = target.value;

      let errors;
      const yearValue = value.match(/([1-9]\d+)/g);
      const year = yearValue ? +yearValue[0] : 0;
      let monthValue;
      let month;

      if (this.language === 'ru') {
        errors = {
          monthMismatch: 'Значение должно иметь первые три буквы месяца!',
          yearMismatch: 'Значение должно включать год между 1970 и 2170 включительно!'
        };
        monthValue = value.match(/([янвфемарпйиюлгсоктд]+)/ig);
        if (!monthValue) {
          target.setCustomValidity(errors.monthMismatch);
        } else {
          month = this.getMonth(monthValue.sort()[0]);
        }
      }

      if (this.language === 'en') {
        errors = {
          monthMismatch: 'Value should have the first three letters of the month!',
          yearMismatch: 'Value should have the year between 1970 and 2170 inclusive!'
        };
        monthValue = value.match(/([janfebmrpyulgsoctvd]+)/ig);
        if (!monthValue) {
          target.setCustomValidity(errors.monthMismatch);
        } else {
          month = this.getMonth(monthValue.sort()[0]);
        }
      }

      if (month === 'Invalid value!') {
        target.setCustomValidity(errors.monthMismatch);
      } else if (year < 1970 || year > 2170) {
        target.setCustomValidity(errors.yearMismatch);
      } else {
        target.setCustomValidity('');

        date.value = `${month.name} ${year}`;
        date.dataset.chosenDate = `${year}/${month.number + 1}/1`;
        date.dataset.lastDate = date.value;
        this.updateTableBody(date.dataset.chosenDate);
        results.updateValues();
      }
    });

    date.addEventListener('focus', (event) => {
      const target = event.currentTarget;

      if (target.value === target.dataset.lastDate) {
        target.dataset.lastDate = target.value;
        target.value = '';
      }
    });

    date.addEventListener('blur', (event) => {
      const target = event.currentTarget;

      if (target.value === '') {
        target.value = target.dataset.lastDate;
        target.setCustomValidity('');
      }
    });

    leftBtn.onclick = () => {
      if (!/^1970\/1\//.test(date.dataset.chosenDate)) {
        if (this.month) {
          --this.month;
        } else {
          --this.year;
          this.month = 11;
        }
        const month = this.getMonth(this.month);
        this.day = 1;
        this.fillTableBody();
        date.value = `${month} ${this.year}`;
        date.dataset.chosenDate = `${this.year}/${this.month + 1}/1`;
        date.dataset.lastDate = date.value;
        results.updateValues();
      }
    }

    rightBtn.onclick = () => {
      if (!/^2170\/12/.test(date.dataset.chosenDate)) {
        if (this.month !== 11) {
          ++this.month;
        } else {
          ++this.year;
          this.month = 0;
        }
        const month = this.getMonth(this.month);
        this.day = 1;
        this.fillTableBody();
        date.value = `${month} ${this.year}`;
        date.dataset.chosenDate = `${this.year}/${this.month + 1}/1`;
        date.dataset.lastDate = date.value;
        results.updateValues();
      }
    }
  }

  getChosenDate() {
    const date = this.container.querySelector('#date');

    return new Date(date.dataset.chosenDate);
  }
}

class Results {
  constructor(language) {
    this.container = document.querySelector('#results');
    this.language = language;
    this.container.innerHTML = this.getResultsHTML();
    this.updateValues();
  }

  getResultsHTML() {
    if (this.language === 'en') {
      return `
        <caption>
          Between chosen dates
        </caption>
        <tr>
          <td class='days-name'>Days</td>
          <td class='days-value'>0</td>
        </tr>
        <tr>
          <td class='workdays-name'>Workdays</td>
          <td class='workdays-value'>0</td>
        </tr>
        <tr>
          <td class='weekdays-name'>Weekdays</td>
          <td class='weekdays-value'>0</td>
        </tr>
        <tr>
          <td class='weeks-name'>Weeks</td>
          <td class='weeks-value'>0</td>
        </tr>
        <tr>
          <td class='weeks rest' colspan='2'>
            and
            <span class='days-value'>0</span>
            <span class='days-name'>days</span>
          </td>
        </tr>
        <tr>
          <td class='months-name'>Months</td>
          <td class='months-value'>0</td>
        </tr>
        <tr>
          <td class='months rest' colspan='2'>
            and
            <span class='weeks-value'>0</span>
            <span class='weeks-name'>weeks</span>,
            <span class='days-value'>0</span>
            <span class='days-name'>days</span>
          </td>
        </tr>
        <tr>
          <td class='years-name'>Years</td>
          <td class='years-value'>0</td>
        </tr>
        <tr>
          <td class='years rest' colspan='2'>
            and
            <span class='months-value'>0</span>
            <span class='months-name'>months</span>,
            <span class='weeks-value'>0</span>
            <span class='weeks-name'>weeks</span>,
            <span class='days-value'>0</span>
            <span class='days-name'>days</span>
          </td>
        </tr>
      `
    }

    if (this.language === 'ru') {
      return `
        <caption>
          Между выбранными датами
        </caption>
        <tr>
          <td class='days-name'>Дней</td>
          <td class='days-value'>0</td>
        </tr>
        <tr>
          <td class='workdays-name'>Рабочих дней</td>
          <td class='workdays-value'>0</td>
        </tr>
        <tr>
          <td class='weekdays-name'>Выходных дней</td>
          <td class='weekdays-value'>0</td>
        </tr>
        <tr>
          <td class='weeks-name'>Недель</td>
          <td class='weeks-value'>0</td>
        </tr>
        <tr>
          <td class='weeks rest' colspan='2'>
            и 
            <span class='days-value'>0</span>
            <span class='days-name'>дней</span>
          </td>
        </tr>
        <tr>
          <td class='months-name'>Месяцев</td>
          <td class='months-value'>0</td>
        </tr>
        <tr>
          <td class='months rest' colspan='2'>
            и
            <span class='weeks-value'>0</span>
            <span class='weeks-name'>недель</span>,
            <span class='days-value'>0</span>
            <span class='days-name'>дней</span>
          </td>
        </tr>
        <tr>
          <td class='years-name'>Лет</td>
          <td class='years-value'>0</td>
        </tr>
        <tr>
          <td class='years rest' colspan='2'>
            и
            <span class='months-value'>0</span>
            <span class='months-name'>месяцев</span>,
            <span class='weeks-value'>0</span>
            <span class='weeks-name'>недель</span>,
            <span class='days-value'>0</span>
            <span class='days-name'>дней</span>
          </td>
        </tr>
      `
    }
  }

  getValuesContainers() {
    return this.container.querySelectorAll('[class$="value"]');
  }

  computeValues() {
    const DAY = 86400000;

    let initFirst = firstCalendar.getChosenDate();
    let initLast = secondCalendar.getChosenDate();
    const initDifference = initFirst.getTime() - initLast.getTime();

    const computedValues = {
      days: 0,
      workdays: 0,
      weekdays: 0,
      weeks: {
        value: 0,
        restDays: 0
      },
      months: {
        value: 0,
        restWeeks: 0,
        restDays: 0
      },
      years: {
        value: 0,
        restMonths: 0,
        restWeeks: 0,
        restDays: 0
      }
    };

    if (initDifference >= -DAY && initDifference <= DAY) {
      this.container.innerHTML = this.getResultsHTML();
      return 'No range!';
    }

    if (initDifference > DAY) {
      [initFirst, initLast] = [initLast, initFirst];
    }

    // задаём промежуточный диапазон

    const first = new Date(initFirst.getTime());

    first.setDate(first.getDate() + 1);

    const second = new Date(initLast.getTime());

    second.setDate(second.getDate() - 1);

    // вычисляем разницу между датами промежуточного диапазона

    let difference = (Math.abs(first.getTime() - second.getTime()) + DAY) / DAY;

    computedValues.days = difference;

    // вычисляем количество недель и остаток дней

    const weeks = Math.floor(difference / 7);

    computedValues.weeks.value = weeks;

    computedValues.weeks.restDays = difference % 7;

    // смещаем даты к понедельнику первого числа и воскресенью последнего

    const padStart = first.getDay() - 1;

    first.setDate(first.getDate() - padStart);

    const padEnd = 7 - second.getDay();

    second.setDate(second.getDate() + padEnd);

    difference = (Math.abs(first.getTime() - second.getTime()) + DAY) / DAY;

    // вычисляем рабочие дни

    let workdays = difference / 7 * 5;

    if (padStart > 0) {
      workdays -= padStart;
    }

    if (padEnd > 2) {
      workdays -= (padEnd - 2);
    }

    computedValues.workdays = workdays;

    // вычисляем выходные дни

    let weekdays = difference / 7 * 2;

    if (padStart === 6) {
      --weekdays;
    }

    if (padEnd === 1) {
      --weekdays;
    } else {
      weekdays -= 2;
    }

    computedValues.weekdays = weekdays;

    // вычисляем количество полных месяцев, лет и остатки месяцев, недель, дней

    if (initFirst.getFullYear() !== initLast.getFullYear() || 
        initFirst.getMonth() !== initLast.getMonth()
    ) {
      let restDays;

      const endFirstMonth = new Date(
        initFirst.getFullYear(),
        initFirst.getMonth()+ 1,
        0
      ).getDate();

      const isFirstFull = initFirst.getDate() === endFirstMonth;

      const isLastFull = initLast.getDate() === 1;

      /**
        * если первый месяц не полный и последний полный,
        * то удалим первый, сохранив его дни
        */
      if (!isFirstFull && isLastFull) {
        restDays = endFirstMonth - initFirst.getDate();
        initFirst.setMonth(initFirst.getMonth() + 1);
      }

      /**
        * если первый месяц полный и последний не полный,
        * то удалим последний, сохранив его дни
        */
      if (isFirstFull && !isLastFull) {
        restDays = initLast.getDate();
        initLast.setMonth(initLast.getMonth() - 1);
      }

      /**
        * если оба месяца неполные, то проверим возможность дополнить
        * один месяц днями другого
        * после этого удалим их, сохранив дни
        */
      if (!isFirstFull && !isLastFull) {
        const daysFirstMonth = endFirstMonth - initFirst.getDate();

        const endLastMonth = new Date(
          initLast.getFullYear(),
          initLast.getMonth() + 1,
          0
        ).getDate();

        const daysLastMonth = initLast.getDate() - 1;

        const restFirstMonth = endFirstMonth - daysFirstMonth;

        const restLastMonth = endLastMonth - daysLastMonth;

        // проверим, можно ли занять дни у первого месяца для последнего
        if (restLastMonth <= daysFirstMonth) {
          // если получилось, сохраним остаток дней
          restDays = daysFirstMonth - restLastMonth;

          // добавим месяц в результат
          computedValues.months.value = 1;

          // удалим первый месяц
          initFirst.setMonth(initFirst.getMonth() + 1);

        // проверим, можно ли занять дни у последнего месяца для первого
        } else if (restFirstMonth <= daysLastMonth) {
          // если получилось, сохраним остаток дней
          restDays = daysLastMonth - restFirstMonth;

          // добавим месяц в результат
          computedValues.months.value = 1;

          // удалим последний месяц
          initLast.setMonth(initLast.getMonth() - 1);
        } else {
          // иначе сохраним дни для вычисления остатка
          restDays = (endFirstMonth - initFirst.getDate()) + initLast.getDate();
          initFirst.setMonth(initFirst.getMonth() + 1);
          initLast.setMonth(initLast.getMonth() - 1);
        }
      }

      const months = initLast.getMonth() - initFirst.getMonth() + 
                  12 * (initLast.getFullYear() - initFirst.getFullYear());

      computedValues.months.value += months;

      computedValues.months.restWeeks = Math.floor(restDays / 7);

      computedValues.months.restDays = restDays % 7;

      computedValues.years.value = Math.floor(months / 12);

      computedValues.years.restMonths = computedValues.months.value % 12;

      computedValues.years.restWeeks = computedValues.months.restWeeks;

      computedValues.years.restDays = computedValues.months.restDays;
    }

    return JSON.stringify(computedValues).split(/[^\d]+/).slice(1, -1);
  }

  updateValues() {
    const newValues = this.computeValues();

    if (newValues === 'No range!') {
      return;
    }

    const valuesContainers = this.getValuesContainers();

    for (let i = 0; i < newValues.length; i++) {
      valuesContainers[i].textContent = newValues[i];
      if (i === 4 || i === 6 || i === 9) {
        const restContainer = valuesContainers[i].closest('.rest');
        if (valuesContainers[i-1].textContent === '0') {
          restContainer.style.color = 'rgba(0, 0, 0, 0)';
        } else {
          restContainer.style.color = 'rgba(0, 0, 0)';
        }
      }
    }

    const namesContainers = this.container.querySelectorAll('[class$="name"]');

    for (let i = 0; i < valuesContainers.length; i++) {
      let value = valuesContainers[i].textContent;
      const name = namesContainers[i].textContent;

      if (this.language === 'en') {
        if (value === '1' && /s$/.test(name)) {
          const newName = name.substring(0, name.length - 1);
          namesContainers[i].textContent = newName;
        }

        if (value !== '1' && /[^s]$/.test(name)) {
          const newName = `${name}s`;
          namesContainers[i].textContent = newName;
        }
      }

      if (this.language === 'ru') {
        value = +value.slice(-2);

        if (i === 4 || i === 7 || i === 11) {
          if (value >= 5 || value === 0) {
            namesContainers[i].textContent = 'дней';
          } else if (value === 1) {
            namesContainers[i].textContent = 'день';
          } else {
            namesContainers[i].textContent = 'дня';
          }
        } else if (i === 6 || i === 10) {
          if (value === 0) {
            namesContainers[i].textContent = 'недель';
          } else if (value === 1) {
            namesContainers[i].textContent = 'неделя';
          } else {
            namesContainers[i].textContent = 'недели';
          }
        } else if (i === 9) {
          if (value >= 5 || value === 0) {
            namesContainers[i].textContent = 'месяцев';
          } else if (value === 1) {
            namesContainers[i].textContent = 'месяц';
          } else {
            namesContainers[i].textContent = 'месяца';
          }
        }
      }
    }
  }

  updateLanguage(language) {
    if (language === 'en' || language === 'ru') {
      const values = [];

      let valuesContainers = this.getValuesContainers();
      for (const value of valuesContainers) {
        values.push(value.textContent);
      }

      this.language = language;
      this.container.innerHTML = this.getResultsHTML();

      valuesContainers = this.getValuesContainers();
      for (let i = 0; i < values.length; i++) {
        valuesContainers[i].textContent = values[i];
      }
    }
  }
}

const language = navigator.language.substring(0, 2);
const languageSwitcher = document.querySelector('#language-switcher');
const links = languageSwitcher.querySelectorAll('a');
const title = document.querySelector('h1');

if (language === 'en') {
  title.textContent = 'Calendar calculator';
  links[0].classList.add('selected');
} else {
  title.textContent = 'Календарный калькулятор';
  links[1].classList.add('selected');
}

const firstCalendar = new Calendar({
  container: document.querySelector('#first-calendar'),
  date: new Date(),
  language: language
});

const secondCalendar = new Calendar({
  container: document.querySelector('#second-calendar'),
  date: new Date(),
  language: language
});

const results = new Results(language);

links[0].onclick = (event) => {
  const target = event.currentTarget;
  if (!target.classList.contains('selected')) {
    target.classList.add('selected');
    target.nextElementSibling.classList.remove('selected');
    firstCalendar.updateLanguage('en');
    secondCalendar.updateLanguage('en');
    results.updateLanguage('en');
    title.textContent = 'Calendar calculator';
  }
}

links[1].onclick = (event) => {
  const target = event.currentTarget;
  if (!target.classList.contains('selected')) {
    target.classList.add('selected');
    target.previousElementSibling.classList.remove('selected');
    firstCalendar.updateLanguage('ru');
    secondCalendar.updateLanguage('ru');
    results.updateLanguage('ru');
    title.textContent = 'Календарный калькулятор';
  }
}
