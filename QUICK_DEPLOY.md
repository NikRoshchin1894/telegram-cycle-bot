# ⚡ Быстрый деплой на Render

## 🎯 Готово к деплою! Следуйте этим шагам:

### 1. 📝 GitHub (2 минуты)
```bash
# Создайте репозиторий на github.com с именем "telegram-cycle-bot"
# Затем выполните:
git remote add origin https://github.com/YOUR_USERNAME/telegram-cycle-bot.git
git push -u origin main
```

### 2. 🌐 Render (3 минуты)
1. Перейдите на [render.com](https://render.com)
2. **Login with GitHub**
3. **New +** → **Web Service**
4. Подключите ваш репозиторий `telegram-cycle-bot`

### 3. ⚙️ Настройки Render
- **Name**: `telegram-cycle-bot`
- **Environment**: `Node`
- **Branch**: `main`
- **Build Command**: `npm install`
- **Start Command**: `node src/index.js`

### 4. 🔑 Переменные окружения
```bash
TELEGRAM_BOT_TOKEN=your_bot_token_here
OPENAI_API_KEY=your_openai_api_key_here
DATABASE_PATH=/opt/render/project/src/data/bot.db
TIMEZONE=Europe/Moscow
NOTIFICATION_TIME=09:00
NODE_ENV=production
```

### 5. 🚀 Деплой!
Нажмите **"Create Web Service"** и ждите 2-3 минуты.

## ✅ Проверка
1. Найдите бота в Telegram
2. Отправьте `/start`
3. Протестируйте все функции

## 🎉 Готово!
Ваш бот работает 24/7 в облаке! 🌟

---
📖 **Подробная инструкция**: `RENDER_DEPLOY_STEPS.md`
