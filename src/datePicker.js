export class DatePicker {
  constructor() {
    this.months = [
      'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
      'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];
    
    this.weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  }

  /**
   * Создает inline клавиатуру с календарем
   * @param {number} year - год
   * @param {number} month - месяц (0-11)
   * @param {Date} selectedDate - выбранная дата (опционально)
   * @returns {Object} объект клавиатуры
   */
  createCalendar(year, month, selectedDate = null) {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1));
    
    const keyboard = [];
    
    // Заголовок с месяцем и годом
    keyboard.push([
      { text: '◀️', callback_data: `prev_month` },
      { text: `${this.months[month]} ${year}`, callback_data: 'ignore' },
      { text: '▶️', callback_data: `next_month` }
    ]);
    
    // Дни недели
    const weekRow = this.weekDays.map(day => ({ text: day, callback_data: 'ignore' }));
    keyboard.push(weekRow);
    
    // Календарные дни
    let currentDate = new Date(startDate);
    for (let week = 0; week < 6; week++) {
      const weekRow = [];
      
      for (let day = 0; day < 7; day++) {
        const dateStr = currentDate.toISOString().split('T')[0];
        const dayNumber = currentDate.getDate();
        const isCurrentMonth = currentDate.getMonth() === month;
        const isToday = this.isToday(currentDate);
        const isSelected = selectedDate && this.isSameDate(currentDate, selectedDate);
        const isFuture = currentDate > new Date();
        const isTooOld = this.isTooOld(currentDate);
        
        let buttonText = dayNumber.toString();
        let callbackData = 'ignore';
        
        if (!isFuture && !isTooOld) {
          callbackData = `select_date_${dateStr}`;
          
          if (isToday) {
            buttonText = `📍${dayNumber}`;
          } else if (isSelected) {
            buttonText = `✅${dayNumber}`;
          } else if (isCurrentMonth) {
            buttonText = dayNumber.toString();
          } else {
            buttonText = `⚪${dayNumber}`;
          }
        } else if (isFuture) {
          buttonText = `🚫${dayNumber}`;
        } else if (isTooOld) {
          buttonText = `⏰${dayNumber}`;
        } else {
          buttonText = `⚪${dayNumber}`;
        }
        
        weekRow.push({ text: buttonText, callback_data: callbackData });
        currentDate.setDate(currentDate.getDate() + 1);
      }
      
      keyboard.push(weekRow);
    }
    
    // Кнопки быстрого выбора
    keyboard.push([
      { text: '📅 Сегодня', callback_data: 'select_today' },
      { text: '📅 Вчера', callback_data: 'select_yesterday' }
    ]);
    
    // Кнопки навигации
    keyboard.push([
      { text: '🔙 Назад к выбору способа', callback_data: 'back_to_method_selection' },
      { text: '✏️ Ввести вручную', callback_data: 'select_manual' }
    ]);
    
    return {
      reply_markup: {
        inline_keyboard: keyboard
      }
    };
  }

  /**
   * Создает клавиатуру для быстрого выбора дат
   * @returns {Object} объект клавиатуры
   */
  createQuickDatePicker() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const quickDates = [];
    
    // Генерируем быстрые даты для последних 7 дней
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      if (i === 0) {
        quickDates.push({ text: `📍 Сегодня (${this.formatDate(date)})`, callback_data: `select_date_${date.toISOString().split('T')[0]}` });
      } else if (i === 1) {
        quickDates.push({ text: `📅 Вчера (${this.formatDate(date)})`, callback_data: `select_date_${date.toISOString().split('T')[0]}` });
      } else {
        quickDates.push({ text: `${this.formatDate(date)}`, callback_data: `select_date_${date.toISOString().split('T')[0]}` });
      }
    }
    
    // Разбиваем на строки по 2 кнопки
    const keyboard = [];
    for (let i = 0; i < quickDates.length; i += 2) {
      const row = quickDates.slice(i, i + 2);
      if (row.length === 1) {
        row.push({ text: '📅 Календарь', callback_data: 'show_calendar' });
      }
      keyboard.push(row);
    }
    
    keyboard.push([
      { text: '📅 Полный календарь', callback_data: 'show_calendar' },
      { text: '✏️ Ввести вручную', callback_data: 'manual_input' }
    ]);
    
    keyboard.push([
      { text: '🔙 Назад', callback_data: 'back_to_menu' }
    ]);
    
    return {
      reply_markup: {
        inline_keyboard: keyboard
      }
    };
  }

  /**
   * Форматирует дату для отображения
   * @param {Date} date - дата
   * @returns {string} отформатированная дата
   */
  formatDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  }

  /**
   * Форматирует дату для полного отображения
   * @param {Date} date - дата
   * @returns {string} отформатированная дата
   */
  formatFullDate(date) {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  /**
   * Проверяет, является ли дата сегодняшней
   * @param {Date} date - дата для проверки
   * @returns {boolean} true если дата сегодняшняя
   */
  isToday(date) {
    const today = new Date();
    return this.isSameDate(date, today);
  }

  /**
   * Проверяет, являются ли две даты одинаковыми
   * @param {Date} date1 - первая дата
   * @param {Date} date2 - вторая дата
   * @returns {boolean} true если даты одинаковые
   */
  isSameDate(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  /**
   * Проверяет, является ли дата слишком старой (более года назад)
   * @param {Date} date - дата для проверки
   * @returns {boolean} true если дата слишком старая
   */
  isTooOld(date) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return date < oneYearAgo;
  }

  /**
   * Парсит дату из строки формата YYYY-MM-DD
   * @param {string} dateStr - строка даты
   * @returns {Date} объект даты
   */
  parseDate(dateStr) {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  /**
   * Создает клавиатуру для выбора месяца и года
   * @returns {Object} объект клавиатуры
   */
  createMonthYearPicker() {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    
    const keyboard = [];
    
    // Годы
    const years = [];
    for (let year = currentYear - 1; year <= currentYear; year++) {
      years.push({ text: year.toString(), callback_data: `select_year_${year}` });
    }
    keyboard.push(years);
    
    // Месяцы
    const months = [];
    for (let i = 0; i < 12; i++) {
      const monthName = this.months[i];
      const isCurrent = i === currentMonth;
      months.push({ 
        text: isCurrent ? `📍${monthName}` : monthName, 
        callback_data: `select_month_${i}` 
      });
    }
    
    // Разбиваем месяцы на строки по 3
    for (let i = 0; i < months.length; i += 3) {
      keyboard.push(months.slice(i, i + 3));
    }
    
    keyboard.push([
      { text: '🔙 Назад', callback_data: 'back_to_menu' }
    ]);
    
    return {
      reply_markup: {
        inline_keyboard: keyboard
      }
    };
  }

  /**
   * Создает красивое сообщение для выбора даты
   * @param {string} title - заголовок
   * @param {string} description - описание
   * @returns {string} текст сообщения
   */
  createDateSelectionMessage(title = 'Выберите дату', description = '') {
    const today = new Date();
    const formattedToday = this.formatFullDate(today);
    
    return `
📅 ${title}

${description}

🗓️ Сегодня: ${formattedToday}

💡 Выберите дату начала последнего цикла:
• 📍 - сегодня
• 📅 - вчера  
• ✅ - выбранная дата
• 🚫 - будущая дата (недоступна)
• ⏰ - слишком старая дата (более года)
• ⚪ - другой месяц (доступно для выбора)
`;
  }
}
