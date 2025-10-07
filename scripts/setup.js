#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

console.log('🔧 Настройка Telegram бота для отслеживания женского цикла...\n');

// Создание .env файла если его нет
const envPath = '.env';
const envExamplePath = 'env.example';

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Создан файл .env из env.example');
  } else {
    const envContent = `# Telegram Bot Token (получите от @BotFather)
TELEGRAM_BOT_TOKEN=your_bot_token_here

# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Database path
DATABASE_PATH=./data/bot.db

# Timezone for notifications (по умолчанию Europe/Moscow)
TIMEZONE=Europe/Moscow

# Notification time (24h format, например: 09:00)
NOTIFICATION_TIME=09:00
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Создан файл .env');
  }
  console.log('⚠️  Не забудьте заполнить токены в файле .env!\n');
} else {
  console.log('✅ Файл .env уже существует\n');
}

// Создание папки для данных
const dataDir = 'data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
  console.log('✅ Создана папка data для базы данных');
} else {
  console.log('✅ Папка data уже существует');
}

console.log('\n🎉 Настройка завершена!');
console.log('\n📋 Следующие шаги:');
console.log('1. Получите токен бота от @BotFather в Telegram');
console.log('2. Получите API ключ OpenAI на platform.openai.com');
console.log('3. Заполните эти данные в файле .env');
console.log('4. Запустите бота: npm start\n');

console.log('📚 Подробные инструкции в README.md');
