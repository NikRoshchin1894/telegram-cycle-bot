#!/bin/bash

# 🔧 Скрипт для исправления ошибки Dockerfile

echo "🔍 Диагностика проблемы с Dockerfile..."

# Проверяем локальные файлы
echo "📁 Проверка локальных файлов:"
if [ -f "Dockerfile" ]; then
    echo "✅ Dockerfile найден локально"
else
    echo "❌ Dockerfile НЕ найден локально"
    exit 1
fi

if [ -f ".dockerignore" ]; then
    echo "✅ .dockerignore найден локально"
else
    echo "❌ .dockerignore НЕ найден локально"
fi

# Проверяем Git статус
echo ""
echo "📋 Проверка Git статуса:"
if git status --porcelain | grep -q "Dockerfile"; then
    echo "⚠️  Dockerfile не закоммичен!"
    echo "Выполните: git add Dockerfile && git commit -m 'Add Dockerfile'"
    exit 1
else
    echo "✅ Dockerfile закоммичен"
fi

# Проверяем удаленный репозиторий
echo ""
echo "🔗 Проверка удаленного репозитория:"
if git remote -v | grep -q "origin"; then
    echo "✅ Удаленный репозиторий настроен:"
    git remote -v
else
    echo "❌ Удаленный репозиторий НЕ настроен!"
    echo ""
    echo "🎯 РЕШЕНИЕ:"
    echo "1. Создайте репозиторий на github.com"
    echo "2. Выполните команды:"
    echo "   git remote add origin https://github.com/YOUR_USERNAME/telegram-cycle-bot.git"
    echo "   git push -u origin main"
    exit 1
fi

# Проверяем, загружен ли код на GitHub
echo ""
echo "🌐 Проверка загрузки на GitHub:"
if git ls-remote origin main | grep -q "$(git rev-parse HEAD)"; then
    echo "✅ Код загружен на GitHub"
else
    echo "❌ Код НЕ загружен на GitHub!"
    echo ""
    echo "🎯 РЕШЕНИЕ:"
    echo "Выполните: git push -u origin main"
    exit 1
fi

echo ""
echo "🎉 Все проверки пройдены!"
echo ""
echo "📋 Если ошибка Dockerfile все еще возникает:"
echo "1. Проверьте настройки в Render:"
echo "   - Environment: Docker"
echo "   - Dockerfile Path: ./Dockerfile"
echo "2. Перезапустите деплой в Render"
echo "3. Проверьте логи сборки"
echo ""
echo "✅ Проблема должна быть решена!"
