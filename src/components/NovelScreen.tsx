import { useEffect, useRef, useState } from "react";
import type { GameState, StoryNode, ItemKey, MiniGameId } from "../types";
import { canShowChoice, getPenState } from "../engine/storyEngine";
import type { Lang } from "../types";
import { storyNodes } from "../data/story";

const CHARACTER_IMAGES: Record<
  string,
  { closed: string; open: string }
> = {
  詩織: {
    closed: "/characters/shiori_closed.webp",
    open: "/characters/shiori_open.webp",
  },
  詩織sad: {
    closed: "/characters/shiori_sad_closed.webp",
    open: "/characters/shiori_sad_open.webp",
  },
  詩織angry: {
    closed: "/characters/shiori_angry_closed.webp",
    open: "/characters/shiori_angry_open.webp",
  },
  詩織smail: {
    closed: "/characters/shiori_smail_closed.webp",
    open: "/characters/shiori_smail_open.webp",
  },
  詩織angry1: {
    closed: "/characters/shiori_angry_closed1.webp",
    open: "/characters/shiori_angry_open1.webp",
  },
  詩織no: {
    closed: "/characters/shiori_no_closed.webp",
    open: "/characters/shiori_no_open.webp",
  },
  詩織stunned: {
    closed: "/characters/shiori_stunned_closed.webp",
    open: "/characters/shiori_stunned_open.webp",
  },
  詩織stunned1: {
    closed: "/characters/shiori_stunned1_closed.webp",
    open: "/characters/shiori_stunned1_open.webp",
  },
  詩織surprised: {
    closed: "/characters/shiori_surprised_closed.webp",
    open: "/characters/shiori_surprised_open.webp",
  },
  詩織memory: {
    closed: "/characters/shiori_memory_closed.webp",
    open: "/characters/shiori_memory_open.webp",
  },
  詩織normal: {
    closed: "/characters/shiori_normal_closed.webp",
    open: "/characters/shiori_normal_open.webp",
  },
  詩織sadsmail: {
    closed: "/characters/shiori_sadsmail_closed.webp",
    open: "/characters/shiori_sadsmail_open.webp",
  },
  中原: {
    closed: "/characters/nakahara_closed.webp",
    open: "/characters/nakahara_open.webp",
  },
  中原sad: {
    closed: "/characters/nakahara_sad_closed.webp",
    open: "/characters/nakahara_sad_open.webp",
  },
  中原sad1: {
    closed: "/characters/nakahara_sad_closed1.webp",
    open: "/characters/nakahara_sad_open1.webp",
  },
  中原angry: {
    closed: "/characters/nakahara_angry_closed.webp",
    open: "/characters/nakahara_angry_open.webp",
  },
  中原panic: {
    closed: "/characters/nakahara_panic_closed.webp",
    open: "/characters/nakahara_panic_open.webp",
  },
  中原surprised: {
    closed: "/characters/nakahara_surprised_closed.webp",
    open: "/characters/nakahara_surprised_open.webp",
  },
  中原stunned: {
    closed: "/characters/nakahara_stunned_closed.webp",
    open: "/characters/nakahara_stunned_open.webp",
  },
  中原private: {
    closed: "/characters/nakahara_private.webp",
    open: "/characters/nakahara_private.webp",
  },
  中原private1: {
    closed: "/characters/nakahara_private1.webp",
    open: "/characters/nakahara_private1.webp",
  },
  中原normal: {
    closed: "/characters/nakahara_normal_closed.webp",
    open: "/characters/nakahara_normal_open.webp",
  },
  鷹宮: {
    closed: "/characters/takamiya_closed.webp",
    open: "/characters/takamiya_open.webp",
  },
  鷹宮ope: {
    closed: "/characters/takamiya_ope_closed.webp",
    open: "/characters/takamiya_ope_closed.webp",
  },
  同僚: {
    closed: "/characters/colleague.webp",
    open: "/characters/colleague.webp",
  },
  ウェイター:{
    closed: "/characters/clerk.webp",
    open: "/characters/clerk.webp",
  },
  患者A:{
    closed: "/characters/man.webp",
    open: "/characters/man.webp",
  },
  患者1
  :{
    closed: "/characters/patient1.webp",
    open: "/characters/patient1.webp",
  },
  患者2
  :{
    closed: "/characters/patient2.webp",
    open: "/characters/patient2.webp",
  },
  患者3
  :{
    closed: "/characters/patient3.webp",
    open: "/characters/patient3.webp",
  },
  救急隊
  :{
    closed: "/characters/Paramedic.webp",
    open: "/characters/Paramedic.webp",
  },
  救急患者
  :{
    closed: "/characters/Emergency_patient.webp",
    open: "/characters/Emergency_patient.webp",
  },
};

const UI_TEXT = {
  ja: {
    arm: "腕を見る",
    loop: "ループ",
    skip: "スキップ",
    auto: "オート",
    title: "タイトルへ",
    settings: "設定",
    log: "ログ",
  },
  en: {
    arm: "Check Arm",
    loop: "Loop",
    skip: "Skip",
    auto: "Auto",
    title: "Title",
    settings: "Settings",
    log: "Log",
  },
} as const;

const SPEAKER_NAME = {
  ja: {
    湊: "湊",
    詩織: "詩織",
    鷹宮: "鷹宮",
    中原: "中原",
    同僚: "同僚",
    ウェイター: "ウェイター",
    患者A: "患者A",
    患者1: "患者1",
    患者2: "患者2",
    患者3: "患者3",
    救急隊: "救急隊",
    救急患者: "救急患者",
  },
  en: {
    湊: "Minato",
    詩織: "Shiori",
    鷹宮: "Takamiya",
    中原: "Nakahara",
    同僚: "colleague",
    ウェイター: "clerk",
    患者A: "Patient A",
    患者1: "Patient1",
    患者2: "Patient2",
    患者3: "Patient3",
    救急隊: "Paramedic",
    救急患者: "Emergency patient",
  },
} as const;
  
function getSpeakerName(name: string | undefined, lang: Lang): string {
  if (!name) return "";
  return SPEAKER_NAME[lang][name as keyof typeof SPEAKER_NAME["ja"]] ?? name;
}

type Props = {
  state: GameState;
  node: StoryNode;
  lang: Lang;
  onNext: () => void;
  onChoice: (index: number) => void;
  onItemSelect: (items: ItemKey[], nextNodeId: string) => void;
  loopEffectVisual?: {
  background: string;
  character?: {
    name: string;
    position: "left" | "center" | "right";
  };
  characters?: {
  name: string
  position: "left" | "center" | "right"
}[]
} | null;
loopDisabledVisual?: {
  background: string;
  character?: {
    name: string;
    position: "left" | "center" | "right";
  };
} | null;
  onMiniGameResult: (
  miniGameId: MiniGameId,
  success: boolean,
  successNext: string,
  failNext: string
) => void;
  onMiniGameStart: () => void;
  onOpenMemo: () => void;
  onOpenLoopConfirm: () => void;
  onOpenLog: () => void;
  onOpenSettings: () => void;
  onBackTitle: () => void;
};

export function NovelScreen({
  state,
  node,
  lang,
  onNext,
  loopEffectVisual,
  loopDisabledVisual,
  onChoice,
  onItemSelect,
  onMiniGameStart,
  onOpenMemo,
  onOpenLoopConfirm,
  onOpenLog,
  onOpenSettings,
  onBackTitle,
}: Props) {
  const penState = getPenState(state.loopStock);
  const t = UI_TEXT[lang];

  useEffect(() => {
  Object.values(CHARACTER_IMAGES).forEach((imageSet) => {
    const closed = new Image();
    closed.src = imageSet.closed;

    const open = new Image();
    open.src = imageSet.open;
  });
}, []);

  const ARM_BUTTON_START_NODE_IDS = [
  "day1_pen_013",
  "day1_bedroom_loop_002",
  "day1_living_loop_001",
  "day1_loop_title_004",
  "day3_no_chase_morning_002",
  "day3_chase_wakeup_001",

  "day2_evening_choice_first",
];

const ARM_DISABLED_NODE_IDS = [
  "day1_icu_011",
  "day1_loop_002",
  "day1_flashback_night_001",
  "day1_flashback_night_002",
  "day1_flashback_night_003",
  "day1_flashback_night_004",
  "day1_flashback_night_005",
  "day1_flashback_night_006",
  "day1_flashback_night_007",
  "day1_flashback_night_008",
  "day1_flashback_night_009",
  "day1_loop_white_001",
  "day1_loop_white_0015",
  "day1_bedroom_loop_001",
  "day2_arm_0002",
  "day2_arm_0005",
  "day2_arm_001",
  "day1_room_after_date_005",
  "day1_flashback_room_001",
  "day1_flashback_room_002",
  "day1_flashback_room_0025",
  "day1_flashback_room_003",
  "day1_flashback_room_004",
  "day1_flashback_room_005",
  "day1_flashback_room_006",
  "day1_flashback_room_007",
  "day1_flashback_room_008",
  "day1_flashback_room_009",
  "day1_flashback_room_010",
  "day1_flashback_room_011",
  "day1_flashback_room_012",
  "day1_flashback_room_013",
  "day2_black_001",
  "day2_black_0015",
  "day2_black_002",
  "day2_flashback_room_001",
  "day2_flashback_room_002",
  "day2_flashback_room_003",
  "day2_flashback_room_004",
  "day2_flashback_room_005",
  "day2_flashback_room_006",
  "day2_flashback_room_007",
  "day2_flashback_room_008",
  "day2_flashback_room_0085",
  "day2_flashback_room_009",
  "day2_flashback_room_010",
  "day2_flashback_room_011",
  "day2_flashback_room_012",
  "day2_flashback_room_013",
  "day2_flashback_room_014",
  "day2_flashback_room_015",
  "day2_flashback_room_0155",
  "day2_end_placeholder",

  "day2_no_chase_flashback_room_001",
  "day2_no_chase_flashback_room_002",
  "day2_no_chase_flashback_room_003",
  "day2_no_chase_flashback_room_004",
  "day2_no_chase_flashback_room_005",
  "day2_no_chase_flashback_room_006",
  "day2_no_chase_flashback_room_007",
  "day2_no_chase_flashback_room_008",
  "day2_no_chase_flashback_room_0085",
  "day2_no_chase_flashback_room_009",
  "day2_no_chase_flashback_room_010",
  "day2_no_chase_flashback_room_011",
  "day2_no_chase_flashback_room_012",
  "day2_no_chase_flashback_room_013",
  "day2_no_chase_flashback_room_014",
  "day2_no_chase_flashback_room_015",
  "day2_no_chase_flashback_room_0155",
  "day2_no_chase_end_placeholder",
];

const BUTTONS_HIDDEN_AFTER_NODE_IDS = [
  "day3_route_a_rewake_black_003",
  "day3_route_a_ward_0017",
];

const isButtonsHiddenAfterRouteA =
  BUTTONS_HIDDEN_AFTER_NODE_IDS.includes(node.id) ||
  BUTTONS_HIDDEN_AFTER_NODE_IDS.some((id) =>
    state.visitedNodeIds.includes(id)
  );

const canShowArmButton =
  !isButtonsHiddenAfterRouteA &&
  node.type !== "miniGame" &&
  !ARM_DISABLED_NODE_IDS.includes(node.id) &&
  (
    state.armMemos.length > 0 ||
    ARM_BUTTON_START_NODE_IDS.includes(node.id) ||
    ARM_BUTTON_START_NODE_IDS.some((id) =>
      state.visitedNodeIds.includes(id)
    )
  );

const isArmDisabled = ARM_DISABLED_NODE_IDS.includes(node.id);

const ARM_LOCKED_OPEN_NODE_IDS = [
  "day1_bedroom_loop_011",
  "day1_bedroom_loop_012",
  "day1_bedroom_loop_choice_001",
  "day1_bedroom_loop_choice_yes_001",
  "day1_bedroom_loop_choice_no_001",
  "day2_arm_0002",
  "day2_arm_0005",
  "day2_arm_001",
  "day3_keep_silent_0003",
  "day3_keep_silent_001",
  "day3_keep_silent_0013",
  "day3_keep_silent_0015",
  "day3_keep_silent_002",
  "day3_keep_silent_0025",
  "day3_keep_silent_0027",
  "day3_keep_silent_003",
  "day3_keep_silent_0035",
  "day3_keep_silent_004",
  "day3_loop_disabled_001",
  "day3_loop_disabled_0015",
  "day3_loop_disabled_002",
  "day3_loop_disabled_003",
];

const isArmLockedOpen = ARM_LOCKED_OPEN_NODE_IDS.includes(node.id);

const LOOP_WAIT_NODE_IDS = [
  "day1_icu_crisis_023",
  "day1_living_loop_014",
  "day1_surgery_007",
  "day1_fail_001",
  "day2_id_missing_002",
  "day2_no_aed_001",
  "day2_bus_no_aed_001",
  "day2_clinic_review_bad_loop_0015",
  "day2_anaphylaxis_loop_wait_001",
  "day2_emergency_surgery_fail_002",
  "day2_shiori_not_returned_002",
  "day3_keep_silent_0015",
  "day3_loop_disabled_0015",
];

const LOOP_BUTTON_HIDDEN_NODE_IDS = [
  "day1_loop_002",
  "day1_flashback_night_001",
  "day1_flashback_night_002",
  "day1_flashback_night_003",
  "day1_flashback_night_004",
  "day1_flashback_night_005",
  "day1_flashback_night_006",
  "day1_flashback_night_007",
  "day1_flashback_night_008",
  "day1_flashback_night_009",
  "day1_loop_white_001",
  "day1_loop_white_0015",
  "day1_bedroom_loop_001",
  "day1_room_after_date_005",
  "day1_flashback_room_001",
  "day1_flashback_room_002",
  "day1_flashback_room_0025",
  "day1_flashback_room_003",
  "day1_flashback_room_004",
  "day1_flashback_room_005",
  "day1_flashback_room_006",
  "day1_flashback_room_007",
  "day1_flashback_room_008",
  "day1_flashback_room_009",
  "day1_flashback_room_010",
  "day1_flashback_room_011",
  "day1_flashback_room_012",
  "day1_flashback_room_013",
  "day2_black_001",
  "day2_black_0015",
  "day2_black_002",
  "day2_flashback_room_001",
  "day2_flashback_room_002",
  "day2_flashback_room_003",
  "day2_flashback_room_004",
  "day2_flashback_room_005",
  "day2_flashback_room_006",
  "day2_flashback_room_007",
  "day2_flashback_room_008",
  "day2_flashback_room_0085",
  "day2_flashback_room_009",
  "day2_flashback_room_010",
  "day2_flashback_room_011",
  "day2_flashback_room_012",
  "day2_flashback_room_013",
  "day2_flashback_room_014",
  "day2_flashback_room_015",
  "day2_flashback_room_0155",
  "day2_end_placeholder",

  "day2_no_chase_flashback_room_001",
  "day2_no_chase_flashback_room_002",
  "day2_no_chase_flashback_room_003",
  "day2_no_chase_flashback_room_004",
  "day2_no_chase_flashback_room_005",
  "day2_no_chase_flashback_room_006",
  "day2_no_chase_flashback_room_007",
  "day2_no_chase_flashback_room_008",
  "day2_no_chase_flashback_room_0085",
  "day2_no_chase_flashback_room_009",
  "day2_no_chase_flashback_room_010",
  "day2_no_chase_flashback_room_011",
  "day2_no_chase_flashback_room_012",
  "day2_no_chase_flashback_room_013",
  "day2_no_chase_flashback_room_014",
  "day2_no_chase_flashback_room_015",
  "day2_no_chase_flashback_room_0155",
  "day2_no_chase_end_placeholder",
];

  const LOOP_BUTTON_START_NODE_IDS = [
  "day1_icu_crisis_023",
  "day1_living_loop_001",
  "day1_loop_title_004",
  "day3_no_chase_morning_002",
  "day3_chase_wakeup_001",

  "day2_evening_choice_first",
];

const CINEMATIC_UI_HIDDEN_NODE_IDS = [
  "day1_living_loop_smile_0005",
  "day1_living_loop_smile_001",
  "day1_living_loop_smile_002",
  "day1_loop_title_001",
  "day1_loop_title_002",
  "day1_loop_title_003",
  "normal_loop_effect_001",
  "normal_loop_effect_002",
  "normal_loop_effect_003",
];

const isCinematicUiHidden = CINEMATIC_UI_HIDDEN_NODE_IDS.includes(node.id);
const shouldShowMainTextBox = node.type !== "effect";

const canShowLoopButton =
  !isButtonsHiddenAfterRouteA &&
  !isCinematicUiHidden &&
  !LOOP_BUTTON_HIDDEN_NODE_IDS.includes(node.id) &&
  (
    LOOP_BUTTON_START_NODE_IDS.includes(node.id) ||
    LOOP_BUTTON_START_NODE_IDS.some((id) =>
      state.visitedNodeIds.includes(id)
    )
  );

  const isNormalLoopEffect = node.id.startsWith("normal_loop_effect_");

const visualBackground =
  node.id === "loop_disabled_message_001" && loopDisabledVisual?.background
    ? loopDisabledVisual.background
    : isNormalLoopEffect && loopEffectVisual?.background
      ? loopEffectVisual.background
      : "background" in node && node.background
        ? node.background
        : null;

const visualCharacters =
  node.id === "loop_disabled_message_001" && loopDisabledVisual?.character
    ? [loopDisabledVisual.character]
    : isNormalLoopEffect && loopEffectVisual?.characters
      ? loopEffectVisual.characters
      : isNormalLoopEffect && loopEffectVisual?.character
        ? [loopEffectVisual.character]
        : "characters" in node && node.characters
          ? node.characters
          : "character" in node && node.character
            ? [node.character]
            : [];

const backgroundClass = visualBackground
  ? `bg-${visualBackground}`
  : `bg-day-${node.day}`;

  const [displayText, setDisplayText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [skipMode, setSkipMode] = useState(false);
  const [ctrlPressed, setCtrlPressed] = useState(false);
  const [mouthOpen, setMouthOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<ItemKey[]>([]);
  const [centerTextFadeOut, setCenterTextFadeOut] = useState(false);

  const typingTimerRef = useRef<number | null>(null);
const [showMiniGameStartButton, setShowMiniGameStartButton] = useState(false);

  const prevVisualRef = useRef<{
  background: string | null;
  character: StoryNode extends never ? never : any;
} | null>(null);

const [crossfadeFromVisual, setCrossfadeFromVisual] = useState<{
  background: string | null;
  character: {
    name: string;
    position: "left" | "center" | "right";
  } | null;
} | null>(null);

useEffect(() => {
  const currentBackground =
    "background" in node && node.background ? node.background : null;

  const currentCharacter =
    "character" in node && node.character
      ? node.character
      : null;

  const prev = prevVisualRef.current;

  if (
    node.type === "effect" &&
    node.crossfade === true &&
    prev &&
    prev.background &&
    prev.background !== currentBackground
  ) {
    setCrossfadeFromVisual(prev);

    const timer = window.setTimeout(() => {
      setCrossfadeFromVisual(null);
    }, node.durationMs);

    prevVisualRef.current = {
      background: currentBackground,
      character: currentCharacter,
    };

    return () => window.clearTimeout(timer);
  }

  setCrossfadeFromVisual(null);

  prevVisualRef.current = {
    background: currentBackground,
    character: currentCharacter,
  };
}, [node.id, node.type]);

function clearTypingTimer() {
  if (typingTimerRef.current !== null) {
    window.clearInterval(typingTimerRef.current);
    typingTimerRef.current = null;
  }
}

useEffect(() => {
  setCenterTextFadeOut(false);
  clearTypingTimer();
  setShowMiniGameStartButton(false);

  if (node.type !== "line") {
    setDisplayText("");
    setIsTyping(false);
    return;
  }

  const lineText = lang === "en" && node.textEn ? node.textEn : node.text;

  if (node.textAlign === "center") {
    setDisplayText(lineText);
    setIsTyping(false);
    return;
  }

  setDisplayText("");
  setIsTyping(true);

  let index = 0;
  const speed = ctrlPressed ? 1 : state.settings.textSpeed;

  typingTimerRef.current = window.setInterval(() => {
    index += 1;
    setDisplayText(lineText.slice(0, index));

    if (index >= lineText.length) {
      clearTypingTimer();
      setIsTyping(false);
    }
  }, speed);

  return () => {
    clearTypingTimer();
  };
}, [node.id, node.type, ctrlPressed, state.settings.textSpeed, lang]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Control") setCtrlPressed(true);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Control") setCtrlPressed(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  useEffect(() => {
    if (!autoMode) return;
    if (node.type !== "line") return;
    
    if (isTyping) return;

    const timer = window.setTimeout(() => {
      onNext();
    }, state.settings.autoSpeed);

    return () => window.clearTimeout(timer);
  }, [autoMode, node.id, node.type, isTyping, onNext, state.settings.autoSpeed]);

  useEffect(() => {
  if (!skipMode) return;

  if (isTyping) return;

  // 未読なら停止
  if (!state.visitedNodeIds.includes(node.id)) {
    setSkipMode(false);
    return;
  }

  // 選択肢なら停止
  if (node.type === "choice") {
    setSkipMode(false);
    return;
  }

  // アイテム選択なら停止
  if (node.type === "itemSelect") {
    setSkipMode(false);
    return;
  }

  // ミニゲームなら停止
  if (node.type === "miniGame") {
    setSkipMode(false);
    return;
  }

  // 強制ループ待機なら停止
  if (LOOP_WAIT_NODE_IDS.includes(node.id)) {
    setSkipMode(false);
    return;
  }

  const timer = window.setTimeout(() => {
    onNext();
  }, 40);

  return () => window.clearTimeout(timer);

}, [
  skipMode,
  node.id,
  node.type,
  isTyping,
  state.visitedNodeIds,
  onNext,
]);

  useEffect(() => {
  if (node.type === "itemSelect") {
    setSelectedItems([]);
  }
}, [node.id, node.type]);

useEffect(() => {
  if (!isArmLockedOpen) return;

  onOpenMemo();
}, [isArmLockedOpen, onOpenMemo]);

  function handleTextClick(e?: React.MouseEvent) {
  e?.preventDefault();
  e?.stopPropagation();

  if (node.type === "miniGame") {
    setShowMiniGameStartButton(true);
    return;
  }

  if (node.type !== "line") return;

  if (LOOP_WAIT_NODE_IDS.includes(node.id)) {
  return;
}

if (node.textAlign === "center") {
  setCenterTextFadeOut(true);

  window.setTimeout(() => {
    onNext();
  }, 500);

  return;
}

  if (isTyping) {
    const lineText = getCurrentLineText();
    clearTypingTimer();
    setDisplayText(lineText);
    setIsTyping(false);
    return;
  }

  onNext();
}

function getCurrentLineText() {
  if (node.type !== "line") return "";
  return lang === "en" && node.textEn ? node.textEn : node.text;
}

  useEffect(() => {
  if (node.type !== "line") {
    setMouthOpen(false);
    return;
  }

  if (!isTyping) {
    setMouthOpen(false);
    return;
  }

  const timer = window.setInterval(() => {
    setMouthOpen((prev) => !prev);
  }, 70);

  return () => {
    window.clearInterval(timer);
    setMouthOpen(false);
  };
}, [node.type, node.id, isTyping]);

useEffect(() => {
  if (node.type !== "effect") return;

  const timer = window.setTimeout(() => {
    onNext();
  }, node.durationMs);

  return () => window.clearTimeout(timer);
}, [node.id, node.type, onNext]);

useEffect(() => {
  if (!("background" in node)) return;
  if (!node.background) return;

  const currentImg = new Image();
  currentImg.src = `/backgrounds/${node.background}.webp`;

  if ("next" in node && node.next) {
    const nextNode = storyNodes[node.next];

    if (
      nextNode &&
      "background" in nextNode &&
      nextNode.background
    ) {
      const nextImg = new Image();
      nextImg.src = `/backgrounds/${nextNode.background}.webp`;
    }
  }
}, [node]);

  return (
    <div
  className={`novelScreen ${backgroundClass} ${
    "glitch" in node && node.glitch ? "screenGlitch" : ""
  } ${
    "overlay" in node && node.overlay === "loopVortex"
  ? "loopVortexScreen loopStrongGlitch"
  : ""
  }`}
  onClick={(e) => {
  if (node.type === "line" || node.type === "miniGame") {
    handleTextClick(e);
    return;
  }

  if (node.type === "bad" && node.next) {
    e.preventDefault();
    e.stopPropagation();
    onNext();
  }
}}
    >
{crossfadeFromVisual && (
  <div
    className="visualCrossfadeLayer"
    style={{
      animationDuration:
        node.type === "effect" ? `${node.durationMs}ms` : "1200ms",
    }}
  >
    {crossfadeFromVisual.background && (
      <div className={`visualCrossfadeBackground bg-${crossfadeFromVisual.background}`} />
    )}

    {crossfadeFromVisual.character &&
      CHARACTER_IMAGES[crossfadeFromVisual.character.name] && (
        <img
          className={`characterImage ${crossfadeFromVisual.character.position} visualCrossfadeCharacter`}
          src={CHARACTER_IMAGES[crossfadeFromVisual.character.name].closed}
          alt={crossfadeFromVisual.character.name}
        />
      )}
  </div>
)}
      {!isCinematicUiHidden && (
  <div className="topButtons">
    <button onClick={(e) => { e.stopPropagation(); onBackTitle(); }}>
      {t.title}
    </button>
    <button onClick={(e) => { e.stopPropagation(); onOpenSettings(); }}>
      {t.settings}
    </button>
    <button onClick={(e) => { e.stopPropagation(); onOpenLog(); }}>
      {t.log}
    </button>
  </div>
)}

      {canShowArmButton && !isCinematicUiHidden && (
  <button
    className="armButtonInText"
    disabled={isArmDisabled}
    onClick={(e) => {
      e.stopPropagation();

      if (isArmDisabled) return;

      onOpenMemo();
    }}
  >
    {t.arm}
  </button>
)}

{!isCinematicUiHidden &&
  (node.type === "line" || node.type === "choice" || node.type === "itemSelect") &&
  "overlay" in node &&
  node.overlay && (
    <div className={`effectOverlay ${node.overlay}`} />
)}

<div className="characterArea">
  {visualCharacters.map((ch) => {
    const imageSet = CHARACTER_IMAGES[ch.name];
    if (!imageSet) return null;

    const baseName =
  ch.name.match(/^[^a-zA-Z0-9]+/)?.[0] ?? ch.name;

const isSpeaking =
  node.type === "line" &&
  node.speaker === baseName &&
  isTyping &&
  mouthOpen;

    return (
        <img
  key={ch.position}
  className={`
  characterImage
  ${ch.position}
  ${
    (node.type === "line" || node.type === "effect") &&
    "characterFade" in node &&
    node.characterFade
      ? `characterFade-${node.characterFade}`
      : ""
  }
`}
        src={isSpeaking ? imageSet.open : imageSet.closed}
        alt={ch.name}
      />
    );
  })}
</div>

{node.type === "line" && node.screenTint === "red" && (
  <div className="screenTintRed" />
)}

{node.id === "day1_living_loop_014" && (
  <div className="loopDecisionOverlay" />
)}

      {shouldShowMainTextBox && (
  <div
    className={`textBox ${isCinematicUiHidden ? "textBoxInvisible" : ""}`}
    onClick={(e) => {
      if (node.type === "line") {
        handleTextClick(e);
        return;
      }

      e.stopPropagation();
    }}
  >
        {node.type === "line" && (
          <>
            {node.speaker && (
  <div className="speakerName">
    {getSpeakerName(node.speaker, lang)}
  </div>
)}
  <div
  className={`text ${
  node.type === "line" && node.textAlign === "center"
    ? `textCenter centerLineFadeIn ${
        centerTextFadeOut ? "centerLineFadeOut" : ""
      }`
    : ""
}`}
>
  {displayText}
</div>
          </>
        )}

<div
  style={{
    position: "absolute",//デバック用//
    top: 8,
    right: 12,
    color: "#ff4444",
    fontWeight: "bold",
    fontSize: "20px",
    zIndex: 9999,
    pointerEvents: "none",
  }}
>
  LOOP: {state.loopStock}
</div>

<div className="textBoxControls">
{canShowLoopButton && !isCinematicUiHidden && (
  <button
    className={`loopButtonInText pen-${penState}`}
    onClick={(e) => {
      e.stopPropagation();
      onOpenLoopConfirm();
    }}
  >
    {t.loop}
  </button>
)}

  <div className="textBoxBottomControls">
    <button
  type="button"
  onClick={(e) => {
    e.stopPropagation();
    setSkipMode(v => !v);
  }}
>
  {skipMode ? "スキップ中" : t.skip}
</button>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setAutoMode((v) => !v);
      }}
    >
      {autoMode ? (lang === "en" ? "Auto On" : "オート中") : t.auto}
    </button>
  </div>
</div>

        {node.type === "bad" && (
          <>
            <div className="speakerName">
  {lang === "en" && node.titleEn ? node.titleEn : node.title}
</div>
<div
  className={`text ${
    node.textAlign === "center"
      ? "textCenter"
      : ""
  }`}
>
  {lang === "en" && node.textEn ? node.textEn : node.text}
</div>
          </>
        )}

        {node.type === "end" && (
          <>
            <div className="speakerName">
  {lang === "en" && node.titleEn ? node.titleEn : node.title}
</div>
<div
  className={`text ${
    node.textAlign === "center"
      ? "textCenter"
      : ""
  }`}
>
  {lang === "en" && node.textEn ? node.textEn : node.text}
</div>
          </>
        )}

{node.type === "miniGame" && (
  <>
    <div className="speakerName">
      {lang === "en" && node.titleEn ? node.titleEn : node.title}
    </div>

    <div className="text">
      {lang === "en" && node.textEn ? node.textEn : node.text}
    </div>

    {showMiniGameStartButton && (
      <div className="miniGameStartInText">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMiniGameStart();
          }}
        >
          {lang === "en" ? "Start Surgery" : "手術開始"}
        </button>
      </div>
    )}
  </>
)}
             </div>
)}

{!isCinematicUiHidden && node.type === "itemSelect" && (
  <div className="itemSelectDarkOverlay" />
)}

{!isCinematicUiHidden && node.type === "itemSelect" && (
  <div className="itemSelectLayer">
    <div className="choiceQuestionText">
      {lang === "en" && node.textEn ? node.textEn : node.text}
    </div>

    <div className="itemSelectCount">
      最大{node.maxItems}つまで選択：{selectedItems.length}/{node.maxItems}
    </div>

    <div className="itemSelectChoices">
      {node.items.map((item) => {
        const selected = selectedItems.includes(item.key);
        const disabled = !selected && selectedItems.length >= node.maxItems;

        return (
          <button
            key={item.key}
            className={selected ? "selectedChoice" : ""}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();

              setSelectedItems((prev) => {
                if (prev.includes(item.key)) {
                  return prev.filter((key) => key !== item.key);
                }

                if (prev.length >= node.maxItems) {
                  return prev;
                }

                return [...prev, item.key];
              });
            }}
          >
            {selected ? "✓ " : ""}
            {lang === "en" && item.labelEn ? item.labelEn : item.label}
          </button>
        );
      })}
    </div>

    <button
      className="itemSelectSubmit"
      disabled={selectedItems.length === 0}
      onClick={(e) => {
        e.stopPropagation();
        onItemSelect(selectedItems, node.next);
      }}
    >
      {lang === "en" ? "Leave with these items" : "この持ち物で出発"}
    </button>
  </div>
)}

      {!isCinematicUiHidden && node.type === "choice" && (
  <div className="choiceLayer">
    <div className="choiceQuestionText">
      {lang === "en" && node.textEn ? node.textEn : node.text}
    </div>

    <div className="centerChoices">
      {node.choices.map((choice, index) => {
        const visible = canShowChoice(choice, state);
        if (!visible) return null;

        return (
          <button key={index} onClick={() => onChoice(index)}>
            {lang === "en" && choice.labelEn ? choice.labelEn : choice.label}
          </button>
        );
      })}
    </div>
  </div>
)}

      {node.type === "effect" && (
  <>
    {node.fade && (
      <div className={`screenFade fade-${node.fade}`} />
    )}

    {node.screenTint && (
      <div className={`screenTint tint-${node.screenTint}`} />
    )}

{node.overlay && (
  <>
        {node.overlay === "noiseText" ? (
          <div className="noiseTextImage" />
        ) : (
          <div className={`effectOverlay ${node.overlay}`} />
        )}
      </>
    )}

      {!isCinematicUiHidden && (node.speaker || node.text) && (
  <div className="textBox">
    {node.speaker && (
      <div className="speakerName">
        {getSpeakerName(node.speaker, lang)}
      </div>
    )}

    {node.text && (
      <div className={`text ${node.glitch ? "glitchText" : ""}`}>
        {lang === "en" && node.textEn ? node.textEn : node.text}
      </div>
    )}
  </div>
)}
  </>
)}
    </div>
  );
}