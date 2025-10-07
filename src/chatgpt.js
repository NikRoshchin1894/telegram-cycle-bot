import OpenAI from 'openai';

export class ChatGptService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateRecommendations(cycleDay, phase) {
    try {
      const prompt = this.buildPrompt(cycleDay, phase);
      
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Ты - эксперт по женскому здоровью и питанию. Твоя задача - давать персонализированные рекомендации женщинам в зависимости от дня их менструального цикла. Отвечай на русском языке, будь дружелюбной и поддерживающей."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 800,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Ошибка при генерации рекомендаций:', error);
      return this.getFallbackRecommendations(cycleDay, phase);
    }
  }

  buildPrompt(cycleDay, phase) {
    return `
Сегодня ${cycleDay} день менструального цикла, фаза: ${phase.name} - ${phase.description}.

Создай персонализированные рекомендации для женщины на сегодня, разделенные на 3 блока:

🧠 УМСТВЕННАЯ НАГРУЗКА:
- Рекомендации по работе, учебе, концентрации
- Советы по управлению стрессом
- Психологическая поддержка

🏃‍♀️ СПОРТ И АКТИВНОСТЬ:
- Подходящие виды физической активности
- Интенсивность тренировок
- Упражнения для самочувствия

🥗 ПИТАНИЕ:
- Рекомендуемые продукты
- Что лучше исключить
- Особенности питания в эту фазу

Формат ответа должен быть структурированным и легко читаемым. Каждый блок должен содержать 2-3 конкретных рекомендации. Будь позитивной и поддерживающей, учитывай особенности гормонального фона в эту фазу цикла.
`;
  }

  getFallbackRecommendations(cycleDay, phase) {
    // Резервные рекомендации на случай недоступности ChatGPT
    const fallbackRecommendations = {
      menstruation: {
        mental: "Сегодня лучше сосредоточиться на легких задачах, избегать принятия важных решений. Отдых и медитация помогут восстановить силы.",
        sport: "Легкие прогулки, йога, растяжка. Избегайте интенсивных тренировок - дайте телу отдохнуть.",
        nutrition: "Употребляйте продукты богатые железом (мясо, шпинат), пейте больше воды. Исключите кофеин и алкоголь."
      },
      follicular: {
        mental: "Отличное время для новых проектов и изучения. Энергия растет, концентрация улучшается. Планируйте важные дела.",
        sport: "Постепенно увеличивайте интенсивность тренировок. Кардио, силовые упражнения, танцы - все подойдет.",
        nutrition: "Свежие овощи и фрукты, цельнозерновые продукты. Поддерживайте уровень белка для роста энергии."
      },
      ovulation: {
        mental: "Пик когнитивных способностей! Время для сложных задач, переговоров, творческих проектов.",
        sport: "Максимальная активность - пробежки, HIIT, командные виды спорта. Используйте высокую энергию.",
        nutrition: "Сбалансированное питание с акцентом на белки и углеводы. Пейте много воды."
      },
      luteal: {
        mental: "Сосредоточьтесь на завершении начатых дел. Избегайте стрессовых ситуаций, практикуйте релаксацию.",
        sport: "Умеренные нагрузки - плавание, йога, пилатес. Слушайте свое тело.",
        nutrition: "Сложные углеводы для стабилизации настроения, магний (орехи, темный шоколад). Ограничьте сахар."
      }
    };

    const recommendations = fallbackRecommendations[phase.key] || fallbackRecommendations.menstruation;

    return `
🧠 УМСТВЕННАЯ НАГРУЗКА:
${recommendations.mental}

🏃‍♀️ СПОРТ И АКТИВНОСТЬ:
${recommendations.sport}

🥗 ПИТАНИЕ:
${recommendations.nutrition}
`;
  }

  async generateCustomRecommendation(cycleDay, phase, specificRequest) {
    try {
      const prompt = `
Сегодня ${cycleDay} день менструального цикла, фаза: ${phase.name}.
Пользователь просит совет по теме: "${specificRequest}"

Дай конкретный и полезный совет, учитывая текущую фазу цикла и гормональный фон.
`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "Ты - эксперт по женскому здоровью. Отвечай на русском языке, будь дружелюбной и поддерживающей."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Ошибка при генерации кастомной рекомендации:', error);
      return "Извините, сейчас не могу дать персональный совет. Попробуйте позже.";
    }
  }
}
