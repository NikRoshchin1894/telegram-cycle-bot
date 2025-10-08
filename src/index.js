import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import dotenv from 'dotenv';
import { Database } from './database.js';
import { ChatGptService } from './chatgpt.js';
import { CycleTracker } from './cycleTracker.js';
import { DatePicker } from './datePicker.js';

dotenv.config();

const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: false
  }
});

// Создаем клавиатуру с основными командами
const mainKeyboard = {
  reply_markup: {
    keyboard: [
      [{ text: '📊 Мой цикл' }, { text: '🔄 Обновить дату' }]
    ],
    resize_keyboard: true,
    one_time_keyboard: false
  }
};

// Создаем inline клавиатуру для быстрых действий
const inlineKeyboard = {
  reply_markup: {
    inline_keyboard: [
      [
        { text: '📊 Мой цикл', callback_data: 'mycycle' },
        { text: '🔄 Обновить дату', callback_data: 'updatecycle' }
      ]
    ]
  }
};
const database = new Database();
const chatGptService = new ChatGptService();
const cycleTracker = new CycleTracker();
const datePicker = new DatePicker();

// Состояние пользователей для отслеживания выбора даты
const userStates = new Map();

// Функция для показа главного меню выбора способа ввода даты
async function showDateSelectionMenu(chatId, isUpdate = false) {
  const title = isUpdate ? 'Обновление даты цикла' : 'Регистрация цикла';
  const description = isUpdate ? 'Выберите способ ввода новой даты:' : 'Выберите способ ввода даты начала цикла:';
  
  const message = `
📅 ${title}

${description}

🗓️ Сегодня: ${datePicker.formatFullDate(new Date())}

💡 Выберите удобный для вас способ:

📅 *Календарь* - визуальный выбор из календаря
✏️ *Ручной ввод* - введите дату в формате ДД.ММ.ГГГГ
`;

  const menuKeyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📅 Календарь', callback_data: 'select_calendar' },
          { text: '✏️ Ввести вручную', callback_data: 'select_manual' }
        ],
        [
          { text: '🔙 Назад', callback_data: 'back_to_menu' }
        ]
      ]
    }
  };
  
  await bot.sendMessage(chatId, message, { 
    reply_markup: menuKeyboard.reply_markup,
    parse_mode: 'Markdown'
  });
}

// Функция для показа календарного интерфейса
async function showCalendarInterface(chatId, isUpdate = false) {
  const title = isUpdate ? 'Обновление даты цикла' : 'Регистрация цикла';
  const description = isUpdate ? 'Выберите дату из календаря:' : 'Выберите дату из календаря:';
  
  const message = datePicker.createDateSelectionMessage(title, description);
  
  // Используем сохраненное состояние или текущую дату
  const userState = userStates.get(chatId) || {};
  const currentYear = userState.currentYear || new Date().getFullYear();
  const currentMonth = userState.currentMonth || new Date().getMonth();
  
  const calendar = datePicker.createCalendar(currentYear, currentMonth);
  
  await bot.sendMessage(chatId, message, calendar);
}

// Функция для показа интерфейса ручного ввода
async function showManualInputInterface(chatId, isUpdate = false) {
  const title = isUpdate ? 'Обновление даты цикла' : 'Регистрация цикла';
  
  const message = `
✏️ ${title}

Введите дату начала последнего цикла в формате *ДД.ММ.ГГГГ*

✅ *Примеры правильного формата:*
• 15.12.2024
• 1.1.2024  
• 28.02.2024
• 5.3.2024

❌ *Неправильные форматы:*
• 15/12/2024
• 2024-12-15
• 15 декабря 2024

💡 *Советы:*
• Используйте точки как разделители
• День и месяц можно писать с нулем или без
• Год пишите полностью (4 цифры)

⚠️ *Ограничения:*
• Дата не может быть в будущем
• Дата не может быть старше года (для точности расчета)
• Проверьте корректность даты

🗓️ Сегодня: ${datePicker.formatFullDate(new Date())}
`;

  const keyboard = {
    reply_markup: {
      inline_keyboard: [
        [
          { text: '📅 Календарь', callback_data: 'select_calendar' }
        ],
        [
          { text: '🔙 Назад к выбору способа', callback_data: 'back_to_method_selection' },
          { text: '🏠 Главное меню', callback_data: 'back_to_menu' }
        ]
      ]
    }
  };
  
  await bot.sendMessage(chatId, message, { 
    reply_markup: keyboard.reply_markup,
    parse_mode: 'Markdown'
  });
}

// Функция для обработки выбранной даты
async function handleDateSelection(chatId, dateStr, isUpdate = false) {
  try {
    const selectedDate = datePicker.parseDate(dateStr);
    const formattedDate = datePicker.formatFullDate(selectedDate);
    
    // Сохраняем пользователя и дату цикла
    await database.saveUser(chatId, selectedDate);
    
    const cycleDay = cycleTracker.getCycleDay(selectedDate);
    const phase = cycleTracker.getCyclePhase(cycleDay);
    const energyLevel = cycleTracker.getEnergyLevel(cycleDay);
    
    if (isUpdate) {
      const responseMessage = `
✅ Дата цикла успешно обновлена!

📊 Новая информация:
• День цикла: ${cycleDay} из 28
• Фаза: ${phase.name}
• Описание: ${phase.description}

📆 Дата начала цикла: ${formattedDate}
⏰ Уведомления: ${process.env.NOTIFICATION_TIME || '09:00'}

💡 Используйте /mycycle для просмотра полной информации о цикле
`;

      await bot.sendMessage(chatId, responseMessage, inlineKeyboard);
    } else {
      const responseMessage = `
✅ Отлично! Ваш цикл зарегистрирован.

📊 Текущая информация:
• День цикла: ${cycleDay} из 28
• Фаза: ${phase.name}
• Описание: ${phase.description}

📆 Дата начала цикла: ${formattedDate}
⏰ Уведомления: ${process.env.NOTIFICATION_TIME || '09:00'}

С завтрашнего дня вы будете получать ежедневные рекомендации!

💡 Используйте /mycycle для просмотра информации о цикле
`;

      await bot.sendMessage(chatId, responseMessage, mainKeyboard);
    }
    
    // Очищаем состояние пользователя
    userStates.delete(chatId);
    
  } catch (error) {
    console.error('Ошибка при сохранении данных:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при сохранении данных. Попробуйте еще раз.', inlineKeyboard);
  }
}

// Команды бота
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  
  // Проверяем, есть ли уже пользователь
  const existingUser = await database.getUser(chatId);
  
  if (existingUser) {
    // Если пользователь уже зарегистрирован, показываем основное меню
    const cycleDay = cycleTracker.getCycleDay(existingUser.lastCycleDate);
    const phase = cycleTracker.getCyclePhase(cycleDay);
    
    const welcomeMessage = `
🌸 Добро пожаловать обратно!

📊 Ваш текущий цикл:
• День цикла: ${cycleDay} из 28
• Фаза: ${phase.name}
• Последнее обновление: ${datePicker.formatFullDate(existingUser.updatedAt)}

💡 Используйте кнопки ниже или команды для управления циклом.
`;

    await bot.sendMessage(chatId, welcomeMessage, { 
      reply_markup: mainKeyboard.reply_markup,
      parse_mode: 'Markdown'
    });
  } else {
    // Если новый пользователь, показываем приветствие и выбор даты
    const welcomeMessage = `
🌸 Добро пожаловать в бот для отслеживания женского цикла!

Этот бот поможет вам:
• Отслеживать фазы вашего цикла
• Получать ежедневные рекомендации по питанию, спорту и умственной нагрузке
• Лучше понимать свое тело и самочувствие

📋 Доступные команды:
/mycycle - Показать текущее состояние цикла
/updatecycle - Изменить дату цикла
/help - Помощь

Для начала работы выберите дату начала последнего цикла:
`;

    await bot.sendMessage(chatId, welcomeMessage);
    
    // Показываем главное меню выбора способа ввода даты
    await showDateSelectionMenu(chatId);
  }
});

// Команда для просмотра текущего состояния цикла
bot.onText(/\/mycycle/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const user = await database.getUser(chatId);
    
    if (!user) {
      await bot.sendMessage(chatId, `❌ Вы еще не зарегистрированы в боте.\n\nОтправьте дату начала последнего цикла в формате ДД.ММ.ГГГГ для начала работы.`);
      return;
    }
    
    const cycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
    const phase = cycleTracker.getCyclePhase(cycleDay);
    const energyLevel = cycleTracker.getEnergyLevel(cycleDay);
    const nextPhase = cycleTracker.getNextPhaseInfo(cycleDay);
    
    const message = `
📊 Ваш текущий цикл:

📅 День цикла: ${cycleDay} из 28
🌙 Фаза: ${phase.name}
📝 Описание: ${phase.description}
🔮 Следующая фаза: ${nextPhase ? nextPhase.name : 'Начало нового цикла'}

📆 Последнее обновление: ${datePicker.formatFullDate(user.updatedAt)}
⏰ Уведомления: ${process.env.NOTIFICATION_TIME || '09:00'}

💡 Для изменения даты цикла используйте /updatecycle
`;

    await bot.sendMessage(chatId, message, inlineKeyboard);
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка при получении данных. Попробуйте позже.');
  }
});

// Команда для обновления даты цикла
bot.onText(/\/updatecycle/, async (msg) => {
  const chatId = msg.chat.id;
  
  try {
    const user = await database.getUser(chatId);
    
    if (!user) {
      await bot.sendMessage(chatId, `❌ Вы еще не зарегистрированы в боте.\n\nИспользуйте /start для начала работы.`);
      return;
    }
    
    const currentCycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
    const currentPhase = cycleTracker.getCyclePhase(currentCycleDay);
    
    const title = 'Обновление даты цикла';
    const description = `
📊 *Текущая информация:*
• День цикла: ${currentCycleDay}
• Фаза: ${currentPhase.name}
• Последнее обновление: ${datePicker.formatFullDate(user.updatedAt)}

⚠️ Это обновит весь расчет вашего цикла!

Выберите способ ввода новой даты:
`;
    
    const message = `
📅 ${title}

${description}

🗓️ Сегодня: ${datePicker.formatFullDate(new Date())}

💡 Выберите удобный для вас способ:

📅 *Календарь* - визуальный выбор из календаря
✏️ *Ручной ввод* - введите дату в формате ДД.ММ.ГГГГ
`;

    const menuKeyboard = {
      reply_markup: {
        inline_keyboard: [
          [
            { text: '📅 Календарь', callback_data: 'select_calendar' },
            { text: '✏️ Ввести вручную', callback_data: 'select_manual' }
          ],
          [
            { text: '🔙 Назад', callback_data: 'back_to_menu' }
          ]
        ]
      }
    };

    await bot.sendMessage(chatId, message, { 
      reply_markup: menuKeyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
    await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
  }
});

// Команда помощи
bot.onText(/\/help/, async (msg) => {
  const chatId = msg.chat.id;
  
  const helpMessage = `
🆘 Справка по командам бота:

📋 Основные команды:
/start - Начало работы с ботом
/mycycle - Показать текущее состояние цикла
/updatecycle - Изменить дату начала цикла
/help - Показать эту справку

📅 Формат дат:
Используйте формат ДД.ММ.ГГГГ
Примеры: 15.12.2024, 1.1.2024, 28.02.2024

⏰ Уведомления:
Ежедневно в ${process.env.NOTIFICATION_TIME || '09:00'} вы получаете рекомендации по:
• 🧠 Умственной нагрузке
• 🏃‍♀️ Спорту и активности
• 🥗 Питанию

🔄 Обновление цикла:
Используйте /updatecycle когда нужно обновить дату начала цикла

❓ Нужна помощь? Просто отправьте любую дату в правильном формате!
`;

  await bot.sendMessage(chatId, helpMessage, inlineKeyboard);
});

// Обработка кнопок клавиатуры
bot.onText(/^(📊 Мой цикл|🔄 Обновить дату)$/, async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Обрабатываем кнопки клавиатуры
  if (text === '📊 Мой цикл') {
    // Выполняем логику команды /mycycle напрямую
    try {
      const user = await database.getUser(chatId);
      
      if (!user) {
        await bot.sendMessage(chatId, '❌ Вы еще не зарегистрированы в боте.\n\nИспользуйте /start для начала работы.', inlineKeyboard);
        return;
      }
      
      const cycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
      const phase = cycleTracker.getCyclePhase(cycleDay);
      const energyLevel = cycleTracker.getEnergyLevel(cycleDay);
      const nextPhase = cycleTracker.getNextPhase(cycleDay);
      
      const message = `
📊 *Ваш текущий цикл:*

📅 *День цикла:* ${cycleDay} из 28
🌙 *Фаза:* ${phase.name}
📝 *Описание:* ${phase.description}
🔮 *Следующая фаза:* ${nextPhase ? nextPhase.name : 'Начало нового цикла'}

📆 *Последнее обновление:* ${datePicker.formatFullDate(user.updatedAt)}
⏰ *Уведомления:* ${process.env.NOTIFICATION_TIME || '09:00'}

💡 Для изменения даты цикла используйте /updatecycle
`;

      await bot.sendMessage(chatId, message, { 
        reply_markup: inlineKeyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      
    } catch (error) {
      console.error('Ошибка при получении информации о цикле:', error);
      await bot.sendMessage(chatId, '❌ Произошла ошибка при получении информации о цикле. Попробуйте позже.', inlineKeyboard);
    }
    return;
  }
  
  if (text === '🔄 Обновить дату') {
    // Выполняем логику команды /updatecycle напрямую
    try {
      const user = await database.getUser(chatId);
      
      if (!user) {
        await bot.sendMessage(chatId, `❌ Вы еще не зарегистрированы в боте.\n\nИспользуйте /start для начала работы.`);
        return;
      }
      
      const currentCycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
      const currentPhase = cycleTracker.getCyclePhase(currentCycleDay);
      
      const title = 'Обновление даты цикла';
      const description = `
📊 *Текущая информация:*
• День цикла: ${currentCycleDay}
• Фаза: ${currentPhase.name}
• Последнее обновление: ${datePicker.formatFullDate(user.updatedAt)}

⚠️ Это обновит весь расчет вашего цикла!

Выберите способ ввода новой даты:
`;
      
      const message = `
📅 ${title}

${description}

🗓️ Сегодня: ${datePicker.formatFullDate(new Date())}

💡 Выберите удобный для вас способ:

📅 *Календарь* - визуальный выбор из календаря
✏️ *Ручной ввод* - введите дату в формате ДД.ММ.ГГГГ
`;

      const menuKeyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '📅 Календарь', callback_data: 'select_calendar' },
              { text: '✏️ Ввести вручную', callback_data: 'select_manual' }
            ],
            [
              { text: '🔙 Назад', callback_data: 'back_to_menu' }
            ]
          ]
        }
      };

      await bot.sendMessage(chatId, message, { 
        reply_markup: menuKeyboard.reply_markup,
        parse_mode: 'Markdown'
      });
      
    } catch (error) {
      console.error('Ошибка при обновлении цикла:', error);
      await bot.sendMessage(chatId, '❌ Произошла ошибка при обновлении цикла. Попробуйте позже.');
    }
    return;
  }
  
});

// Обработка inline кнопок
bot.on('callback_query', async (callbackQuery) => {
  const message = callbackQuery.message;
  const chatId = message.chat.id;
  const data = callbackQuery.data;

  try {
    switch (data) {
      case 'mycycle':
        // Вызываем функцию показа цикла
        const user = await database.getUser(chatId);
        
        if (!user) {
          try {
            await bot.answerCallbackQuery(callbackQuery.id, { text: 'Сначала зарегистрируйтесь, отправив дату цикла!' });
          } catch (error) {
            console.error('Не удалось ответить на callback query:', error);
          }
          return;
        }
        
        const cycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
        const phase = cycleTracker.getCyclePhase(cycleDay);
        const energyLevel = cycleTracker.getEnergyLevel(cycleDay);
        const nextPhase = cycleTracker.getNextPhaseInfo(cycleDay);
        
        const message_text = `
📊 Ваш текущий цикл:

📅 День цикла: ${cycleDay} из 28
🌙 Фаза: ${phase.name}
📝 Описание: ${phase.description}
🔮 Следующая фаза: ${nextPhase ? nextPhase.name : 'Начало нового цикла'}

📆 Последнее обновление: ${datePicker.formatFullDate(user.updatedAt)}
⏰ Уведомления: ${process.env.NOTIFICATION_TIME || '09:00'}

💡 Для изменения даты цикла используйте /updatecycle
`;
        
        try {
          await bot.editMessageText(message_text, {
            chat_id: chatId,
            message_id: message.message_id,
            reply_markup: inlineKeyboard.reply_markup
          });
        } catch (editError) {
          console.error('Не удалось отредактировать сообщение:', editError);
          // Если не удалось отредактировать, отправляем новое сообщение
          await bot.sendMessage(chatId, message_text, { 
            reply_markup: inlineKeyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        }
        
        try {
          await bot.answerCallbackQuery(callbackQuery.id);
        } catch (error) {
          console.error('Не удалось ответить на callback query:', error);
        }
        break;
        
      case 'updatecycle':
        try {
          await bot.answerCallbackQuery(callbackQuery.id, { text: 'Показываем интерфейс обновления' });
        } catch (error) {
          console.error('Не удалось ответить на callback query:', error);
        }
        
        // Получаем информацию о пользователе
        try {
          const user = await database.getUser(chatId);
          
          if (!user) {
            await bot.sendMessage(chatId, `❌ Вы еще не зарегистрированы в боте.\n\nИспользуйте /start для начала работы.`);
            return;
          }
          
          const currentCycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
          const currentPhase = cycleTracker.getCyclePhase(currentCycleDay);
          
          const title = 'Обновление даты цикла';
          const description = `
📊 *Текущая информация:*
• День цикла: ${currentCycleDay}
• Фаза: ${currentPhase.name}
• Последнее обновление: ${datePicker.formatFullDate(user.updatedAt)}

⚠️ Это обновит весь расчет вашего цикла!

Выберите способ ввода новой даты:
`;
          
          const message = `
📅 ${title}

${description}

🗓️ Сегодня: ${datePicker.formatFullDate(new Date())}

💡 Выберите удобный для вас способ:

📅 *Календарь* - визуальный выбор из календаря
✏️ *Ручной ввод* - введите дату в формате ДД.ММ.ГГГГ
`;

          const menuKeyboard = {
            reply_markup: {
              inline_keyboard: [
                [
                  { text: '📅 Календарь', callback_data: 'select_calendar' },
                  { text: '✏️ Ввести вручную', callback_data: 'select_manual' }
                ],
                [
                  { text: '🔙 Назад', callback_data: 'back_to_menu' }
                ]
              ]
            }
          };

          // Сохраняем состояние, что это обновление
          userStates.set(chatId, { isUpdate: true });
          
          await bot.sendMessage(chatId, message, { 
            reply_markup: menuKeyboard.reply_markup,
            parse_mode: 'Markdown'
          });
        } catch (error) {
          console.error('Ошибка при получении данных пользователя:', error);
          await bot.sendMessage(chatId, '❌ Произошла ошибка. Попробуйте позже.');
        }
        break;
        
        
      case 'back_to_menu':
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Возврат в главное меню' });
        await bot.sendMessage(chatId, '🏠 Главное меню', mainKeyboard);
        break;
        
      case 'select_calendar':
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Показываем календарь' });
        
        // Сбрасываем состояние ручного ввода и устанавливаем текущий месяц/год
        const currentState = userStates.get(chatId) || {};
        const today = new Date();
        userStates.set(chatId, { 
          ...currentState, 
          manualInput: false,
          currentYear: today.getFullYear(),
          currentMonth: today.getMonth()
        });
        
        await showCalendarInterface(chatId, userStates.get(chatId)?.isUpdate || false);
        break;
        
      case 'select_manual':
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Показываем интерфейс ручного ввода' });
        
        // Устанавливаем состояние ручного ввода
        const manualState = userStates.get(chatId) || {};
        userStates.set(chatId, { ...manualState, manualInput: true });
        
        await showManualInputInterface(chatId, userStates.get(chatId)?.isUpdate || false);
        break;
        
      case 'back_to_method_selection':
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Возврат к выбору способа' });
        
        // Сбрасываем состояние ручного ввода
        const methodState = userStates.get(chatId) || {};
        userStates.set(chatId, { ...methodState, manualInput: false });
        
        await showDateSelectionMenu(chatId, userStates.get(chatId)?.isUpdate || false);
        break;
        
      case 'show_calendar':
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Показываем календарь' });
        const currentDate = new Date();
        const calendar = datePicker.createCalendar(currentDate.getFullYear(), currentDate.getMonth());
        const calendarMessage = datePicker.createDateSelectionMessage('Выберите дату', 'Выберите дату из календаря:');
        await bot.sendMessage(chatId, calendarMessage, calendar);
        break;
        
        
      case 'select_today':
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбрана сегодняшняя дата' });
        const todayDate = new Date();
        await handleDateSelection(chatId, todayDate.toISOString().split('T')[0], userStates.get(chatId)?.isUpdate || false);
        break;
        
      case 'select_yesterday':
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Выбрана вчерашняя дата' });
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        await handleDateSelection(chatId, yesterday.toISOString().split('T')[0], userStates.get(chatId)?.isUpdate || false);
        break;
        
      case 'ignore':
        // Игнорируем кнопки с callback_data 'ignore'
        await bot.answerCallbackQuery(callbackQuery.id, { text: 'Эта дата недоступна для выбора' });
        break;
        
      default:
        // Обработка выбора даты из календаря
        if (data.startsWith('select_date_')) {
          const dateStr = data.replace('select_date_', '');
          await bot.answerCallbackQuery(callbackQuery.id, { text: `Выбрана дата: ${datePicker.formatFullDate(datePicker.parseDate(dateStr))}` });
          await handleDateSelection(chatId, dateStr, userStates.get(chatId)?.isUpdate || false);
        }
        // Обработка навигации по месяцам в календаре
        else if (data === 'prev_month' || data === 'next_month') {
          const userState = userStates.get(chatId) || {};
          let currentYear = userState.currentYear || new Date().getFullYear();
          let currentMonth = userState.currentMonth || new Date().getMonth();
          
          if (data === 'prev_month') {
            currentMonth--;
            if (currentMonth < 0) {
              currentMonth = 11;
              currentYear--;
            }
          } else {
            currentMonth++;
            if (currentMonth > 11) {
              currentMonth = 0;
              currentYear++;
            }
          }
          
          // Обновляем состояние пользователя
          userStates.set(chatId, { 
            ...userState, 
            currentYear, 
            currentMonth 
          });
          
          await bot.answerCallbackQuery(callbackQuery.id, { text: `${datePicker.months[currentMonth]} ${currentYear}` });
          
          const newCalendar = datePicker.createCalendar(currentYear, currentMonth);
          const title = userState.isUpdate ? 'Обновление даты цикла' : 'Регистрация цикла';
          const description = userState.isUpdate ? 'Выберите дату из календаря:' : 'Выберите дату из календаря:';
          const calendarMessage = datePicker.createDateSelectionMessage(title, description);
          
          try {
            await bot.editMessageText(calendarMessage, {
              chat_id: chatId,
              message_id: message.message_id,
              reply_markup: newCalendar.reply_markup
            });
          } catch (error) {
            console.error('Ошибка при обновлении календаря:', error);
            // Если не удалось отредактировать сообщение, отправляем новое
            await bot.sendMessage(chatId, calendarMessage, newCalendar);
          }
        }
        break;
    }
  } catch (error) {
    console.error('Ошибка при обработке callback query:', error);
    
    // Проверяем, не истек ли callback query
    if (error.code === 'ETELEGRAM' && error.response && error.response.body) {
      const errorDescription = error.response.body.description;
      if (errorDescription && errorDescription.includes('query is too old')) {
        console.log('Callback query истек, игнорируем ошибку');
        return;
      }
    }
    
    try {
      await bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка. Попробуйте позже.' });
    } catch (answerError) {
      console.error('Не удалось ответить на callback query:', answerError);
    }
  }
});

// Обработка ввода даты цикла (отдельный обработчик)
bot.onText(/^(?!\/)(?!📊|🔄).*$/, async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  // Проверяем, не команда ли это и не кнопка ли это
  if (text.startsWith('/') || text === '📊 Мой цикл' || text === '🔄 Обновить дату') {
    return;
  }

  // Проверяем, есть ли пользователь в базе данных
  const user = await database.getUser(chatId);
  if (user) {
    // Если пользователь зарегистрирован, восстанавливаем клавиатуру
    const cycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
    const phase = cycleTracker.getCyclePhase(cycleDay);
    
    const restoreMessage = `
🤖 Клавиатура восстановлена!

📊 Ваш текущий цикл:
• День цикла: ${cycleDay} из 28
• Фаза: ${phase.name}
• Последнее обновление: ${datePicker.formatFullDate(user.updatedAt)}

💡 Используйте кнопки ниже для управления циклом.
`;

    await bot.sendMessage(chatId, restoreMessage, { 
      reply_markup: mainKeyboard.reply_markup,
      parse_mode: 'Markdown'
    });
    return;
  }

  // Проверяем, находимся ли мы в режиме ручного ввода
  const userState = userStates.get(chatId);
  if (!userState || !userState.manualInput) {
    // Если не в режиме ручного ввода, показываем подсказку
    const helpMessage = `
❓ Не понимаю команду.

💡 Доступные команды:
/start - начало работы
/mycycle - показать текущий цикл  
/updatecycle - изменить дату цикла
/help - справка

📅 Для ввода даты используйте команды выше.
`;

    await bot.sendMessage(chatId, helpMessage, inlineKeyboard);
    return;
  }

  // Проверяем формат даты
  const dateRegex = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
  const match = text.match(dateRegex);

  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]);
    const year = parseInt(match[3]);

    // Проверяем корректность даты
    const inputDate = new Date(year, month - 1, day);
    if (inputDate.getDate() !== day || inputDate.getMonth() !== month - 1 || inputDate.getFullYear() !== year) {
      await bot.sendMessage(chatId, '❌ Неверный формат даты. Попробуйте еще раз в формате ДД.ММ.ГГГГ\n\nПримеры: 15.12.2024, 1.1.2024, 28.02.2024');
      return;
    }

    // Проверяем, что дата не в будущем
    if (inputDate > new Date()) {
      await bot.sendMessage(chatId, '❌ Дата не может быть в будущем. Пожалуйста, введите дату начала последнего цикла.');
      return;
    }

    // Проверяем, что дата не слишком старая (более года назад)
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (inputDate < oneYearAgo) {
      await bot.sendMessage(chatId, '❌ Дата слишком старая. Пожалуйста, введите дату начала последнего цикла (не более года назад).');
      return;
    }

    try {
      // Проверяем, есть ли уже пользователь
      const existingUser = await database.getUser(chatId);
      const isUpdate = !!existingUser;
      
      // Сохраняем пользователя и дату цикла
      await database.saveUser(chatId, inputDate);
      
      const cycleDay = cycleTracker.getCycleDay(inputDate);
      const phase = cycleTracker.getCyclePhase(cycleDay);
      const energyLevel = cycleTracker.getEnergyLevel(cycleDay);
      
      if (isUpdate) {
        const responseMessage = `
✅ Дата цикла успешно обновлена!

📊 Новая информация:
• День цикла: ${cycleDay} из 28
• Фаза: ${phase.name}
• Описание: ${phase.description}

📆 Дата начала цикла: ${datePicker.formatFullDate(inputDate)}
⏰ Уведомления: ${process.env.NOTIFICATION_TIME || '09:00'}

💡 Используйте /mycycle для просмотра полной информации о цикле
`;

        await bot.sendMessage(chatId, responseMessage, inlineKeyboard);
      } else {
        const responseMessage = `
✅ Отлично! Ваш цикл зарегистрирован.

📊 Текущая информация:
• День цикла: ${cycleDay} из 28
• Фаза: ${phase.name}
• Описание: ${phase.description}

📆 Дата начала цикла: ${datePicker.formatFullDate(inputDate)}
⏰ Уведомления: ${process.env.NOTIFICATION_TIME || '09:00'}

С завтрашнего дня вы будете получать ежедневные рекомендации!

💡 Используйте /mycycle для просмотра информации о цикле
`;

        await bot.sendMessage(chatId, responseMessage, inlineKeyboard);
      }
    } catch (error) {
      console.error('Ошибка при сохранении данных:', error);
      await bot.sendMessage(chatId, '❌ Произошла ошибка при сохранении данных. Попробуйте еще раз.');
    }
  } else {
    // Показываем подсказку для неправильного формата
    const helpMessage = `
❌ Неверный формат даты.

📅 Используйте формат: ДД.ММ.ГГГГ

✅ Примеры правильных дат:
• 15.12.2024
• 1.1.2024
• 28.02.2024
• 5.3.2024

💡 Доступные команды:
/mycycle - показать текущий цикл
/updatecycle - изменить дату цикла
/help - справка
`;

    await bot.sendMessage(chatId, helpMessage, inlineKeyboard);
  }
});

// Функция отправки ежедневных рекомендаций
async function sendDailyRecommendations() {
  try {
    const users = await database.getAllUsers();
    
    for (const user of users) {
      const cycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
      const phase = cycleTracker.getCyclePhase(cycleDay);
      
      // Генерируем рекомендации через ChatGPT
      const recommendations = await chatGptService.generateRecommendations(cycleDay, phase);
      
      const message = `
🌸 Ежедневные рекомендации

📅 День цикла: ${cycleDay}
🌙 Фаза: ${phase.name}

${recommendations}

💡 Хорошего дня!
`;

      await bot.sendMessage(user.chatId, message);
    }
  } catch (error) {
    console.error('Ошибка при отправке ежедневных рекомендаций:', error);
  }
}

// Настройка cron для ежедневных уведомлений
const notificationTime = process.env.NOTIFICATION_TIME || '09:00';
const [hours, minutes] = notificationTime.split(':');

cron.schedule(`${minutes} ${hours} * * *`, sendDailyRecommendations, {
  timezone: process.env.TIMEZONE || 'Europe/Moscow'
});

// Функция для восстановления клавиатуры для существующих пользователей
async function restoreKeyboardsForExistingUsers() {
  try {
    const users = await database.getAllUsers();
    const restoreMessage = `
🤖 *Бот снова в сети!*

Ваша клавиатура восстановлена. Данные синхронизированы! ✅

💡 Используйте кнопки ниже для управления циклом.
`;

    for (const user of users) {
      try {
        await bot.sendMessage(user.chatId, restoreMessage, { 
          parse_mode: 'Markdown',
          reply_markup: mainKeyboard.reply_markup
        });
      } catch (error) {
        console.log(`Не удалось восстановить клавиатуру для пользователя ${user.chatId}:`, error.message);
      }
    }
    
    if (users.length > 0) {
      console.log(`✅ Клавиатуры восстановлены для ${users.length} пользователей`);
    }
  } catch (error) {
    console.error('❌ Ошибка при восстановлении клавиатур:', error);
  }
}

// Функция для безопасного запуска бота
async function startBot() {
  try {
    console.log('🤖 Запуск бота...');
    
    // Запускаем polling
    await bot.startPolling();
    console.log('✅ Polling запущен');
    
    console.log('🤖 Бот запущен и готов к работе!');
    console.log(`⏰ Ежедневные уведомления настроены на ${notificationTime} (${process.env.TIMEZONE || 'Europe/Moscow'})`);

    // Восстанавливаем клавиатуры для существующих пользователей
    setTimeout(restoreKeyboardsForExistingUsers, 2000);
    
  } catch (error) {
    console.error('❌ Ошибка при запуске бота:', error);
    
    if (error.code === 'ETELEGRAM' && error.response && error.response.body) {
      const errorDescription = error.response.body.description;
      if (errorDescription && errorDescription.includes('terminated by other getUpdates request')) {
        console.error('❌ Конфликт: другой экземпляр бота уже запущен!');
        console.error('💡 Остановите все другие экземпляры бота и попробуйте снова.');
        process.exit(1);
      }
    }
    
    console.error('🔄 Попытка перезапуска через 5 секунд...');
    setTimeout(startBot, 5000);
  }
}

// Добавляем простой веб-сервер для Render
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Простой health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Telegram Cycle Tracker Bot',
    uptime: process.uptime()
  });
});

// Запускаем веб-сервер
app.listen(port, () => {
  console.log(`🌐 Веб-сервер запущен на порту ${port}`);
});

// Запускаем бота
startBot();

// Обработка graceful shutdown
async function gracefulShutdown() {
  console.log('\n🛑 Получен сигнал остановки. Выполняется graceful shutdown...');
  
  try {
    // Уведомляем всех пользователей об остановке
    await notifyUsersAboutShutdown();
    
    // Останавливаем polling
    await bot.stopPolling();
    console.log('✅ Polling остановлен');
    
    // Закрываем базу данных
    await database.close();
    console.log('✅ База данных закрыта');
    
    console.log('✅ Бот корректно остановлен');
    process.exit(0);
  } catch (error) {
    console.error('❌ Ошибка при остановке бота:', error);
    process.exit(1);
  }
}

  // Функция для уведомления пользователей об остановке
  async function notifyUsersAboutShutdown() {
    try {
      const users = await database.getAllUsers();
      const shutdownMessage = `
🛑 *Бот временно недоступен*

Бот будет перезапущен в ближайшее время.

💡 *Для возобновления работы:*
• Отправьте /start после перезапуска
• Или просто напишите любое сообщение

📋 *Ваши данные сохранены и будут восстановлены автоматически.*

Приносим извинения за временные неудобства! 🙏
`;

      for (const user of users) {
        try {
          // Отправляем сообщение без кастомной клавиатуры
          await bot.sendMessage(user.chatId, shutdownMessage, {
            parse_mode: 'Markdown'
          });
          
          // Удаляем кастомную клавиатуру
          await bot.sendMessage(user.chatId, 'Клавиатура удалена. Используйте /start для возобновления работы.', {
            reply_markup: {
              remove_keyboard: true
            }
          });
        } catch (error) {
          console.log(`Не удалось уведомить пользователя ${user.chatId}:`, error.message);
        }
      }

      console.log(`✅ Уведомления отправлены ${users.length} пользователям`);
    } catch (error) {
      console.error('❌ Ошибка при уведомлении пользователей:', error);
    }
  }

// Обработка сигналов остановки
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанная ошибка:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение Promise:', reason);
  gracefulShutdown();
});
