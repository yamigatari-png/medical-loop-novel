export type Day = 1 | 2 | 3;

export type Lang = "ja" | "en";

export type PenState = "full" | "mid" | "low" | "empty";

export type CharacterPosition = "left" | "center" | "right";

export type StoryCharacter = {
  name: string;
  position: CharacterPosition;
};

export type ItemKey =
  | "stethoscope"
  | "aed"
  | "handkerchief"
  | "notebook"
  | "watch"
  | "pen"
  | "scalpel"
  | "switch2"
  | "idCard";

export type MiniGameId =
  | "day1_surgery"
  | "day2_emergency"
  | "day1_surgery2";

export type BadKind =
  | "normal"
  | "girlfriend_lost"
  | "ink_empty"
  | "medical_error"
  | "traffic"
  | "anaphylaxis";

  export type EffectNode = {
  id: string;
  type: "effect";
  day: Day;
  durationMs: number;
  background?: string;
  overlay?: "dark" | "black" | "white" | "red" | "noiseText"| "loopVortex";
  speaker?: string;
  text?: string;
  textEn?: string;
  glitch?: boolean;
  se?: string[];
  seLoop?: string[];
  bgm?: string;
  fade?: "in" | "out" | "inOut" | "whiteOut"| "tvOff";
  characterFade?: "in" | "out";
  screenTint?: "red";
  loopBackTo?: string;
  character?: StoryCharacter;
  characters?: StoryCharacter[];
  next: string;
  crossfade?: true;
};

export type StoryNode =
  | LineNode
  | ChoiceNode
  | BadEndNode
  | EndNode
  | ItemSelectNode
  | MiniGameNode
  | EffectNode;

  export type ItemSelectNode = {
  id: string;
  type: "itemSelect";
  day: Day;
  background?: string;
  text: string;
  textEn?: string;
  maxItems: number;
  overlay?: string;
  loopBackTo?: string;
  bgm?: string;
  items: {
    key: ItemKey;
    label: string;
    labelEn?: string;
  }[];
  next: string;
};

export type MiniGameNode = {
  id: string;
  type: "miniGame";
  day: Day;
  background?: string;
  miniGameId: MiniGameId;
  title: string;
  text: string;
  successNext: string;
  failNext: string;
  forcedFail?: boolean;
  timeLimitMs?: number;
  titleEn?: string;
  textEn?: string;
};

export type LineNode = {
  id: string;
  type: "line";
  day: Day;
  speaker?: string;
  text: string;
  textEn?: string;
  background?: string;
  tvNoise?: boolean;

  overlay?: "dark" | "black" | "white" | "red" | "noiseText"| "loopVortex";
  glitch?: boolean;

  character?: StoryCharacter;
  characters?: StoryCharacter[];
  characterFade?: "in" | "out";
  next: string;
  memo?: string;
  bgm?: string;
  se?: string[];
  seLoop?: string[];
  cv?: string;
  telop?: string;
  note?: string;
  addArmMemo?: ArmMemoKey;
  textAlign?: "left" | "center";
  screenTint?: "red";
  loopBackTo?: string;
};

export type ChoiceNode = {
  id: string;
  type: "choice";
  day: Day;
  speaker?: string;
  text: string;
  textEn?: string;
  background?: string;
  overlay?: "dark" | "black" | "white" | "red" | "noiseText";
  character?: StoryCharacter;
  characters?: StoryCharacter[];
  choices: ChoiceOption[];
  loopBackTo?: string;
  bgm?: string;
  se?: string[];
  seLoop?: string[];
  note?: string;
};

export type ChoiceOption = {
  label: string;
  labelEn?: string;
  next: string;
  showIfVisited?: string[];
  setFlags?: string[];
  requireFlags?: string[];
  hideIfFlags?: string[];

  requireItems?: ItemKey[];
  requireMissingItems?: ItemKey[];
  requireVisitedNodes?: string[];

  requireLoopUsed?: boolean;
  requireHerLoopUnused?: boolean;
  requireHerLoopUsed?: boolean;

  consumeLoop?: boolean;
};

export type BadEndNode = {
  id: string;
  type: "bad";
  day: Day;
  title: string;
  text: string;
  background?: string;
  badKind?: BadKind;
  titleEn?: string;
  textEn?: string;
  next?: string;
  textAlign?: "left" | "center";
};

export type EndNode = {
  id: string;
  type: "end";
  day: Day;
  endingId: string;
  title: string;
  text: string;
  background?: string;
  titleEn?: string;
  textEn?: string;
  textAlign?: "left" | "center";
};

export type ArmMemoKey =
  |"take_me_back"
  | "responsibility_1"
  | "loop_limit"
  | "dont_run"
  | "promise"
  | "responsibility_2"
  | "report"
  | "drunk_drive_ng"
  | "walk_ng"
  | "go_hospital"
  | "pain_order"
  | "resection_ng"
  | "bus_ng"
  | "op_prep_1"
  | "op_prep_2"
  | "idcard"
  | "allergy"
  | "History_Taking";
  
export type GameState = {
  currentNodeId: string;
  currentDay: Day;
  dayStartNodeId: string;
  lastChoiceNodeId: string | null;

  loopStock: number;
  maxLoopStock: number;

  usedPlayerLoop: number;
  usedHerLoop: number;
  girlfriendLoopUsed: boolean;

  flags: Record<string, boolean>;
  armMemos: ArmMemoKey[];
  visitedNodeIds: string[];
  seenEndings: string[];

  selectedItems: ItemKey[];
  completedMiniGames: MiniGameId[];

  log: LogEntry[];
  settings: Settings;
};

export type Settings = {
  lang: Lang;
  textSpeed: number;
  autoSpeed: number;
  bgmVolume: number;
  seVolume: number;
  cvVolume: number;
};

export type LogEntry = {
  speaker?: string;
  text: string;
};