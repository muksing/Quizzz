// Shared shape for GESTURE game stations. All four activity kinds (Quiz,
// Matching, Grouping, Ordering) are played the same way: the student hovers
// their fingertip over one of up to 4 on-screen cards to pick an answer.
// Matching/Grouping/Ordering are each broken down client-side into a queue
// of these single-pick "rounds" so the player only needs one interaction UI.

export type MatchingData = {
  pairs: { left: string; right: string }[]; // max 4 pairs
};

export type GroupingData = {
  categories: string[]; // max 4 categories
  items: { label: string; categoryIndex: number }[];
};

export type OrderingData = {
  items: string[]; // max 4 items, stored in the correct order
};

export type GestureRound = {
  prompt: string;
  options: string[];
  correctIndex: number;
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function buildQuizRounds(question: string, options: string[], correctIndex: number): GestureRound[] {
  return [{ prompt: question, options, correctIndex }];
}

export function buildMatchingRounds(data: MatchingData): GestureRound[] {
  const rightPool = data.pairs.map((p) => p.right);
  return data.pairs.map((pair) => {
    const distractors = shuffle(rightPool.filter((r) => r !== pair.right)).slice(0, 3);
    const options = shuffle([pair.right, ...distractors]);
    return {
      prompt: pair.left,
      options,
      correctIndex: options.indexOf(pair.right),
    };
  });
}

export function buildGroupingRounds(data: GroupingData): GestureRound[] {
  return shuffle(data.items).map((item) => ({
    prompt: item.label,
    options: data.categories,
    correctIndex: item.categoryIndex,
  }));
}

export function buildOrderingRounds(data: OrderingData): GestureRound[] {
  const rounds: GestureRound[] = [];
  let remaining = shuffle(data.items);
  data.items.forEach((correctItem, position) => {
    rounds.push({
      prompt: `เลือกลำดับที่ ${position + 1}`,
      options: remaining,
      correctIndex: remaining.indexOf(correctItem),
    });
    remaining = remaining.filter((item) => item !== correctItem);
  });
  return rounds;
}
