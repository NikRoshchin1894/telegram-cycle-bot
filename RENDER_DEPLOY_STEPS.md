# 🚀 Пошаговый деплой на Render

## 📋 Шаг 1: Создание GitHub репозитория

### 1.1 Перейдите на GitHub
1. Откройте [github.com](https://github.com)
2. Нажмите **"New repository"** (зеленая кнопка)
3. Заполните данные:
   - **Repository name**: `telegram-cycle-bot`
   - **Description**: `Telegram bot for women's cycle tracking with daily recommendations`
   - **Visibility**: Public (для бесплатного Render)
   - **Initialize**: НЕ ставьте галочки (у нас уже есть код)

### 1.2 Загрузите код на GitHub
В терминале выполните:

```bash
# Добавьте удаленный репозиторий (замените YOUR_USERNAME на ваш GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/telegram-cycle-bot.git

# Загрузите код на GitHub
git push -u origin main
```

## 🌐 Шаг 2: Создание проекта на Render

### 2.1 Регистрация на Render
1. Перейдите на [render.com](https://render.com)
2. Нажмите **"Get Started for Free"**
3. Войдите через **"Login with GitHub"**
4. Авторизуйте доступ Render к вашему аккаунту

### 2.2 Создание Web Service
1. Нажмите **"New +"** в Dashboard
2. Выберите **"Web Service"**
3. Подключите ваш репозиторий:
   - Выберите **"Build and deploy from a Git repository"**
   - Найдите и выберите `telegram-cycle-bot`

### 2.3 Настройка сервиса
Заполните форму:

- **Name**: `telegram-cycle-bot`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: оставьте пустым
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`

## 🔧 Шаг 3: Настройка переменных окружения

В разделе **"Environment Variables"** добавьте:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_PATH=/opt/render/project/src/data/bot.db
TIMEZONE=Europe/Moscow
NOTIFICATION_TIME=09:00
NODE_ENV=production
```

### Как получить токены:

#### Telegram Bot Token:
1. Найдите [@BotFather](https://t.me/BotFather) в Telegram
2. Отправьте `/newbot` или `/mybots`
3. Выберите вашего бота
4. Скопируйте токен

#### OpenAI API Key:
1. Перейдите на [platform.openai.com](https://platform.openai.com)
2. Войдите в аккаунт
3. Перейдите в **API Keys**
4. Создайте новый ключ

## 🚀 Шаг 4: Деплой

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

## 🧪 Шаг 5: Тестирование

### 5.1 Проверка работы бота:
1. Найдите вашего бота в Telegram
2. Отправьте `/start`
3. Проверьте все функции:
   - Регистрация даты цикла
   - Календарь
   - Кнопка "Мой цикл"
   - Обновление цикла

### 5.2 Проверка логов:
1. В Render Dashboard → ваш сервис
2. Перейдите в **"Logs"**
3. Убедитесь, что нет ошибок

## 📊 Мониторинг

### Просмотр логов:
- **Deploy Logs**: логи процесса сборки
- **Runtime Logs**: логи работы приложения
- **Metrics**: метрики использования ресурсов

### Автоматические обновления:
Render автоматически деплоит изменения при push в main ветку:
```bash
git add .
git commit -m "Update bot"
git push origin main
```

## 🛡️ Безопасность

### ✅ Что защищено:
- Все API ключи в переменных окружения
- SSL сертификаты автоматически
- Данные в зашифрованной базе данных
- Автоматические бэкапы

### 🔒 Переменные окружения:
- `TELEGRAM_BOT_TOKEN` - токен бота
- `OPENAI_API_KEY` - ключ OpenAI
- `DATABASE_PATH` - путь к базе данных
- `TIMEZONE` - часовой пояс
- `NOTIFICATION_TIME` - время уведомлений
- `NODE_ENV` - режим production

## 💰 Стоимость

- **Бесплатный план**: 750 часов в месяц
- **Starter план**: $7/месяц (неограниченно)
- **Для Telegram бота обычно хватает бесплатного плана!**

## 🆘 Устранение неполадок

### Бот не отвечает:
1. Проверьте логи в Render Dashboard
2. Убедитесь, что все переменные окружения установлены
3. Проверьте токен бота в @BotFather

### Ошибки сборки:
1. Проверьте `package.json` на корректность
2. Убедитесь, что Node.js версия >= 18
3. Проверьте логи сборки

### Проблемы с базой данных:
1. Убедитесь, что `DATABASE_PATH=/opt/render/project/src/data/bot.db`
2. Проверьте права доступа к папке

## 🎉 Результат

После успешного деплоя ваш бот будет:
- ✅ Работать 24/7 на облачном сервере Render
- ✅ Автоматически перезапускаться при сбоях
- ✅ Отправлять ежедневные уведомления в 09:00
- ✅ Сохранять данные пользователей в облачной БД
- ✅ Быть доступным из любой точки мира
- ✅ Автоматически обновляться при изменениях в коде

**Ваш Telegram бот теперь работает в облаке! 🌟**
