// Coach daily mode: XP + streak + persistencia localStorage
// Tesis Steph revisor. ES6 modules, cero deps externas.

export const STORAGE_KEY = "tesis-coach-state-v1";

function hasLocalStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

export function loadState() {
  if (!hasLocalStorage()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    return null;
  }
}

export function saveState(state) {
  if (!hasLocalStorage()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    // quota exceeded u otro error: degradar silenciosamente
  }
}

export function defaultState() {
  return {
    setup: {
      deadline: null,
      hoursPerDay: 1.0,
      activeDays: [true, true, true, true, true, false, false]
    },
    milestones: [],
    dailyLog: [],
    streak: 0,
    lastSessionDate: null,
    totalMinutes: 0,
    badges: []
  };
}

export function hydrateFromRoadmap(state, roadmap) {
  if (!state) return state;
  if (Array.isArray(state.milestones) && state.milestones.length > 0) {
    return state;
  }
  const sourceMilestones = (roadmap && Array.isArray(roadmap.milestones))
    ? roadmap.milestones
    : [];
  const milestones = sourceMilestones.map((m) => ({
    id: m.id,
    title: m.title,
    defaultHours: m.defaultHours,
    atomicSlices: Array.isArray(m.atomicSlices) ? [...m.atomicSlices] : [],
    progress: 0,
    completed: false,
    currentSliceIndex: 0
  }));
  return { ...state, milestones };
}

export function pickDailyTask(state) {
  if (!state || !Array.isArray(state.milestones)) return null;
  const milestone = state.milestones.find(
    (m) => !m.completed
      && Array.isArray(m.atomicSlices)
      && m.currentSliceIndex < m.atomicSlices.length
  );
  if (!milestone) return null;
  const hoursPerDay = (state.setup && typeof state.setup.hoursPerDay === "number")
    ? state.setup.hoursPerDay
    : 1.0;
  const suggestedMinutes = Math.min(90, Math.round(hoursPerDay * 60));
  return {
    milestoneId: milestone.id,
    milestoneTitle: milestone.title,
    sliceIndex: milestone.currentSliceIndex,
    sliceText: milestone.atomicSlices[milestone.currentSliceIndex],
    suggestedMinutes
  };
}

export function startSession(state, task) {
  return {
    ...state,
    currentSession: {
      startedAt: Date.now(),
      task,
      plannedMinutes: task ? task.suggestedMinutes : 0
    }
  };
}

export function currentISODate() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function daysFromISO(isoDate, refDate) {
  if (!isoDate) return null;
  const ref = refDate ? new Date(refDate + "T00:00:00") : new Date();
  const target = new Date(isoDate + "T00:00:00");
  const refMid = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate());
  const targetMid = new Date(target.getFullYear(), target.getMonth(), target.getDate());
  const ms = refMid.getTime() - targetMid.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

function computeNextStreak(lastSessionDate, today) {
  if (lastSessionDate === today) {
    return { sameDay: true };
  }
  if (!lastSessionDate) {
    return { sameDay: false, reset: true };
  }
  const diff = daysFromISO(lastSessionDate, today);
  if (diff === 1) {
    return { sameDay: false, increment: true };
  }
  return { sameDay: false, reset: true };
}

export function completeSession(state, actualMinutes) {
  const today = currentISODate();
  const task = state.currentSession ? state.currentSession.task : pickDailyTask(state);
  const minutes = typeof actualMinutes === "number" ? actualMinutes : 0;

  let streak = state.streak || 0;
  const streakInfo = computeNextStreak(state.lastSessionDate, today);
  if (streakInfo.sameDay) {
    // no cambia
  } else if (streakInfo.increment) {
    streak = streak + 1;
  } else {
    streak = 1;
  }

  const milestones = (state.milestones || []).map((m) => {
    if (!task || m.id !== task.milestoneId) return m;
    const nextIndex = (m.currentSliceIndex || 0) + 1;
    const totalSlices = Array.isArray(m.atomicSlices) ? m.atomicSlices.length : 0;
    const completed = nextIndex >= totalSlices;
    const progress = totalSlices > 0 ? Math.min(1, nextIndex / totalSlices) : 1;
    return {
      ...m,
      currentSliceIndex: Math.min(nextIndex, totalSlices),
      progress,
      completed
    };
  });

  const badges = [...(state.badges || [])];
  if (task) {
    const ms = milestones.find((m) => m.id === task.milestoneId);
    if (ms && ms.completed && !badges.includes(task.milestoneId)) {
      badges.push(task.milestoneId);
    }
  }

  const dailyLog = [
    ...(state.dailyLog || []),
    {
      date: today,
      minutesPlanned: state.currentSession ? state.currentSession.plannedMinutes : (task ? task.suggestedMinutes : 0),
      minutesActual: minutes,
      completed: true,
      milestoneId: task ? task.milestoneId : null,
      sliceIndex: task ? task.sliceIndex : null
    }
  ];

  const next = {
    ...state,
    milestones,
    dailyLog,
    streak,
    lastSessionDate: today,
    totalMinutes: (state.totalMinutes || 0) + minutes,
    badges
  };
  delete next.currentSession;
  return next;
}

export function incompleteSession(state, actualMinutes) {
  const today = currentISODate();
  const task = state.currentSession ? state.currentSession.task : pickDailyTask(state);
  const minutes = typeof actualMinutes === "number" ? actualMinutes : 0;

  const dailyLog = [
    ...(state.dailyLog || []),
    {
      date: today,
      minutesPlanned: state.currentSession ? state.currentSession.plannedMinutes : (task ? task.suggestedMinutes : 0),
      minutesActual: minutes,
      completed: false,
      milestoneId: task ? task.milestoneId : null,
      sliceIndex: task ? task.sliceIndex : null
    }
  ];

  const next = {
    ...state,
    dailyLog,
    totalMinutes: (state.totalMinutes || 0) + minutes
  };
  delete next.currentSession;
  return next;
}
