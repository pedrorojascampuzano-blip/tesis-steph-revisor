// Simulador de tiempo para la tesis de Steph.
// Lógica pura. Sin DOM, sin localStorage, sin side effects.

const MS_PER_DAY = 24 * 60 * 60 * 1000;

function toDate(isoString) {
  return new Date(isoString + 'T12:00:00');
}

function addDays(isoString, n) {
  const d = toDate(isoString);
  d.setDate(d.getDate() + n);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

// Mapea getDay() (0=domingo..6=sábado) a índice mask (0=lunes..6=domingo).
function dayOfWeekIndex(date) {
  const js = date.getDay(); // 0..6 con 0=domingo
  return (js + 6) % 7; // 0=lunes, 6=domingo
}

function fmt(n) {
  return (Math.round(n * 10) / 10).toFixed(1);
}

export function daysBetween(fromISODate, toISODate) {
  const a = toDate(fromISODate);
  const b = toDate(toISODate);
  return Math.round((b - a) / MS_PER_DAY);
}

export function countActiveDaysInRange(fromISODate, toISODate, activeDaysMask) {
  const total = daysBetween(fromISODate, toISODate);
  if (total < 0) return 0;
  let count = 0;
  const start = toDate(fromISODate);
  for (let i = 0; i <= total; i++) {
    const d = new Date(start.getTime() + i * MS_PER_DAY);
    if (activeDaysMask[dayOfWeekIndex(d)]) count++;
  }
  return count;
}

export function availableHours({ today, deadline, hoursPerDay, activeDays }) {
  if (daysBetween(today, deadline) <= 0) return 0;
  // De hoy (exclusivo) hasta deadline (inclusive): trabajar desde mañana.
  const start = addDays(today, 1);
  const activeCount = countActiveDaysInRange(start, deadline, activeDays);
  return activeCount * hoursPerDay;
}

export function pendingHours(milestones) {
  let sum = 0;
  for (const m of milestones) {
    if (m.completed === true) continue;
    const progress = m.progress || 0;
    sum += m.defaultHours * (1 - progress);
  }
  return sum;
}

export function verdict({ available, needed }) {
  const marginHours = available - needed;
  if (marginHours < 0) {
    return {
      status: 'deficit',
      marginHours,
      message: `Te faltan ${fmt(-marginHours)} h.`
    };
  }
  if (marginHours > 0.2 * needed) {
    return {
      status: 'ok',
      marginHours,
      message: `Te alcanza con margen. Sobran ${fmt(marginHours)} h.`
    };
  }
  return {
    status: 'tight',
    marginHours,
    message: `Te alcanza apenas. Margen ${fmt(marginHours)} h, sin colchón.`
  };
}

export function suggestAdjustments({ today, deadline, hoursPerDay, activeDays, needed }) {
  const currentAvailable = availableHours({ today, deadline, hoursPerDay, activeDays });
  if (currentAvailable >= needed) {
    return { enough: true };
  }

  // extendDays: menor N tal que availableHours(deadline + N) >= needed.
  let extendDays = 0;
  const MAX_EXTEND = 3650; // 10 años de cap por seguridad
  while (extendDays < MAX_EXTEND) {
    extendDays++;
    const newDeadline = addDays(deadline, extendDays);
    const av = availableHours({ today, deadline: newDeadline, hoursPerDay, activeDays });
    if (av >= needed) break;
  }

  // raiseHours: nuevo hoursPerDay (redondeado a 0.25h arriba) que cubre needed.
  const start = addDays(today, 1);
  const activeCount = countActiveDaysInRange(start, deadline, activeDays);
  let raiseHours;
  if (activeCount === 0) {
    raiseHours = null;
  } else {
    const raw = needed / activeCount;
    raiseHours = Math.ceil(raw / 0.25) * 0.25;
  }

  // addActiveDay: día inactivo con mejor return = el que más se repite en el rango restante.
  let addActiveDay = null;
  const allActive = activeDays.every(Boolean);
  if (!allActive) {
    const counts = [0, 0, 0, 0, 0, 0, 0];
    const total = daysBetween(start, deadline);
    if (total >= 0) {
      const s = toDate(start);
      for (let i = 0; i <= total; i++) {
        const d = new Date(s.getTime() + i * MS_PER_DAY);
        counts[dayOfWeekIndex(d)]++;
      }
    }
    let best = -1;
    let bestCount = -1;
    for (let i = 0; i < 7; i++) {
      if (!activeDays[i] && counts[i] > bestCount) {
        bestCount = counts[i];
        best = i;
      }
    }
    addActiveDay = best >= 0 ? best : null;
  }

  return { enough: false, extendDays, raiseHours, addActiveDay };
}

export function dailyTargetMinutes({ today, deadline, hoursPerDay, activeDays, pendingHrs }) {
  const todayDate = toDate(today);
  const todayIdx = dayOfWeekIndex(todayDate);
  const todayIsActive = !!activeDays[todayIdx];

  if (!todayIsActive) return 0;
  if (daysBetween(today, deadline) <= 0) return 0;

  // Hoy inclusive si es active day.
  const activeRemaining = countActiveDaysInRange(today, deadline, activeDays);
  if (activeRemaining <= 0) return 0;

  const minutes = (pendingHrs * 60) / activeRemaining;
  return Math.round(minutes);
}

export function progressFraction(milestones) {
  let done = 0;
  let total = 0;
  for (const m of milestones) {
    total += m.defaultHours;
    if (m.completed === true) {
      done += m.defaultHours;
    } else {
      done += m.defaultHours * (m.progress || 0);
    }
  }
  if (total === 0) return 0;
  return done / total;
}

/*
Ejemplos de uso (NO ejecutar):

1) verdict({ available: 20, needed: 15 })
   -> { status: 'ok', marginHours: 5, message: 'Te alcanza con margen. Sobran 5.0 h.' }

2) verdict({ available: 16, needed: 15 })
   -> { status: 'tight', marginHours: 1, message: 'Te alcanza apenas. Margen 1.0 h, sin colchón.' }

3) availableHours({ today: '2026-05-23', deadline: '2026-06-15', hoursPerDay: 2, activeDays: [true,true,true,true,true,false,false] })
   -> calcula días activos en el rango (de mañana hasta deadline inclusive) y multiplica por 2.
*/
