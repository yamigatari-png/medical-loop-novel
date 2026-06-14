import type { MiniGameId, ItemKey } from "../types";

export type InstrumentKey =
  | "gauze"
  | "suction"
  | "scalpel"
  | "cooper"
  | "forceps"
  | "tweezers"
  | "retractor"
  | "suture";

export type MiniGameQuestion = {
  id: string;
  prompt: string;
  promptEn?: string;
  correct: InstrumentKey[];
  timeLimitMs: number;
};

export type MiniGameData = {
  id: MiniGameId;
  title: string;
  titleEn?: string;
  instruments: {
    key: InstrumentKey;
    label: string;
    labelEn?: string;
  }[];
  questions: MiniGameQuestion[];
  requireItems?: ItemKey[];
};

export const SURGERY_INSTRUMENTS: MiniGameData["instruments"] = [
  { key: "gauze", label: "ガーゼ", labelEn: "Gauze" },
  { key: "suction", label: "吸引器", labelEn: "Suction" },
  { key: "scalpel", label: "メス", labelEn: "Scalpel" },
  { key: "cooper", label: "クーパー", labelEn: "Cooper scissors" },
  { key: "forceps", label: "鉗子", labelEn: "Forceps" },
  { key: "tweezers", label: "せっし", labelEn: "Tissue forceps" },
  { key: "retractor", label: "筋鈎", labelEn: "Retractor" },
  { key: "suture", label: "縫合糸", labelEn: "Suture" },
];

export const miniGames: Record<MiniGameId, MiniGameData> = {
  day1_surgery: {
  id: "day1_surgery",
  title: "手術",
  titleEn: "Surgery",
  instruments: SURGERY_INSTRUMENTS,
  questions: [
  {
    id: "day1_q1",
    prompt: "まずは皮膚を切開しましょう。",
    promptEn: "First, make the skin incision.",
    correct: ["scalpel"],
    timeLimitMs: 3000,
  },
  {
    id: "day1_q2",
    prompt: "出血しています。ガーゼで拭いてください。",
    promptEn: "There is bleeding. Wipe it with gauze.",
    correct: ["gauze"],
    timeLimitMs: 3000,
  },
  {
    id: "day1_q3",
    prompt: "縫合したら、余った糸を切りましょう。",
    promptEn: "After placing the suture, cut the excess suture with Cooper scissors.",
    correct: ["suture", "cooper"],
    timeLimitMs: 3000,
  },
  ],
},

  day1_surgery2: {
    id: "day1_surgery2",
    title: "手術",
    titleEn: "Surgery",
    instruments: SURGERY_INSTRUMENTS,
    questions: [
      {
        id: "day1-2_q1",
        prompt: "まずはメスで皮膚を切開しましょう。",
        promptEn: "Use the scalpel to make a skin incision.",
        correct: ["scalpel"],
        timeLimitMs: 5000,
      },
      {
        id: "day1-2_q2",
        prompt: "術野が見づらいです。筋鈎で広げてください。",
        promptEn: "The surgical field is hard to see. Use the retractor.",
        correct: ["retractor"],
        timeLimitMs: 5000,
      },
      {
        id: "day1-2_q3",
        prompt: "吸引して視野を確保してください。",
        promptEn: "Use suction to clear the field.",
        correct: ["suction"],
        timeLimitMs: 5000,
      },
      {
        id: "day1-2_q4",
        prompt: "出血しています。ガーゼで拭いてください。",
        promptEn: "There is bleeding. Wipe it with gauze.",
        correct: ["gauze"],
        timeLimitMs: 5000,
      },
      {
        id: "day1-2_q5",
        prompt: "縫合糸で縫い、余った糸をクーパーで切りましょう。",
        promptEn: "After placing the suture, cut the excess suture with Cooper scissors.",
        correct: ["suture", "cooper"],
        timeLimitMs: 5000,
      },
    ],
  },
  
  day2_emergency: {
    id: "day2_emergency",
    title: "緊急手術",
    titleEn: "Emergency Surgery",
    instruments: SURGERY_INSTRUMENTS,
    questions: [
      {
        id: "day2_q1",
        prompt: "皮膚を切開しました。ガーゼで出血を拭ってください。",
        promptEn:"The skin has been incised. Use gauze to wipe away the blood.",
        correct: ["gauze"],
        timeLimitMs: 5000,
      },
      {
        id: "day2_q2",
        prompt: "鉗子で組織を把持しておいてください。",
        promptEn:"Hold the tissue with forceps.",
        correct: ["forceps"],
        timeLimitMs: 5000,
      },
      {
        id: "day2_q3",
        prompt: "筋鈎で術野を広げてください。",
        promptEn:"Use a retractor to widen the surgical field.",
        correct: ["retractor"],
        timeLimitMs: 5000,
      },
      {
        id: "day2_q4",
        prompt: "せっしで組織を把持し、縫合糸をかけてください。",
        promptEn: "Grasp the tissue with tissue forceps and place the suture.",
        correct: ["suture", "tweezers"],
        timeLimitMs: 5000,
      },
      {
        id: "day2_q5",
        prompt: "余った糸はクーパーで切りましょう。",
        promptEn:"Cut the excess suture with the Cooper scissors.",
        correct: ["cooper"],
        timeLimitMs: 5000,
      },
    ],
  },
};