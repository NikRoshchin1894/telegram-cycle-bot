# 🔧 Исправление проблемы с исчезновением клавиатуры при остановке бота

## ❌ Проблема

При остановке Telegram бота клавиатура (reply keyboard) исчезает у пользователей, и кнопка "Start" пропадает. Это происходит потому, что:

1. **Telegram автоматически удаляет клавиатуру** при остановке бота
2. **Нет graceful shutdown** - бот останавливается резко без уведомления пользователей
3. **Нет восстановления клавиатуры** при перезапуске для существующих пользователей

## ✅ Решение

### 1. **Добавлен Graceful Shutdown**

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

### 2. **Уведомление пользователей об остановке**

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
            remove_keyboard: true  // Убираем клавиатуру корректно
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

### 3. **Восстановление клавиатуры при запуске**

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

### 4. **Автоматическое восстановление при любом сообщении**

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

### 5. **Обработка сигналов остановки**

```javascript
// Обработка сигналов остановки
process.on('SIGINT', gracefulShutdown);    // Ctrl+C
process.on('SIGTERM', gracefulShutdown);   // Системное завершение

// Обработка необработанных ошибок
process.on('uncaughtException', (error) => {
  console.error('❌ Необработанная ошибка:', error);
  gracefulShutdown();
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Необработанное отклонение Promise:', reason);
  gracefulShutdown();
});
```

## 🎯 Результат

### **До исправления:**
- ❌ Клавиатура исчезает при остановке бота
- ❌ Пользователи теряют доступ к кнопкам
- ❌ Нужно заново отправлять /start
- ❌ Нет уведомлений об остановке

### **После исправления:**
- ✅ Graceful shutdown с уведомлением пользователей
- ✅ Автоматическое восстановление клавиатуры при запуске
- ✅ Восстановление клавиатуры при любом сообщении пользователя
- ✅ Корректное удаление клавиатуры при остановке
- ✅ Обработка всех сигналов остановки
- ✅ Защита от необработанных ошибок

## 🚀 Инструкции по использованию

### **Для остановки бота:**
```bash
# Корректная остановка (Ctrl+C)
^C

# Или через kill с SIGTERM
kill -TERM <PID>
```

### **Для перезапуска:**
```bash
# Бот автоматически восстановит клавиатуры для всех пользователей
node src/index.js
```

### **Для пользователей:**
1. При остановке бота они получат уведомление
2. При перезапуске клавиатура восстановится автоматически
3. При отправке любого сообщения клавиатура восстановится
4. Команда /start всегда показывает актуальную клавиатуру

## 📋 Технические детали

- **Graceful shutdown** обрабатывает SIGINT и SIGTERM
- **Уведомления отправляются всем пользователям** из базы данных
- **Клавиатуры восстанавливаются через 2 секунды** после запуска
- **Автоматическое восстановление** при любом сообщении зарегистрированного пользователя
- **Обработка ошибок** при отправке уведомлений

---

**Статус:** ✅ ИСПРАВЛЕНО  
**Дата:** 8 октября 2025  
**Версия:** 1.1.0
