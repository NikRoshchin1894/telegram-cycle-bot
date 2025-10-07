#!/usr/bin/env python3
"""
Скрипт для создания аватарок для Telegram бота отслеживания женского цикла
"""

from PIL import Image, ImageDraw, ImageFont
import math
import os

def create_cycle_avatar():
    """Создает аватарку с изображением цикла и женскими символами"""
    
    # Создаем изображение 512x512 пикселей
    size = 512
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    # Центр изображения
    center = size // 2
    
    # Градиентный фон
    for i in range(size):
        for j in range(size):
            # Создаем градиент от розового к фиолетовому
            distance = math.sqrt((i - center)**2 + (j - center)**2)
            if distance < center:
                ratio = distance / center
                r = int(255 - ratio * 100)  # От 255 до 155
                g = int(182 - ratio * 100)  # От 182 до 82
                b = int(193 - ratio * 50)   # От 193 до 143
                img.putpixel((i, j), (r, g, b, 255))
    
    # Рисуем круг цикла (28 дней)
    cycle_radius = 180
    day_angle = 2 * math.pi / 28
    
    for day in range(28):
        # Определяем фазу и цвет
        if day < 5:  # Менструация
            color = (220, 53, 69)  # Красный
            size_dot = 12
        elif day < 13:  # Фолликулярная фаза
            color = (255, 193, 7)  # Желтый
            size_dot = 10
        elif day < 16:  # Овуляция
            color = (40, 167, 69)  # Зеленый
            size_dot = 16
        else:  # Лютеиновая фаза
            color = (108, 117, 125)  # Серый
            size_dot = 10
        
        # Позиция точки
        angle = day * day_angle - math.pi / 2  # Начинаем сверху
        x = center + cycle_radius * math.cos(angle)
        y = center + cycle_radius * math.sin(angle)
        
        # Рисуем точку
        draw.ellipse([x - size_dot//2, y - size_dot//2, x + size_dot//2, y + size_dot//2], 
                    fill=color, outline=(255, 255, 255, 255), width=2)
    
    # Добавляем символ женского пола в центре
    female_symbol_radius = 60
    draw.ellipse([center - female_symbol_radius, center - female_symbol_radius, 
                  center + female_symbol_radius, center + female_symbol_radius], 
                outline=(255, 255, 255, 255), width=8)
    
    # Крест снизу
    cross_size = 40
    draw.line([center, center + female_symbol_radius - 10, 
               center, center + female_symbol_radius + cross_size], 
              fill=(255, 255, 255, 255), width=8)
    draw.line([center - cross_size//2, center + female_symbol_radius + cross_size//2, 
               center + cross_size//2, center + female_symbol_radius + cross_size//2], 
              fill=(255, 255, 255, 255), width=8)
    
    # Добавляем декоративные элементы
    # Луна и звезды вокруг
    moon_radius = 25
    moon_x = center - 200
    moon_y = center - 150
    draw.ellipse([moon_x - moon_radius, moon_y - moon_radius, 
                  moon_x + moon_radius, moon_y + moon_radius], 
                fill=(255, 255, 255, 200))
    
    # Звезды
    stars = [(center + 150, center - 120, 8), (center + 180, center + 100, 6), 
             (center - 150, center + 80, 10)]
    for star_x, star_y, star_size in stars:
        draw.ellipse([star_x - star_size, star_y - star_size, 
                      star_x + star_size, star_y + star_size], 
                    fill=(255, 255, 255, 180))
    
    return img

def create_minimalist_avatar():
    """Создает минималистичную аватарку"""
    
    size = 512
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Градиентный фон от розового к фиолетовому
    for i in range(size):
        for j in range(size):
            distance = math.sqrt((i - center)**2 + (j - center)**2)
            if distance < center:
                ratio = distance / center
                r = int(255 - ratio * 80)
                g = int(182 - ratio * 80)
                b = int(193 - ratio * 40)
                img.putpixel((i, j), (r, g, b, 255))
    
    # Большой круг с точками цикла
    cycle_radius = 200
    for day in range(28):
        angle = day * (2 * math.pi / 28) - math.pi / 2
        
        if day < 5:
            color = (255, 255, 255, 255)
            size_dot = 8
        elif day < 13:
            color = (255, 255, 255, 200)
            size_dot = 6
        elif day < 16:
            color = (255, 255, 255, 255)
            size_dot = 12
        else:
            color = (255, 255, 255, 150)
            size_dot = 6
        
        x = center + cycle_radius * math.cos(angle)
        y = center + cycle_radius * math.sin(angle)
        
        draw.ellipse([x - size_dot//2, y - size_dot//2, x + size_dot//2, y + size_dot//2], 
                    fill=color)
    
    # Символ в центре - стилизованный цветок
    flower_center = center
    petal_count = 6
    petal_radius = 40
    
    for i in range(petal_count):
        angle = i * (2 * math.pi / petal_count)
        petal_x = flower_center + petal_radius * math.cos(angle)
        petal_y = flower_center + petal_radius * math.sin(angle)
        
        draw.ellipse([petal_x - 15, petal_y - 15, petal_x + 15, petal_y + 15], 
                    fill=(255, 255, 255, 255))
    
    # Центр цветка
    draw.ellipse([flower_center - 20, flower_center - 20, 
                  flower_center + 20, flower_center + 20], 
                fill=(255, 182, 193, 255))
    
    return img

def create_modern_avatar():
    """Создает современную аватарку с геометрическими элементами"""
    
    size = 512
    img = Image.new('RGBA', (size, size), (255, 255, 255, 0))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Современный градиент
    for i in range(size):
        for j in range(size):
            distance = math.sqrt((i - center)**2 + (j - center)**2)
            if distance < center:
                ratio = distance / center
                # Современная палитра
                r = int(255 - ratio * 60)
                g = int(105 + ratio * 80)  # От 105 до 185
                b = int(180 + ratio * 50)  # От 180 до 230
                img.putpixel((i, j), (r, g, b, 255))
    
    # Геометрические элементы цикла
    cycle_radius = 180
    for day in range(28):
        angle = day * (2 * math.pi / 28) - math.pi / 2
        
        # Разные формы для разных фаз
        if day < 5:  # Менструация - треугольники
            color = (255, 255, 255, 255)
            x = center + cycle_radius * math.cos(angle)
            y = center + cycle_radius * math.sin(angle)
            # Рисуем треугольник
            points = [(x, y - 8), (x - 8, y + 6), (x + 8, y + 6)]
            draw.polygon(points, fill=color)
            
        elif day < 13:  # Фолликулярная - квадраты
            color = (255, 255, 255, 220)
            x = center + cycle_radius * math.cos(angle)
            y = center + cycle_radius * math.sin(angle)
            draw.rectangle([x - 6, y - 6, x + 6, y + 6], fill=color)
            
        elif day < 16:  # Овуляция - большие круги
            color = (255, 255, 255, 255)
            x = center + cycle_radius * math.cos(angle)
            y = center + cycle_radius * math.sin(angle)
            draw.ellipse([x - 10, y - 10, x + 10, y + 10], fill=color)
            
        else:  # Лютеиновая - ромбы
            color = (255, 255, 255, 180)
            x = center + cycle_radius * math.cos(angle)
            y = center + cycle_radius * math.sin(angle)
            points = [(x, y - 6), (x - 6, y), (x, y + 6), (x + 6, y)]
            draw.polygon(points, fill=color)
    
    # Центральный элемент - стилизованная диаграмма
    inner_radius = 80
    for i in range(4):
        angle = i * (math.pi / 2)
        x = center + inner_radius * math.cos(angle)
        y = center + inner_radius * math.sin(angle)
        draw.ellipse([x - 20, y - 20, x + 20, y + 20], 
                    fill=(255, 255, 255, 200))
    
    # Центр
    draw.ellipse([center - 25, center - 25, center + 25, center + 25], 
                fill=(255, 255, 255, 255))
    
    return img

def main():
    """Создает все варианты аватарок"""
    
    # Создаем папку для аватарок
    os.makedirs('avatars', exist_ok=True)
    
    print("🎨 Создаю аватарки для бота...")
    
    # Создаем разные варианты
    avatars = [
        ('cycle_detailed', create_cycle_avatar, 'Подробная аватарка с циклом'),
        ('minimalist', create_minimalist_avatar, 'Минималистичная аватарка'),
        ('modern', create_modern_avatar, 'Современная геометрическая')
    ]
    
    for name, func, description in avatars:
        try:
            img = func()
            # Сохраняем в разных форматах
            img.save(f'avatars/{name}.png')
            # Конвертируем в RGB для JPEG
            rgb_img = Image.new('RGB', img.size, (255, 255, 255))
            rgb_img.paste(img, mask=img.split()[-1])
            rgb_img.save(f'avatars/{name}.jpg', 'JPEG', quality=95)
            print(f"✅ {description} - сохранена как {name}.png и {name}.jpg")
        except Exception as e:
            print(f"❌ Ошибка при создании {name}: {e}")
    
    print("\n🎉 Все аватарки созданы!")
    print("📁 Файлы сохранены в папке avatars/")
    print("\n💡 Для установки аватарки бота:")
    print("1. Откройте @BotFather в Telegram")
    print("2. Отправьте /setuserpic")
    print("3. Выберите вашего бота")
    print("4. Загрузите одну из созданных аватарок")

if __name__ == "__main__":
    main()
