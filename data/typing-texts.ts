export interface TypingQuote {
  id: string;
  text: string;
  source?: string;
  difficulty?: "easy" | "medium" | "hard";
  category?: "tech" | "philosophy" | "retro" | "edgar";
}

export const typingTexts: TypingQuote[] = [
  {
    id: "quote-1",
    text: "Built by AI, Anak Indonesia, powered by JavaScript dan kopi dari Pulau Jawa.",
    source: "Edgar Portfolio Signature",
    difficulty: "easy",
    category: "edgar",
  },
  {
    id: "quote-2",
    text: "Good code is like a vintage typewriter: precise, tactile, and crafted with intention.",
    source: "Software Craftsmanship",
    difficulty: "medium",
    category: "retro",
  },
  {
    id: "quote-3",
    text: "Simplicity is prerequisite for reliability. First make it work, then make it right.",
    source: "Edsger W. Dijkstra",
    difficulty: "medium",
    category: "tech",
  },
  {
    id: "quote-4",
    text: "Ten thirty in the morning, a warm cup of coffee, and a fresh terminal ready to build.",
    source: "Ten Thirty Solutions",
    difficulty: "easy",
    category: "edgar",
  },
  {
    id: "quote-5",
    text: "Talk is cheap. Show me the code. Every keystroke brings ideas into tangible reality.",
    source: "Linus Torvalds",
    difficulty: "medium",
    category: "tech",
  },
  {
    id: "quote-6",
    text: "Any fool can write code that a computer can understand. Good programmers write code that humans can understand.",
    source: "Martin Fowler",
    difficulty: "hard",
    category: "tech",
  },
  {
    id: "quote-7",
    text: "The mechanical platen rolls forward, ink kisses raw paper, and thoughts turn into permanent keystrokes.",
    source: "Royal Typewriter Manual, 1935",
    difficulty: "medium",
    category: "retro",
  },
  {
    id: "quote-8",
    text: "Stay hungry, stay foolish. The best way to predict the future is to invent it with code.",
    source: "Alan Kay & Steve Jobs",
    difficulty: "easy",
    category: "philosophy",
  },
  {
    id: "quote-9",
    text: "Dari Jakarta menuju cakrawala digital, merakit arsitektur web modern dengan ketelitian tinggi.",
    source: "Edgar ('Raged') Manifesto",
    difficulty: "medium",
    category: "edgar",
  },
  {
    id: "quote-10",
    text: "Premature optimization is the root of all evil in programming. Measure twice, cut once.",
    source: "Donald E. Knuth",
    difficulty: "medium",
    category: "tech",
  },
  {
    id: "quote-11",
    text: "In a world of fast touchscreens, the rhythm and acoustic snap of mechanical keys is pure magic.",
    source: "Typewriter Enthusiast Guild",
    difficulty: "medium",
    category: "retro",
  },
  {
    id: "quote-12",
    text: "Debugging is twice as hard as writing the code in the first place. Therefore, write it cleanly.",
    source: "Brian W. Kernighan",
    difficulty: "hard",
    category: "tech",
  },
];
