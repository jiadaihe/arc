import { db } from "./index";
import { goals, items, challengeCheckins } from "./schema";
import { randomUUID } from "crypto";

// Seed requires a userId argument: npx tsx db/seed.ts <userId>
const userId = process.argv[2];
if (!userId) {
  console.error("Usage: npx tsx db/seed.ts <userId>");
  console.error("Sign up first, then pass your user ID.");
  process.exit(1);
}

// Clear existing data for this user
db.delete(challengeCheckins).run();
db.delete(items).run();
db.delete(goals).run();

const now = new Date();
const today = now.toISOString().slice(0, 10);
const iso = () => now.toISOString();

function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

function daysFromNow(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

// --- Goals ---

const goalIds = {
  fitness: randomUUID(),
  reading: randomUUID(),
  spanish: randomUUID(),
  portfolio: randomUUID(),
};

const seedGoals = [
  {
    id: goalIds.fitness,
    userId,
    title: "Run a half marathon",
    color: "#E07A5F",
    startDate: daysAgo(30),
    targetDate: daysFromNow(60),
    habitFrequency: null,
    habitDurationDays: null,

    status: "active" as const,
    createdAt: iso(),
    updatedAt: iso(),
  },
  {
    id: goalIds.reading,
    userId,
    title: "Read 20 books this year",
    color: "#3D85C6",
    startDate: daysAgo(80),
    targetDate: daysFromNow(280),
    habitFrequency: null,
    habitDurationDays: null,

    status: "active" as const,
    createdAt: iso(),
    updatedAt: iso(),
  },
  {
    id: goalIds.spanish,
    userId,
    title: "30-day Spanish streak",
    color: "#81B29A",
    startDate: daysAgo(12),
    targetDate: daysFromNow(18),
    habitFrequency: "daily" as const,
    habitDurationDays: 30,

    status: "active" as const,
    createdAt: iso(),
    updatedAt: iso(),
  },
  {
    id: goalIds.portfolio,
    userId,
    title: "Launch portfolio site",
    color: "#F2CC8F",
    startDate: daysAgo(14),
    targetDate: daysFromNow(14),
    habitFrequency: null,
    habitDurationDays: null,

    status: "active" as const,
    createdAt: iso(),
    updatedAt: iso(),
  },
];

for (const g of seedGoals) {
  db.insert(goals).values(g).run();
}

// --- Items ---

const seedItems = [
  // Today
  { title: "Morning 5K run", date: today, startTime: "07:00", endTime: "07:45", goalId: goalIds.fitness, assetId: "running", completed: 1 },
  { title: "Read chapter 12", date: today, startTime: null, endTime: null, goalId: goalIds.reading, assetId: "book", completed: 0 },
  { title: "Duolingo lesson", date: today, startTime: null, endTime: null, goalId: goalIds.spanish, assetId: "language", completed: 1 },
  { title: "Grocery shopping", date: today, startTime: "12:00", endTime: "13:00", goalId: null, assetId: "shopping", completed: 0 },
  { title: "Design hero section", date: today, startTime: "14:00", endTime: "16:00", goalId: goalIds.portfolio, assetId: "paintbrush", completed: 0 },

  // Yesterday
  { title: "Interval training", date: daysAgo(1), startTime: "06:30", endTime: "07:30", goalId: goalIds.fitness, assetId: "dumbbell", completed: 1 },
  { title: "Read chapter 11", date: daysAgo(1), startTime: null, endTime: null, goalId: goalIds.reading, assetId: "book", completed: 1 },
  { title: "Duolingo lesson", date: daysAgo(1), startTime: null, endTime: null, goalId: goalIds.spanish, assetId: "language", completed: 1 },
  { title: "Wireframe portfolio", date: daysAgo(1), startTime: "10:00", endTime: "12:00", goalId: goalIds.portfolio, assetId: "laptop", completed: 1 },

  // 2 days ago
  { title: "Easy 3K jog", date: daysAgo(2), startTime: "07:00", endTime: "07:30", goalId: goalIds.fitness, assetId: "running", completed: 1 },
  { title: "Duolingo lesson", date: daysAgo(2), startTime: null, endTime: null, goalId: goalIds.spanish, assetId: "language", completed: 1 },

  // 5 days ago (reading will show as neutral health)
  { title: "Read chapter 10", date: daysAgo(5), startTime: null, endTime: null, goalId: goalIds.reading, assetId: "book", completed: 1 },
];

for (const item of seedItems) {
  db.insert(items).values({
    id: randomUUID(),
    userId,
    title: item.title,
    date: item.date,
    startTime: item.startTime,
    endTime: item.endTime,
    goalId: item.goalId,
    assetId: item.assetId,
    completed: item.completed,
    createdAt: new Date(item.date + "T10:00:00Z").toISOString(),
  }).run();
}

// --- Check-ins (for the Spanish challenge) ---

for (let i = 0; i < 12; i++) {
  db.insert(challengeCheckins).values({
    id: randomUUID(),
    userId,
    goalId: goalIds.spanish,
    date: daysAgo(i),
    createdAt: iso(),
  }).run();
}

console.log("Seeded: 4 goals, %d items, 12 check-ins for user %s", seedItems.length, userId);
