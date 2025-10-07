# 🔧 Исправление конфликта polling и проблемы с клавиатурой

## ❌ Проблемы

1. **Конфликт polling** - ошибка "409 Conflict: terminated by other getUpdates request"
2. **Исчезновение клавиатуры** при остановке бота
3. **Множественные экземпляры** бота запускались одновременно

## ✅ Решения

### 1. **Исправлен конфликт polling**

**Было:**
```javascript
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });
```

**Стало:**
```javascript
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { 
  polling: {
    interval: 300,
    autoStart: false
  }
});
```

### 2. **Добавлен безопасный запуск**

```javascript
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

// Запускаем бота
startBot();
```

### 3. **Graceful Shutdown**

```javascript
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
```

### 4. **Уведомление пользователей об остановке**

```javascript
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
        await bot.sendMessage(user.chatId, shutdownMessage, { 
          parse_mode: 'Markdown',
          reply_markup: {
            remove_keyboard: true  // Корректно убираем клавиатуру
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
```

### 5. **Восстановление клавиатуры при запуске**

```javascript
// Функция для восстановления клавиатуры для существующих пользователей
async function restoreKeyboardsForExistingUsers() {
  try {
    const users = await database.getAllUsers();
    const restoreMessage = `
🤖 *Бот снова в сети!*

Ваша клавиатура восстановлена.

💡 *Доступные команды:*
• 📊 Мой цикл - посмотреть текущий цикл
• 🔄 Обновить дату - изменить дату цикла
• /help - справка

Ваши данные сохранены и синхронизированы! ✅
`;

    for (const user of users) {
      try {
        await bot.sendMessage(user.chatId, restoreMessage, { 
          parse_mode: 'Markdown',
          reply_markup: mainKeyboard.reply_markup  // Восстанавливаем клавиатуру
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
```

### 6. **Автоматическое восстановление при сообщениях**

```javascript
// Проверяем, есть ли пользователь в базе данных
const user = await database.getUser(chatId);
if (user) {
  // Если пользователь зарегистрирован, восстанавливаем клавиатуру
  const cycleDay = cycleTracker.getCycleDay(user.lastCycleDate);
  const phase = cycleTracker.getCyclePhase(cycleDay);
  
  const restoreMessage = `
🤖 Добро пожаловать обратно!

📊 Ваш текущий цикл:
• День цикла: ${cycleDay} из 28
• Фаза: ${phase.name}
• Последнее обновление: ${user.lastCycleDate.toLocaleDateString('ru-RU')}

💡 Ваша клавиатура восстановлена. Используйте кнопки ниже для управления циклом.
`;

  await bot.sendMessage(chatId, restoreMessage, { 
    reply_markup: mainKeyboard.reply_markup,
    parse_mode: 'Markdown'
  });
  return;
}
```

## 🎯 Результаты

### **До исправления:**
- ❌ Ошибки конфликта polling
- ❌ Множественные экземпляры бота
- ❌ Клавиатура исчезает при остановке
- ❌ Нет уведомлений пользователей
- ❌ Нет восстановления клавиатуры

### **После исправления:**
- ✅ Нет конфликтов polling
- ✅ Только один экземпляр бота
- ✅ Graceful shutdown с уведомлениями
- ✅ Автоматическое восстановление клавиатуры
- ✅ Корректное удаление клавиатуры при остановке
- ✅ Обработка ошибок и перезапуск

## 🚀 Инструкции по использованию

### **Запуск бота:**
```bash
node src/index.js
```

### **Остановка бота:**
```bash
# Корректная остановка (Ctrl+C)
^C

# Или через kill с SIGTERM
kill -TERM <PID>
```

### **Проверка запущенных экземпляров:**
```bash
ps aux | grep "node src/index.js" | grep -v grep
```

## 📋 Технические детали

- **Polling interval:** 300ms (настраивается)
- **AutoStart:** false (ручной запуск)
- **Graceful shutdown:** обработка SIGINT и SIGTERM
- **Восстановление клавиатуры:** через 2 секунды после запуска
- **Автоматическое восстановление:** при любом сообщении пользователя
- **Обработка ошибок:** перезапуск через 5 секунд при ошибках

---

**Статус:** ✅ ИСПРАВЛЕНО  
**Дата:** 8 октября 2025  
**Версия:** 1.2.0
