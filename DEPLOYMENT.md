# 🚀 Развертывание бота на Railway

## 📋 Подготовка к деплою

### 1. Установка Railway CLI

```bash
# Установка через npm
npm install -g @railway/cli

# Или через Homebrew (macOS)
brew install railway
```

### 2. Авторизация в Railway

```bash
railway login
```

### 3. Создание проекта

```bash
# Переходим в папку проекта
cd telegram-bot

# Инициализируем Railway проект
railway init
```

## 🔧 Настройка переменных окружения

### Необходимые переменные:

```bash
# Telegram Bot Token (получите от @BotFather)
railway variables set TELEGRAM_BOT_TOKEN=your_bot_token_here

# OpenAI API Key
railway variables set OPENAI_API_KEY=your_openai_api_key_here

# Database path (для Railway)
railway variables set DATABASE_PATH=/tmp/bot.db

# Timezone for notifications
railway variables set TIMEZONE=Europe/Moscow

# Notification time (24h format)
railway variables set NOTIFICATION_TIME=09:00
```

## 🚀 Деплой

### 1. Автоматический деплой

```bash
# Деплой на Railway
railway up
```

### 2. Проверка статуса

```bash
# Проверка статуса деплоя
railway status

# Просмотр логов
railway logs
```

## 📊 Мониторинг

### Просмотр логов в реальном времени:

```bash
railway logs --follow
```

### Проверка метрик:

```bash
railway metrics
```

## 🔄 Обновление

Для обновления бота:

```bash
# Pull последних изменений
git pull origin main

# Деплой обновлений
railway up
```

## 🛡️ Безопасность

### 1. Переменные окружения
- ✅ Все чувствительные данные в переменных окружения
- ✅ `.env` файл исключен из Git
- ✅ Переменные шифруются на Railway

### 2. База данных
- ✅ SQLite файл создается автоматически
- ✅ Данные сохраняются между деплоями
- ✅ Автоматические бэкапы

## 📱 Проверка работы

После деплоя:

1. **Найдите бота в Telegram** по имени
2. **Отправьте `/start`** для регистрации
3. **Проверьте все функции**:
   - Календарь
   - Обновление цикла
   - Ежедневные уведомления

## 🆘 Устранение неполадок

### Бот не отвечает:
```bash
# Проверьте логи
railway logs

# Проверьте переменные
railway variables
```

### Ошибки подключения:
```bash
# Перезапустите сервис
railway restart
```

### Проблемы с базой данных:
```bash
# Проверьте права доступа
railway shell
ls -la /tmp/
```

## 💰 Стоимость

Railway предоставляет:
- **Бесплатный план**: 500 часов в месяц
- **Pro план**: $5/месяц за неограниченное время
- **Плата за использование**: $0.10 за GB-RAM час

Для Telegram бота обычно достаточно бесплатного плана.

## 🔗 Полезные ссылки

- [Railway Documentation](https://docs.railway.app/)
- [Railway CLI Reference](https://docs.railway.app/reference/cli)
- [Telegram Bot API](https://core.telegram.org/bots/api)
- [OpenAI API Documentation](https://platform.openai.com/docs)
