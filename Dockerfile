# Используем официальный Node.js образ
FROM node:18-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm ci --only=production

# Копируем исходный код
COPY . .

# Создаем директорию для базы данных
RUN mkdir -p /opt/render/project/src/data

# Устанавливаем переменные окружения
ENV NODE_ENV=production
ENV DATABASE_PATH=/opt/render/project/src/data/bot.db

# Открываем порт (Render требует)
EXPOSE 3000

# Запускаем приложение
CMD ["node", "src/index.js"]
