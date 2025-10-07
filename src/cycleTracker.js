export class CycleTracker {
  constructor() {
    this.phases = {
      menstruation: {
        name: 'Менструация',
        days: [1, 2, 3, 4, 5],
        description: 'Период кровотечения, организм очищается и восстанавливается'
      },
      follicular: {
        name: 'Фолликулярная фаза',
        days: [6, 7, 8, 9, 10, 11, 12, 13],
        description: 'Рост фолликула, повышение уровня эстрогена, рост энергии'
      },
      ovulation: {
        name: 'Овуляция',
        days: [14, 15, 16],
        description: 'Выход яйцеклетки, пик эстрогена, максимальная фертильность'
      },
      luteal: {
        name: 'Лютеиновая фаза',
        days: [17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
        description: 'Образование желтого тела, рост прогестерона, подготовка к возможной беременности'
      }
    };
  }

  getCycleDay(lastCycleDate) {
    // Преобразуем в объект Date, если это строка
    const cycleStartDate = new Date(lastCycleDate);
    
    // Проверяем, что дата валидна
    if (isNaN(cycleStartDate.getTime())) {
      console.error('Invalid date provided to getCycleDay:', lastCycleDate);
      return 1; // Возвращаем первый день цикла по умолчанию
    }
    
    const now = new Date();
    const diffTime = Math.abs(now - cycleStartDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Нормализуем день цикла (1-28)
    let cycleDay = diffDays % 28;
    if (cycleDay === 0) cycleDay = 28;
    
    return cycleDay;
  }

  getCyclePhase(cycleDay) {
    for (const [phaseName, phaseData] of Object.entries(this.phases)) {
      if (phaseData.days.includes(cycleDay)) {
        return {
          name: phaseData.name,
          description: phaseData.description,
          key: phaseName
        };
      }
    }
    
    // Fallback для дней вне стандартного цикла
    return {
      name: 'Переходная фаза',
      description: 'Переход между циклами',
      key: 'transition'
    };
  }

  getNextPhase(cycleDay) {
    const phases = Object.entries(this.phases);
    
    for (let i = 0; i < phases.length; i++) {
      const [phaseName, phaseData] = phases[i];
      if (phaseData.days.includes(cycleDay)) {
        // Возвращаем следующую фазу
        const nextPhaseIndex = (i + 1) % phases.length;
        const [nextPhaseName, nextPhaseData] = phases[nextPhaseIndex];
        
        return {
          name: nextPhaseData.name,
          description: nextPhaseData.description,
          daysUntil: nextPhaseData.days[0] - cycleDay
        };
      }
    }
    
    return null;
  }

  getNextPhaseInfo(cycleDay) {
    return this.getNextPhase(cycleDay);
  }

  getEnergyLevel(cycleDay) {
    const phase = this.getCyclePhase(cycleDay);
    
    switch (phase.key) {
      case 'menstruation':
        return { level: 'low', description: 'Пониженная энергия, организм восстанавливается' };
      case 'follicular':
        return { level: 'rising', description: 'Энергия постепенно повышается' };
      case 'ovulation':
        return { level: 'high', description: 'Максимальная энергия и активность' };
      case 'luteal':
        return { level: 'declining', description: 'Энергия постепенно снижается' };
      default:
        return { level: 'medium', description: 'Средний уровень энергии' };
    }
  }

  getHormoneLevels(cycleDay) {
    const phase = this.getCyclePhase(cycleDay);
    
    switch (phase.key) {
      case 'menstruation':
        return { estrogen: 'low', progesterone: 'low' };
      case 'follicular':
        return { estrogen: 'rising', progesterone: 'low' };
      case 'ovulation':
        return { estrogen: 'peak', progesterone: 'rising' };
      case 'luteal':
        return { estrogen: 'declining', progesterone: 'high' };
      default:
        return { estrogen: 'medium', progesterone: 'medium' };
    }
  }

  getSymptoms(cycleDay) {
    const phase = this.getCyclePhase(cycleDay);
    
    switch (phase.key) {
      case 'menstruation':
        return ['усталость', 'болезненные ощущения', 'перепады настроения'];
      case 'follicular':
        return ['повышенная энергия', 'хорошее настроение', 'улучшение кожи'];
      case 'ovulation':
        return ['пик энергии', 'повышенное либидо', 'возможны легкие спазмы'];
      case 'luteal':
        return ['перепады настроения', 'повышенный аппетит', 'нагрубание груди'];
      default:
        return ['общее недомогание'];
    }
  }
}
