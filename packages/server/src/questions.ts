import type { Question } from "@facit/shared";

/** Pre-generated question bank for "Sant eller Falskt" */
const QUESTION_BANK: Question[] = [
  {
    id: "q1",
    statement: "Honey never spoils. Archaeologists have found 3,000-year-old honey in Egyptian tombs that was still edible.",
    isTrue: true,
    category: "Food & Science",
    source: "Smithsonian Magazine",
  },
  {
    id: "q2",
    statement: "The Great Wall of China is visible from space with the naked eye.",
    isTrue: false,
    category: "Geography",
    source: "NASA",
  },
  {
    id: "q3",
    statement: "Octopuses have three hearts.",
    isTrue: true,
    category: "Animals",
    source: "National Geographic",
  },
  {
    id: "q4",
    statement: "Lightning never strikes the same place twice.",
    isTrue: false,
    category: "Nature",
    source: "NOAA",
  },
  {
    id: "q5",
    statement: "Bananas are berries, but strawberries are not.",
    isTrue: true,
    category: "Botany",
    source: "Stanford University",
  },
  {
    id: "q6",
    statement: "Humans use only 10% of their brains.",
    isTrue: false,
    category: "Biology",
    source: "Scientific American",
  },
  {
    id: "q7",
    statement: "Venus is the hottest planet in our solar system, despite not being the closest to the Sun.",
    isTrue: true,
    category: "Space",
    source: "NASA",
  },
  {
    id: "q8",
    statement: "Goldfish have a memory span of only 3 seconds.",
    isTrue: false,
    category: "Animals",
    source: "University of Plymouth",
  },
  {
    id: "q9",
    statement: "A group of flamingos is called a 'flamboyance'.",
    isTrue: true,
    category: "Animals",
    source: "Audubon Society",
  },
  {
    id: "q10",
    statement: "Mount Everest is the tallest mountain when measured from base to peak.",
    isTrue: false,
    category: "Geography",
    source: "USGS (Mauna Kea is taller base-to-peak)",
  },
  {
    id: "q11",
    statement: "Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.",
    isTrue: true,
    category: "History",
    source: "History.com",
  },
  {
    id: "q12",
    statement: "Diamonds are made from compressed coal.",
    isTrue: false,
    category: "Geology",
    source: "Geological Society of America",
  },
  {
    id: "q13",
    statement: "A day on Venus is longer than a year on Venus.",
    isTrue: true,
    category: "Space",
    source: "NASA",
  },
  {
    id: "q14",
    statement: "Sushi means 'raw fish' in Japanese.",
    isTrue: false,
    category: "Language",
    source: "It means 'sour rice'",
  },
  {
    id: "q15",
    statement: "Sharks are older than trees. Sharks have existed for around 400 million years, while trees appeared about 350 million years ago.",
    isTrue: true,
    category: "Natural History",
    source: "Smithsonian",
  },
  {
    id: "q16",
    statement: "Napoleon Bonaparte was unusually short for his time.",
    isTrue: false,
    category: "History",
    source: "He was ~5'7\", average for the era",
  },
  {
    id: "q17",
    statement: "Scotland's national animal is the unicorn.",
    isTrue: true,
    category: "Culture",
    source: "Royal Scottish Government",
  },
  {
    id: "q18",
    statement: "The tongue is the strongest muscle in the human body.",
    isTrue: false,
    category: "Biology",
    source: "Library of Congress",
  },
  {
    id: "q19",
    statement: "There are more possible iterations of a game of chess than there are atoms in the observable universe.",
    isTrue: true,
    category: "Mathematics",
    source: "Shannon number estimation",
  },
  {
    id: "q20",
    statement: "Bulls are angered by the color red.",
    isTrue: false,
    category: "Animals",
    source: "MythBusters / Animal science",
  },
];

/** Shuffle an array in place using Fisher-Yates */
function shuffle<T>(array: T[]): T[] {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Get a randomized selection of questions from the bank */
export function getQuestions(count: number): Question[] {
  const shuffled = shuffle(QUESTION_BANK);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
