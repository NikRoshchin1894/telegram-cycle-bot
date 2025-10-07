# 🚀 ДЕПЛОЙ НА RENDER - ГОТОВ К ЗАПУСКУ!

## ✅ Проект полностью подготовлен!

Все файлы созданы и настроены для деплоя на Render:
- ✅ `render.yaml` - конфигурация Render
- ✅ `Procfile` - команда запуска
- ✅ `package.json` - зависимости и скрипты
- ✅ `.gitignore` - исключение чувствительных данных
- ✅ Git репозиторий инициализирован

## 🎯 СЕЙЧАС ВЫПОЛНИТЕ ЭТИ 5 ШАГОВ:

### 1. 📝 GitHub (2 минуты)
1. Откройте [github.com](https://github.com)
2. Нажмите **"New repository"**
3. Название: `telegram-cycle-bot`
4. Сделайте **публичным**
5. НЕ ставьте галочки (код уже готов)
6. Нажмите **"Create repository"**

### 2. 🔗 Загрузите код на GitHub
```bash
# Замените YOUR_USERNAME на ваш GitHub username
git remote add origin https://github.com/YOUR_USERNAME/telegram-cycle-bot.git
git push -u origin main
```

### 3. 🌐 Render (3 минуты)
1. Откройте [render.com](https://render.com)
2. Нажмите **"Get Started for Free"**
3. Войдите через **"Login with GitHub"**
4. Нажмите **"New +"** → **"Web Service"**
5. Выберите **"Build and deploy from a Git repository"**
6. Найдите и выберите `telegram-cycle-bot`

### 4. ⚙️ Настройте сервис
- **Name**: `telegram-cycle-bot`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: оставьте пустым
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`

### 5. 🔑 Добавьте переменные окружения
В разделе **"Environment Variables"**:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_PATH=/opt/render/project/src/data/bot.db
TIMEZONE=Europe/Moscow
NOTIFICATION_TIME=09:00
NODE_ENV=production
```

## 🚀 ЗАПУСК ДЕПЛОЯ!

1. Нажмите **"Create Web Service"**
2. Дождитесь завершения сборки (2-3 минуты)
3. Проверьте логи в разделе **"Logs"**

### Ожидаемые логи:
```
🤖 Запуск бота...
✅ Подключение к базе данных установлено
✅ Таблица users создана
✅ Polling запущен
🤖 Бот запущен и готов к работе!
⏰ Ежедневные уведомления настроены на 09:00 (Europe/Moscow)
```

## 🧪 ТЕСТИРОВАНИЕ

1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Проверьте все функции:
   - Регистрация даты цикла
   - Календарь
   - Кнопка "Мой цикл"
   - Обновление цикла

## 🎉 ГОТОВО!

Ваш бот теперь:
- ✅ Работает 24/7 в облаке
- ✅ Автоматически перезапускается при сбоях
- ✅ Отправляет ежедневные уведомления
- ✅ Сохраняет данные пользователей
- ✅ Доступен из любой точки мира

## 💰 Стоимость: БЕСПЛАТНО!
- 750 часов в месяц бесплатно
- Для Telegram бота этого более чем достаточно

## 📞 Если что-то не работает:

1. **Проверьте логи** в Render Dashboard
2. **Убедитесь в правильности** переменных окружения
3. **Проверьте токены** в @BotFather и OpenAI
4. **Прочитайте подробную инструкцию**: `RENDER_DEPLOY_STEPS.md`

---

## 🚀 ВАШ БОТ ГОТОВ К ЗАПУСКУ В ОБЛАКЕ!

**Следуйте инструкциям выше и ваш Telegram бот будет работать профессионально 24/7! 🌟**
