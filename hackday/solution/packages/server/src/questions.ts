import { Question } from '@game/shared'

const QUESTION_BANK: Question[] = [
  {
    id: 'q01',
    statement: 'The Great Wall of China is visible from space with the naked eye.',
    isTrue: false,
    category: 'History',
    source: 'NASA has confirmed this is a myth — the wall is too narrow to see from orbit',
  },
  {
    id: 'q02',
    statement: 'Humans share roughly 60% of their DNA with bananas.',
    isTrue: true,
    category: 'Science',
    source: 'Around 60% of human genes have a recognizable counterpart in bananas',
  },
  {
    id: 'q03',
    statement: 'Honey found in ancient Egyptian tombs is still edible.',
    isTrue: true,
    category: 'Food',
    source: "Archaeologists have tasted 3000-year-old honey — its low moisture prevents bacterial growth",
  },
  {
    id: 'q04',
    statement: 'We only use 10% of our brains.',
    isTrue: false,
    category: 'Science',
    source: 'Brain imaging shows almost all regions are active; the 10% figure has no scientific basis',
  },
  {
    id: 'q05',
    statement: 'A day on Venus is longer than a year on Venus.',
    isTrue: true,
    category: 'Space',
    source: 'Venus rotates so slowly its day (243 Earth days) is longer than its year (225 Earth days)',
  },
  {
    id: 'q06',
    statement: 'Goldfish have a three-second memory.',
    isTrue: false,
    category: 'Animals',
    source: 'Goldfish can remember things for months and can be trained to navigate mazes',
  },
  {
    id: 'q07',
    statement: 'The Eiffel Tower grows taller in summer.',
    isTrue: true,
    category: 'Science',
    source: 'Thermal expansion causes the iron structure to grow up to 15 cm on hot days',
  },
  {
    id: 'q08',
    statement: 'Napoleon Bonaparte was unusually short for his time.',
    isTrue: false,
    category: 'History',
    source: "Napoleon was about 170 cm, average for a Frenchman of his era — the myth arose from a measurement mix-up",
  },
  {
    id: 'q09',
    statement: 'Octopuses have three hearts.',
    isTrue: true,
    category: 'Animals',
    source: 'Two hearts pump blood to the gills; one pumps it to the rest of the body',
  },
  {
    id: 'q10',
    statement: 'Bulls are enraged by the color red.',
    isTrue: false,
    category: 'Animals',
    source: "Bulls are colorblind to red — they react to the movement of the cape, not its color",
  },
  {
    id: 'q11',
    statement: 'Cleopatra lived closer in time to the Moon landing than to the building of the Great Pyramid.',
    isTrue: true,
    category: 'History',
    source: 'Cleopatra lived ~2000 years after the pyramid was built and ~2000 years before 1969',
  },
  {
    id: 'q12',
    statement: 'Lightning never strikes the same place twice.',
    isTrue: false,
    category: 'Science',
    source: 'Lightning frequently strikes the same place — the Empire State Building is hit ~25 times per year',
  },
  {
    id: 'q13',
    statement: 'Swallowed chewing gum stays in your stomach for 7 years.',
    isTrue: false,
    category: 'Food',
    source: 'While gum base is indigestible, it still moves through your digestive system normally',
  },
  {
    id: 'q14',
    statement: 'A group of flamingos is called a flamboyance.',
    isTrue: true,
    category: 'Animals',
    source: 'Collective nouns for flamingos include flamboyance, colony, and stand',
  },
  {
    id: 'q15',
    statement: 'Bats are completely blind.',
    isTrue: false,
    category: 'Animals',
    source: "All bat species can see; many also use echolocation, but it doesn't replace vision",
  },
  {
    id: 'q16',
    statement: 'The Amazon River discharges more freshwater than the next seven largest rivers combined.',
    isTrue: true,
    category: 'Geography',
    source: 'The Amazon accounts for about 20% of all freshwater flowing into the world\'s oceans',
  },
  {
    id: 'q17',
    statement: 'Eating carrots improves your eyesight beyond normal.',
    isTrue: false,
    category: 'Food',
    source: "Carrots prevent deficiency-related night blindness but won't improve normal vision — the myth was wartime British propaganda",
  },
  {
    id: 'q18',
    statement: 'There are more possible chess games than atoms in the observable universe.',
    isTrue: true,
    category: 'Culture',
    source: 'The Shannon number estimates ~10^120 possible games; the observable universe has ~10^80 atoms',
  },
  {
    id: 'q19',
    statement: 'Mount Everest is the mountain closest to outer space.',
    isTrue: false,
    category: 'Geography',
    source: "Due to Earth's equatorial bulge, Mount Chimborazo in Ecuador is farther from Earth's center — and thus closer to space",
  },
  {
    id: 'q20',
    statement: 'The human body has more bacterial cells than human cells.',
    isTrue: true,
    category: 'Science',
    source: 'The ratio is about 1.3:1 bacteria to human cells, though it varies person to person',
  },
]

function shuffle<T>(arr: T[]): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function getQuestions(count: number): Question[] {
  return shuffle(QUESTION_BANK).slice(0, Math.min(count, QUESTION_BANK.length))
}
