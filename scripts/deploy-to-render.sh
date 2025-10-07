#!/bin/bash

# 🚀 Скрипт для деплоя бота на Render
# Этот скрипт поможет подготовить проект для деплоя

echo "🚀 Подготовка к деплою на Render..."

# Проверяем, что мы в правильной директории
if [ ! -f "package.json" ]; then
    echo "❌ Ошибка: package.json не найден. Запустите скрипт из корневой папки проекта."
    exit 1
fi

# Проверяем Git статус
echo "📋 Проверка Git статуса..."
if ! git status > /dev/null 2>&1; then
    echo "❌ Ошибка: Git репозиторий не инициализирован."
    exit 1
fi

# Проверяем, что все изменения закоммичены
if ! git diff --quiet || ! git diff --cached --quiet; then
    echo "⚠️  Внимание: Есть незакоммиченные изменения."
    echo "Запустите: git add . && git commit -m 'Prepare for deployment'"
    exit 1
fi

echo "✅ Git репозиторий готов."

# Проверяем наличие необходимых файлов
echo "📁 Проверка файлов для деплоя..."

required_files=("package.json" "Procfile" "render.yaml" ".gitignore")
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Ошибка: Файл $file не найден."
        exit 1
    fi
done

echo "✅ Все необходимые файлы присутствуют."

# Показываем инструкции
echo ""
echo "🎯 Следующие шаги для деплоя на Render:"
echo ""
echo "1. 📝 Создайте репозиторий на GitHub:"
echo "   - Перейдите на github.com"
echo "   - Нажмите 'New repository'"
echo "   - Название: telegram-cycle-bot"
echo "   - Сделайте публичным"
echo ""
echo "2. 🔗 Подключите удаленный репозиторий:"
echo "   git remote add origin https://github.com/YOUR_USERNAME/telegram-cycle-bot.git"
echo "   git push -u origin main"
echo ""
echo "3. 🌐 Создайте проект на Render:"
echo "   - Перейдите на render.com"
echo "   - Войдите через GitHub"
echo "   - Создайте Web Service"
echo "   - Подключите ваш репозиторий"
echo ""
echo "4. 🔧 Настройте переменные окружения:"
echo "   TELEGRAM_BOT_TOKEN=your_bot_token_here"
echo "   OPENAI_API_KEY=your_openai_api_key_here"
echo "   DATABASE_PATH=/opt/render/project/src/data/bot.db"
echo "   TIMEZONE=Europe/Moscow"
echo "   NOTIFICATION_TIME=09:00"
echo "   NODE_ENV=production"
echo ""
echo "5. 🚀 Запустите деплой и протестируйте бота!"
echo ""
echo "📖 Подробные инструкции в файле: RENDER_DEPLOY_STEPS.md"
echo ""
echo "✅ Проект готов к деплою на Render!"
