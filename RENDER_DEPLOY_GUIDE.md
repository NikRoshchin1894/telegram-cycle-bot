# 🚀 Альтернативный деплой на Render

## 📋 Подготовка для Render

Проект готов для деплоя на Render! Создан файл `render.yaml` с конфигурацией.

## 🌐 Деплой на Render

### Шаг 1: Регистрация
1. Перейдите на [render.com](https://render.com)
2. Нажмите **"Get Started for Free"**
3. Войдите через GitHub

### Шаг 2: Создание Web Service
1. Нажмите **"New +"**
2. Выберите **"Web Service"**
3. Подключите ваш GitHub репозиторий

### Шаг 3: Настройка сервиса
- **Name**: `cycle-tracker-bot`
- **Environment**: `Node`
- **Branch**: `main`
- **Root Directory**: оставьте пустым
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`

### Шаг 4: Переменные окружения
В разделе **"Environment Variables"**:

```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_PATH=/opt/render/project/src/data/bot.db
TIMEZONE=Europe/Moscow
NOTIFICATION_TIME=09:00
NODE_ENV=production
```

### Шаг 5: Деплой
1. Нажмите **"Create Web Service"**
2. Дождитесь завершения сборки
3. Проверьте логи в разделе **"Logs"**

## 📊 Мониторинг

### Проверка логов:
1. В Render Dashboard → ваш сервис
2. Перейдите в **"Logs"**
3. Просматривайте логи в реальном времени

### Ожидаемые логи:
```
🤖 Запуск бота...
✅ Подключение к базе данных установлено
✅ Таблица users создана
✅ Polling запущен
🤖 Бот запущен и готов к работе!
```

## 💰 Стоимость Render

- **Бесплатный план**: 750 часов в месяц
- **Starter план**: $7/месяц (неограниченно)
- **Простой и понятный биллинг**

## 🆘 Устранение неполадок

### Автоматические перезапуски:
Render автоматически перезапускает сервис при сбоях.

### Проверка статуса:
- **Deploy Logs**: логи сборки
- **Runtime Logs**: логи работы приложения
- **Metrics**: метрики использования

## 🎯 Преимущества Render

- ✅ Простой интерфейс
- ✅ Автоматические SSL сертификаты
- ✅ Автоматические деплои из Git
- ✅ Встроенный мониторинг
- ✅ Бесплатный план для тестирования

## 🔄 Обновления

Render автоматически деплоит изменения при push в main ветку:
```bash
git add .
git commit -m "Update bot"
git push origin main
```

**Ваш бот будет обновлен автоматически! 🚀**
