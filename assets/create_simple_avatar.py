#!/usr/bin/env python3
"""
Создает простую и красивую аватарку для Telegram бота
Оптимизирована для размеров Telegram (512x512)
"""

from PIL import Image, ImageDraw, ImageFont
import math

def create_simple_avatar():
    """Создает простую, но красивую аватарку"""
    
    # Размер для Telegram
    size = 512
    img = Image.new('RGB', (size, size), (255, 182, 193))  # Розовый фон
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Создаем градиентный фон
    for i in range(size):
        for j in range(size):
            distance = math.sqrt((i - center)**2 + (j - center)**2)
            if distance < center:
                ratio = distance / center
                # Градиент от розового к фиолетовому
                r = int(255 - ratio * 80)
                g = int(182 - ratio * 80) 
                b = int(193 + ratio * 40)
                
                # Ограничиваем значения
                r = max(0, min(255, r))
                g = max(0, min(255, g))
                b = max(0, min(255, b))
                
                img.putpixel((i, j), (r, g, b))
    
    # Рисуем круг цикла
    cycle_radius = 180
    for day in range(28):
        angle = day * (2 * math.pi / 28) - math.pi / 2
        
        # Определяем фазу и цвет точки
        if day < 5:  # Менструация
            color = (255, 255, 255)  # Белый
            size_dot = 8
        elif day < 13:  # Фолликулярная
            color = (255, 255, 255)  # Белый
            size_dot = 6
        elif day < 16:  # Овуляция - самая важная
            color = (255, 255, 255)  # Белый
            size_dot = 12
        else:  # Лютеиновая
            color = (255, 255, 255)  # Белый
            size_dot = 6
        
        x = center + cycle_radius * math.cos(angle)
        y = center + cycle_radius * math.sin(angle)
        
        # Рисуем точку с обводкой
        draw.ellipse([x - size_dot//2 - 1, y - size_dot//2 - 1, 
                      x + size_dot//2 + 1, y + size_dot//2 + 1], 
                    fill=(100, 100, 100))  # Темная обводка
        draw.ellipse([x - size_dot//2, y - size_dot//2, 
                      x + size_dot//2, y + size_dot//2], 
                    fill=color)
    
    # Центральный символ - стилизованный цветок/звезда
    inner_radius = 60
    
    # Рисуем 8 лепестков/лучей
    for i in range(8):
        angle = i * (math.pi / 4)
        
        # Внешняя точка
        outer_x = center + inner_radius * math.cos(angle)
        outer_y = center + inner_radius * math.sin(angle)
        
        # Внутренняя точка
        inner_x = center + (inner_radius * 0.5) * math.cos(angle)
        inner_y = center + (inner_radius * 0.5) * math.sin(angle)
        
        # Рисуем лепесток как эллипс
        draw.ellipse([outer_x - 15, outer_y - 8, outer_x + 15, outer_y + 8], 
                    fill=(255, 255, 255, 255))
    
    # Центральный круг
    draw.ellipse([center - 25, center - 25, center + 25, center + 25], 
                fill=(255, 255, 255, 255))
    
    # Добавляем небольшие декоративные элементы
    # Луна в углу
    moon_x = center - 180
    moon_y = center - 180
    draw.ellipse([moon_x - 20, moon_y - 20, moon_x + 20, moon_y + 20], 
                fill=(255, 255, 255, 200))
    
    # Несколько маленьких звезд
    stars = [(center + 160, center - 140, 5), (center + 180, center + 120, 4), 
             (center - 160, center + 100, 6), (center - 180, center - 100, 4)]
    
    for star_x, star_y, star_size in stars:
        draw.ellipse([star_x - star_size, star_y - star_size, 
                      star_x + star_size, star_y + star_size], 
                    fill=(255, 255, 255, 180))
    
    return img

def create_emoji_style_avatar():
    """Создает аватарку в стиле эмодзи"""
    
    size = 512
    img = Image.new('RGB', (size, size), (255, 182, 193))
    draw = ImageDraw.Draw(img)
    
    center = size // 2
    
    # Простой градиент
    for i in range(size):
        for j in range(size):
            distance = math.sqrt((i - center)**2 + (j - center)**2)
            if distance < center:
                ratio = distance / center
                r = int(255 - ratio * 60)
                g = int(182 - ratio * 60)
                b = int(193 + ratio * 30)
                
                r = max(0, min(255, r))
                g = max(0, min(255, g))
                b = max(0, min(255, b))
                
                img.putpixel((i, j), (r, g, b))
    
    # Большой центральный символ - стилизованное сердце/цветок
    heart_size = 120
    
    # Рисуем стилизованное сердце
    # Верхняя часть - два круга
    left_circle = (center - heart_size//3, center - heart_size//2)
    right_circle = (center + heart_size//3, center - heart_size//2)
    
    draw.ellipse([left_circle[0] - heart_size//4, left_circle[1] - heart_size//4,
                  left_circle[0] + heart_size//4, left_circle[1] + heart_size//4], 
                fill=(255, 255, 255))
    
    draw.ellipse([right_circle[0] - heart_size//4, right_circle[1] - heart_size//4,
                  right_circle[0] + heart_size//4, right_circle[1] + heart_size//4], 
                fill=(255, 255, 255))
    
    # Нижняя часть - треугольник
    triangle_points = [
        (center - heart_size//2, center - heart_size//4),
        (center + heart_size//2, center - heart_size//4),
        (center, center + heart_size//2)
    ]
    draw.polygon(triangle_points, fill=(255, 255, 255))
    
    # Маленькие точки вокруг
    for i in range(12):
        angle = i * (math.pi / 6)
        x = center + 160 * math.cos(angle)
        y = center + 160 * math.sin(angle)
        draw.ellipse([x - 4, y - 4, x + 4, y + 4], fill=(255, 255, 255))
    
    return img

def main():
    """Создает простые аватарки"""
    
    print("🎨 Создаю простые аватарки для Telegram...")
    
    avatars = [
        ('simple', create_simple_avatar, 'Простая аватарка с циклом'),
        ('emoji_style', create_emoji_style_avatar, 'Стиль эмодзи')
    ]
    
    for name, func, description in avatars:
        try:
            img = func()
            img.save(f'avatars/{name}.png')
            img.save(f'avatars/{name}.jpg', 'JPEG', quality=95)
            print(f"✅ {description} - сохранена как {name}.png и {name}.jpg")
        except Exception as e:
            print(f"❌ Ошибка при создании {name}: {e}")
    
    print("\n🎉 Простые аватарки созданы!")
    print("📁 Рекомендуется использовать simple.png или emoji_style.png")

if __name__ == "__main__":
    main()
