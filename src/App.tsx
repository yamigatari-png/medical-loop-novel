import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

import type { GameState, Settings, ItemKey, MiniGameId, Lang } from "./types";
import { storyNodes } from "./data/story";
import {
  applyNodeVisit,
  chooseOption,
  createInitialGameState,
  getCurrentNode,
  markLoopFirstDone,
  proceedLine,
  useLoopToLastChoice,
  selectItems,
  completeMiniGame,
} from "./engine/storyEngine";
import { clearSave, loadGame, saveGame } from "./engine/save";
import { NovelScreen } from "./components/NovelScreen";
import { ArmMemoModal } from "./components/ArmMemoModal";
import { RouteMapScreen } from "./components/RouteMapScreen";
import { LogModal } from "./components/LogModal";
import { SettingsModal } from "./components/SettingsModal";

import { MiniGameScreen } from "./components/MiniGameScreen";

type Screen = "logo" | "disclaimer" | "title" | "game" | "routeMap";

type StartDay = 1 | 2 | 3;

const MAIN_CLEAR_ENDING_IDS = ["route_a_true", "route_a_good"] as const;

const DAY_START_NODE_IDS: Record<StartDay, string> = {
  1: "day1_black_001",
  2: "day2_black_002",
  3: "day2_end_placeholder",
};

const DEFAULT_BGM_VOLUME = 0.5;
const DEFAULT_SE_VOLUME = 0.8;
const DEFAULT_CV_VOLUME = 0.6;

function clampVolume(value: number | undefined, fallback: number) {
  if (typeof value !== "number" || Number.isNaN(value)) return fallback;
  return Math.min(1, Math.max(0, value));
}

function normalizeSettings(settings: Settings): Settings {
  return {
    ...settings,
    bgmVolume: clampVolume(settings.bgmVolume, DEFAULT_BGM_VOLUME),
    seVolume: clampVolume(settings.seVolume, DEFAULT_SE_VOLUME),
    cvVolume: clampVolume(settings.cvVolume, DEFAULT_CV_VOLUME),
  };
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("logo");
  const [state, setState] = useState<GameState>(() => {
  const initial = createInitialGameState();
  const loaded = loadGame();

  if (!loaded) return initial;

  return {
    ...initial,
    ...loaded,
    settings: normalizeSettings({
  ...initial.settings,
  ...loaded.settings,
  bgmVolume: loaded.settings?.bgmVolume ?? DEFAULT_BGM_VOLUME,
}),
  };
});

  const [showMemo, setShowMemo] = useState(false);
  const [showMiniGame, setShowMiniGame] = useState(false);
  const [showLoopConfirm, setShowLoopConfirm] = useState(false);

  const [loopDisabledVisual, setLoopDisabledVisual] = useState<{
  background: string;
  character?: {
    name: string;
    position: "left" | "center" | "right";
  };
} | null>(null);

  const [pendingLoopTarget, setPendingLoopTarget] = useState<string | null>(null);

const [loopEffectVisual, setLoopEffectVisual] = useState<{
  background: string;
  character?: {
    name: string;
    position: "left" | "center" | "right";
  };
} | null>(null);

type LoopEffectCharacter = {
  name: string;
  position: "left" | "center" | "right";
};

function getLoopEffectCharacter(value: unknown): LoopEffectCharacter | undefined {
  if (typeof value !== "object" || value === null) return undefined;

  const character = value as {
    name?: unknown;
    position?: unknown;
  };

  if (typeof character.name !== "string") return undefined;

  if (
    character.position !== "left" &&
    character.position !== "center" &&
    character.position !== "right"
  ) {
    return undefined;
  }

  return {
    name: character.name,
    position: character.position,
  };
}

  const [showBadConfirm, setShowBadConfirm] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [titleMenuOpen, setTitleMenuOpen] = useState(false);

  const [startDayMenuOpen, setStartDayMenuOpen] = useState(false);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);
  const seRefs = useRef<HTMLAudioElement[]>([]);
  const loopingSeRefs = useRef<Record<string, HTMLAudioElement>>({});
  const cvRefs = useRef<HTMLAudioElement[]>([]);
  const pausedByBackgroundRef = useRef(false);
  const appActiveRef = useRef(true);

  const audioUnlockedRef = useRef(false);
  const screenRef = useRef<Screen>(screen);
  const requestedBgmSrcRef = useRef<string | null>(null);
  const bgmStoppedByStoryRef = useRef(false);

  const lastAudioNodeIdRef = useRef<string | null>(null);
  const pendingLoopBgmRestoreNodeIdRef = useRef<string | null>(null);
  const pendingLoopDisabledReturnNodeIdRef = useRef<string | null>(null);

  const node = useMemo(() => getCurrentNode(state), [state]);

  const hasClearedMainStory = state.seenEndings.some((endingId) =>
  MAIN_CLEAR_ENDING_IDS.includes(
    endingId as (typeof MAIN_CLEAR_ENDING_IDS)[number]
  )
);

  const SPECIAL_LOOP_TARGETS: Record<string, string> = {
  day1_icu_crisis_023: "day1_loop_001",
  day1_living_loop_014: "day1_loop2_001",
  day1_surgery_007: "day1_loop3_001",
  day1_fail_001: "day1_fail_002",
  day2_id_missing_002: "day2_id_missing_003",
  day2_no_aed_001:"day2_no_aed_002",
  day2_bus_no_aed_001:"day2_bus_no_aed_002",
  day2_clinic_review_bad_loop_0015:"day2_clinic_review_bad_loop_002",
  day2_anaphylaxis_loop_wait_001:"day2_anaphylaxis_loop_effect_001",
  day2_emergency_surgery_fail_002:"day2_emergency_surgery_fail_003",
  day2_shiori_not_returned_002:"day2_evening_choice_looped",
};

const MEMO_STORY_PROGRESS_NODE_IDS = [
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

const LOOP_ZERO_RESCUE_START_BY_DAY: Record<number, string> = {
  1: "day1_loop_title_004",
  2: "day2_morning_001",
  3: "day3_morning_001",
};

const LOOP_ZERO_RESCUE_ALLOWED_NODE_IDS = [
  "day1_icu_crisis_023",
  "day1_living_loop_014",
  "day1_surgery_007",
  "day1_fail_001",
  "day2_no_aed_001",

  "day1_badend_no_work",
  "day1_badend_walk",
  "day1_badend_bus",
  "day1_badend_gokon",
  "day1_badend_drink_drive",
  "day2_id_missing_002",
  "day2_no_aed_001",
  "day2_bus_no_aed_001",
  "day2_clinic_review_bad_loop_0015",
  "day2_anaphylaxis_loop_wait_001",
  "day2_emergency_surgery_fail_002",
  "day2_shiori_not_returned_002",

  // Day3 強制ループ待機
  "day3_keep_silent_0015",
  "day3_loop_disabled_0015",

  // Day3 BadEnd
  "day3_keep_silent_bad_end",
  "day3_remove_gauze_bad_end",
  "day3_run_away_bad_end",
  "day3_blame_takamiya_bad_end",
  "day3_blame_bad_end",
];

const NORMAL_LOOP_ALLOWED_NODE_IDS = [
  "day1_living_loop_015",
  "day1_loop_title_004",
  "day2_morning_001",
  "day3_chase_wakeup_001",

  // デバッグ用。day1_black_001 から直接飛ばして確認するため
  "day2_evening_choice_first",
];

function getLoopCapTarget(nodeId: string): string | null {
  if (
    nodeId === "day1_living_loop_015" ||
    nodeId === "day1_living_loop_0155" ||
    nodeId.startsWith("day1_living_loop_catch_") ||
    nodeId.startsWith("day1_living_loop_smile_")
  ) {
    return "day1_loop2_004";
  }

  return null;
}

function clampLoopTargetToCap(
  targetNodeId: string,
  capNodeId: string
): string {
  const targetIndex = state.visitedNodeIds.lastIndexOf(targetNodeId);
  const capIndex = state.visitedNodeIds.lastIndexOf(capNodeId);

  if (capIndex === -1) return targetNodeId;
  if (targetIndex === -1) return capNodeId;

  return targetIndex < capIndex ? capNodeId : targetNodeId;
}

const [forcedMemoOpen, setForcedMemoOpen] = useState(false);
const [loopZeroRescueDay, setLoopZeroRescueDay] = useState<number>(1);

const canProgressWithMemoOpen =
  showMemo && MEMO_STORY_PROGRESS_NODE_IDS.includes(node.id);

  if (!node) {
  return (
    <div className="titleScreen">
      <h1>読み込みエラー</h1>
      <p>現在のセーブデータが古いストーリーIDを参照しています。</p>
      <button
        onClick={() => {
          clearSave();
          window.location.reload();
        }}
      >
        セーブを削除して再起動
      </button>
    </div>
  );
}

  useEffect(() => {
  const current = storyNodes[state.currentNodeId];
  if (!current) return;

  if (
    state.currentNodeId === "day1_bicycle_action_choice" &&
    (
      state.visitedNodeIds.includes("day1_return_station") ||
      state.visitedNodeIds.includes("day1_bicycle_return_station")
    )
  ) {
    setLoopZeroRescueDay("day" in node ? node.day : 1);

    setState((prev) => ({
      ...prev,
      currentNodeId: "day1_return_station",
    }));
    return;
  }

    setState((prev) => {
    const visited = applyNodeVisit(prev, current);

    if (current.id === "day3_gauze_choice_001") {
      return {
        ...visited,
        flags: {
          ...visited.flags,
          loop_disabled: true,
        },
      };
    }

    return visited;
  });
}, [state.currentNodeId, state.visitedNodeIds]);

  useEffect(() => {
    saveGame(state);
  }, [state]);

  useEffect(() => {
  const handleContextMenu = (e: MouseEvent) => {
    e.preventDefault();
    setShowLog(true);
  };

  window.addEventListener("contextmenu", handleContextMenu);

  return () => {
    window.removeEventListener("contextmenu", handleContextMenu);
  };
}, []);

useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      setShowSettings((prev) => !prev);
    }
  };

  window.addEventListener("keydown", handleKeyDown);

  return () => {
    window.removeEventListener("keydown", handleKeyDown);
  };
}, []);

useEffect(() => {
  setShowMiniGame(false);
}, [node.id]);

useEffect(() => {
  if (!forcedMemoOpen) return;

  if (!MEMO_STORY_PROGRESS_NODE_IDS.includes(node.id)) {
    setShowMemo(false);
    setForcedMemoOpen(false);
  }
}, [node.id, forcedMemoOpen]);

useEffect(() => {
  document.body.classList.toggle("armMemoOpen", showMemo);

  return () => {
    document.body.classList.remove("armMemoOpen");
  };
}, [showMemo]);

  function startNewGame(startDay: StartDay = 1) {
  stopBgm();
  stopOneShotSE();
  stopAllLoopingSE();

  lastAudioNodeIdRef.current = null;
  setTitleMenuOpen(false);
  setStartDayMenuOpen(false);

  const currentLang: Lang = state.settings.lang ?? "ja";
  const initial = createInitialGameState();
  const startNodeId = DAY_START_NODE_IDS[startDay];

  clearSave();

  setState({
    ...initial,
    currentNodeId: startNodeId,
    loopStock: initial.loopStock,
    lastChoiceNodeId: null,
    visitedNodeIds: [],
    log: [],
    seenEndings: state.seenEndings,
    settings: normalizeSettings({
      ...initial.settings,
      ...state.settings,
      bgmVolume: state.settings.bgmVolume ?? DEFAULT_BGM_VOLUME,
      lang: currentLang,
    }),
  });

  setScreen("game");
}

function handleNewGameFromTitle() {
  if (!hasClearedMainStory) {
    startNewGame(1);
    return;
  }

  setStartDayMenuOpen(true);
}

useEffect(() => {
  if (screen === "logo") {
    const timer = window.setTimeout(() => {
      setScreen("disclaimer");
    }, 1800);

    return () => window.clearTimeout(timer);
  }

  if (screen === "disclaimer") {
  const timer = window.setTimeout(() => {
    setScreen("title");
  }, 1500);

    return () => window.clearTimeout(timer);
  }
}, [screen]);

useEffect(() => {
  if (screen !== "title") return;
  if (!audioUnlockedRef.current && !audioUnlocked) return;

  playBgm("/bgm/title.mp3");
}, [screen, audioUnlocked]);

  function continueGame() {
      stopBgm();
      stopOneShotSE();
      stopAllLoopingSE();
      lastAudioNodeIdRef.current = null;
  const loaded = loadGame();

  if (loaded) {
    setState({
      ...loaded,
      settings: normalizeSettings({
  ...createInitialGameState().settings,
  ...loaded.settings,
  bgmVolume: loaded.settings?.bgmVolume ?? DEFAULT_BGM_VOLUME,
  lang: loaded.settings?.lang ?? state.settings.lang ?? "ja",
}),
    });
  }

  setScreen("game");
}

useEffect(() => {
  if (node.type !== "end") return;

  setState((prev) => ({
    ...prev,
    seenEndings: prev.seenEndings.includes(node.endingId)
      ? prev.seenEndings
      : [...prev.seenEndings, node.endingId],
  }));
}, [node.id, node.type]);

useEffect(() => {
  if (node.type !== "bad") return;

  setState((prev) => ({
    ...prev,
    seenEndings: prev.seenEndings.includes(node.id)
      ? prev.seenEndings
      : [...prev.seenEndings, node.id],
  }));
}, [node.id, node.type]);

  function handleNext() {
  if (showMemo && !canProgressWithMemoOpen) return;

  if (node.id === "day1_icu_crisis_023") return;

    if (
    node.id === "day3_keep_silent_0015" ||
    node.id === "day3_loop_disabled_0015"
  ) {
    return;
  }

  if (node.type === "line") {
  addLog(node.speaker, node.text);

    if (node.id === "loop_disabled_message_001") {
  const returnNodeId =
    pendingLoopDisabledReturnNodeIdRef.current &&
    pendingLoopDisabledReturnNodeIdRef.current !== "loop_disabled_message_001"
      ? pendingLoopDisabledReturnNodeIdRef.current
      : state.lastChoiceNodeId ?? "day1_loop_title_004";

  pendingLoopDisabledReturnNodeIdRef.current = null;

  setState((prev) => ({
    ...prev,
    currentNodeId: returnNodeId,
    visitedNodeIds: prev.visitedNodeIds.includes(returnNodeId)
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, returnNodeId],
  }));

  return;
}
  
    if (node.id === "day3_route_a_branch_001") {
    const nextId = state.visitedNodeIds.includes("loop_zero_rescue_002")
      ? "day3_route_a_transfer_001"
      : "day3_route_a_no_transfer_001";

    setState((prev) => ({
      ...prev,
      currentNodeId: nextId,
      visitedNodeIds: prev.visitedNodeIds.includes(nextId)
        ? prev.visitedNodeIds
        : [...prev.visitedNodeIds, nextId],
    }));
    return;
  }
  
  if (
    node.id === "day2_patient_room_005" &&
    state.visitedNodeIds.includes("day2_painkiller_choice_looped")
  ) {
    setState((prev) => ({
      ...prev,
      currentNodeId: "day2_painkiller_choice_looped",
      visitedNodeIds: prev.visitedNodeIds.includes("day2_painkiller_choice_looped")
        ? prev.visitedNodeIds
        : [...prev.visitedNodeIds, "day2_painkiller_choice_looped"],
    }));
    return;
  }

    if (
    node.id === "day2_evening_hospital_0025" &&
    state.visitedNodeIds.includes("day2_evening_choice_looped")
  ) {
    setState((prev) => ({
      ...prev,
      currentNodeId: "day2_evening_choice_looped",
      visitedNodeIds: prev.visitedNodeIds.includes("day2_evening_choice_looped")
        ? prev.visitedNodeIds
        : [...prev.visitedNodeIds, "day2_evening_choice_looped"],
    }));
    return;
  }

  if (
  node.id === "day2_go_home_003" &&
  state.visitedNodeIds.includes("day2_er_admit_004")
) {
  setState((prev) => ({
    ...prev,
    currentNodeId: "day2_go_home_017",
    visitedNodeIds: prev.visitedNodeIds.includes("day2_go_home_017")
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, "day2_go_home_017"],
  }));
  return;
}

  setState((prev) => proceedLine(prev));
  return;
}

if (node.type === "bad" && node.next) {
  setState((prev) => ({
    ...prev,
    currentNodeId: node.next!,
    visitedNodeIds: prev.visitedNodeIds.includes(node.next!)
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, node.next!],
  }));
  return;
}

  if (node.type === "effect") {
  if (node.id === "normal_loop_effect_003" && pendingLoopTarget) {
  lastAudioNodeIdRef.current = null;
  pendingLoopBgmRestoreNodeIdRef.current = pendingLoopTarget;

  setState((prev) => ({
    ...prev,
    currentNodeId: pendingLoopTarget,
    visitedNodeIds: prev.visitedNodeIds.includes(pendingLoopTarget)
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, pendingLoopTarget],
  }));

  setPendingLoopTarget(null);
  setLoopEffectVisual(null);
  return;
}

  if (node.id === "loop_zero_rescue_003") {
  const rescueTarget =
    LOOP_ZERO_RESCUE_START_BY_DAY[loopZeroRescueDay] ?? "day1_loop_title_004";

  setState((prev) => ({
    ...prev,
    loopStock: prev.loopStock + 15,
    currentNodeId: rescueTarget,
    visitedNodeIds: prev.visitedNodeIds.includes(rescueTarget)
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, rescueTarget],
  }));

  return;
}

  setState((prev) => ({
    ...prev,
    currentNodeId: node.next,
    visitedNodeIds: prev.visitedNodeIds.includes(node.next)
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, node.next],
  }));
  return;
}
}

  function addLog(speaker: string | undefined, text: string) {
  setState((prev) => ({
    ...prev,
    log: [...prev.log, { speaker, text }],
  }));
}

function updateSettings(settings: Settings) {
  setState((prev) => ({
    ...prev,
    settings,
  }));
}

useEffect(() => {
  if (!bgmRef.current) return;
  bgmRef.current.volume = state.settings.bgmVolume ?? 0.7;
}, [state.settings.bgmVolume]);

useEffect(() => {
  screenRef.current = screen;
}, [screen]);

function fadeOutAudio(
  audio: HTMLAudioElement,
  durationMs = 800,
  onDone?: () => void
) {
  const startVolume = clampVolume(audio.volume, 1);
  const startTime = performance.now();

  function tick(now: number) {
    const progress = Math.min(1, (now - startTime) / durationMs);
    audio.volume = clampVolume(startVolume * (1 - progress), 0);

    if (progress < 1) {
      requestAnimationFrame(tick);
      return;
    }

    audio.pause();
    audio.currentTime = 0;
    audio.volume = clampVolume(startVolume, 1);
    onDone?.();
  }

  requestAnimationFrame(tick);
}

function playBgm(src: string) {
  requestedBgmSrcRef.current = src;

  const currentSrc = bgmRef.current?.getAttribute("data-src");

  if (currentSrc === src && bgmRef.current) {
    bgmRef.current.volume = state.settings.bgmVolume ?? 0.8;
    bgmRef.current.play().catch((err) => {
      console.warn("[BGM] play failed:", err);
    });
    return;
  }

  if (bgmRef.current) {
  fadeOutAudio(bgmRef.current, 800);
}

  const bgm = new Audio(src);
  bgm.loop = true;
  bgm.volume = state.settings.bgmVolume ?? 0.8;
  bgm.preload = "auto";
  bgm.setAttribute("data-src", src);

  bgmRef.current = bgm;

  bgm.play().catch((err) => {
    console.warn("[BGM] play failed:", err);
  });
}

function unlockAudio() {
  if (!appActiveRef.current) return;
  if (document.hidden) return;
  if (!document.hasFocus()) return;

  audioUnlockedRef.current = true;
  setAudioUnlocked(true);

  if (screenRef.current === "title") {
    playBgm("/bgm/title.mp3");
  }
}

useEffect(() => {
  const handleUserOperation = () => {
  if (!appActiveRef.current) return;
  if (document.hidden) return;
  if (!document.hasFocus()) return;

  audioUnlockedRef.current = true;
  setAudioUnlocked(true);

  if (screenRef.current === "title") {
    playBgm("/bgm/title.mp3");
  }
};

  const options: AddEventListenerOptions = {
    passive: true,
  };

  window.addEventListener("mousemove", handleUserOperation, options);
  window.addEventListener("pointermove", handleUserOperation, options);
  window.addEventListener("mouseover", handleUserOperation, options);
  window.addEventListener("pointerover", handleUserOperation, options);
  window.addEventListener("pointerdown", handleUserOperation, options);
  window.addEventListener("mousedown", handleUserOperation, options);
  window.addEventListener("click", handleUserOperation, options);
  window.addEventListener("keydown", handleUserOperation, options);
  window.addEventListener("touchstart", handleUserOperation, options);
  window.addEventListener("wheel", handleUserOperation, options);

  return () => {
    window.removeEventListener("mousemove", handleUserOperation);
    window.removeEventListener("pointermove", handleUserOperation);
    window.removeEventListener("mouseover", handleUserOperation);
    window.removeEventListener("pointerover", handleUserOperation);
    window.removeEventListener("pointerdown", handleUserOperation);
    window.removeEventListener("mousedown", handleUserOperation);
    window.removeEventListener("click", handleUserOperation);
    window.removeEventListener("keydown", handleUserOperation);
    window.removeEventListener("touchstart", handleUserOperation);
    window.removeEventListener("wheel", handleUserOperation);
  };
}, [state.settings.bgmVolume]);

function stopBgm(fade = false) {
  if (!bgmRef.current) return;

  const currentBgm = bgmRef.current;

  if (!fade) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
    bgmRef.current = null;
    return;
  }

  bgmRef.current = null;

  fadeOutAudio(currentBgm, 800);
}

function findLatestBgmForCurrentPosition(): string | null {
  const visitedIds = [...state.visitedNodeIds, state.currentNodeId];

  for (let i = visitedIds.length - 1; i >= 0; i -= 1) {
    const visitedNode = storyNodes[visitedIds[i]];

    if (!visitedNode) continue;
    if (!("bgm" in visitedNode)) continue;
    if (!visitedNode.bgm) continue;

    if (visitedNode.bgm === "none" || visitedNode.bgm === "stopBgm") {
  return null;
}

    return `/bgm/${visitedNode.bgm}.mp3`;
  }

  return null;
}

function findLatestBgmForNodePosition(nodeId: string): string | null {
  const targetIndex = state.visitedNodeIds.lastIndexOf(nodeId);

  const visitedIds =
    targetIndex >= 0
      ? state.visitedNodeIds.slice(0, targetIndex + 1)
      : [...state.visitedNodeIds, nodeId];

  for (let i = visitedIds.length - 1; i >= 0; i -= 1) {
    const visitedNode = storyNodes[visitedIds[i]];

    if (!visitedNode) continue;
    if (!("bgm" in visitedNode)) continue;
    if (!visitedNode.bgm) continue;

    if (visitedNode.bgm === "none" || visitedNode.bgm === "stopBgm") {
      return null;
    }

    return `/bgm/${visitedNode.bgm}.mp3`;
  }

  return null;
}

function playSE(key: string) {
  if (!audioUnlocked) return;

  const se = new Audio(`/se/${key}.mp3`);
  se.volume = clampVolume(state.settings.seVolume, DEFAULT_SE_VOLUME);

  seRefs.current.push(se);

  se.onended = () => {
    seRefs.current = seRefs.current.filter((a) => a !== se);
  };

  se.play().catch(() => {});
}

function stopOneShotSE() {
  seRefs.current.forEach((audio) => {
    audio.pause();
    audio.currentTime = 0;
  });

  seRefs.current = [];
}

function syncLoopingSE(keys: string[]) {
  Object.entries(loopingSeRefs.current).forEach(([key, audio]) => {
    if (!keys.includes(key)) {
  delete loopingSeRefs.current[key];
  fadeOutAudio(audio, 600);
}
  });

  keys.forEach((key) => {
    if (loopingSeRefs.current[key]) return;
    if (!audioUnlocked) return;

    const se = new Audio(`/se/${key}.mp3`);
    se.loop = true;
    se.volume = clampVolume(state.settings.seVolume, DEFAULT_SE_VOLUME);

    loopingSeRefs.current[key] = se;

    se.play().catch(() => {});
  });
}

function stopAllLoopingSE(fade = false) {
  Object.values(loopingSeRefs.current).forEach((audio) => {
    if (fade) {
      fadeOutAudio(audio, 600);
    } else {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  loopingSeRefs.current = {};
}

function playCV(key: string) {
  if (!audioUnlocked) return;

  const cv = new Audio(`/cv/${key}.mp3`);
  cv.volume = clampVolume(state.settings.cvVolume, DEFAULT_CV_VOLUME);

  cvRefs.current.push(cv);

  cv.onended = () => {
    cvRefs.current = cvRefs.current.filter((a) => a !== cv);
  };

  cv.play().catch(() => {});
}

function playClickSE(volumeOverride?: number) {
  const click = new Audio("/se/click.mp3");
  click.volume = clampVolume(
  volumeOverride ?? state.settings.seVolume,
  DEFAULT_SE_VOLUME
);
  click.currentTime = 0;
  click.play().catch((err) => {
    console.warn("[ClickSE] play failed:", err);
  });
}

useEffect(() => {
  const handleGlobalClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    if (target.tagName.toLowerCase() === "input") return;

    playClickSE();
  };

  window.addEventListener("click", handleGlobalClick, true);

  return () => {
    window.removeEventListener("click", handleGlobalClick, true);
  };
}, [audioUnlocked, state.settings.seVolume]);

useEffect(() => {
  const pauseAllAudio = () => {
    appActiveRef.current = false;
    pausedByBackgroundRef.current = true;

    bgmRef.current?.pause();

    seRefs.current.forEach((audio) => {
      audio.pause();
    });

    Object.values(loopingSeRefs.current).forEach((audio) => {
      audio.pause();
    });

    cvRefs.current.forEach((audio) => {
      audio.pause();
    });
  };

  const resumeAllAudio = () => {
    appActiveRef.current = true;

    if (!pausedByBackgroundRef.current) return;
    pausedByBackgroundRef.current = false;

    if (!audioUnlockedRef.current && !audioUnlocked) return;

    bgmRef.current?.play().catch((err) => {
      console.warn("[BGM] resume failed:", err);
    });

    Object.values(loopingSeRefs.current).forEach((audio) => {
      if (!audio.ended) {
        audio.play().catch(() => {});
      }
    });

    cvRefs.current.forEach((audio) => {
      if (!audio.ended) {
        audio.play().catch(() => {});
      }
    });
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      pauseAllAudio();
      return;
    }

    resumeAllAudio();
  };

  window.addEventListener("blur", pauseAllAudio);
  window.addEventListener("focus", resumeAllAudio);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  return () => {
    window.removeEventListener("blur", pauseAllAudio);
    window.removeEventListener("focus", resumeAllAudio);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  };
}, [audioUnlocked]);

useEffect(() => {
  if (!audioUnlocked) return;
  if (screen !== "game") return;

  if (lastAudioNodeIdRef.current === node.id) return;
  lastAudioNodeIdRef.current = node.id;

  const shouldRestoreLoopBgm =
  pendingLoopBgmRestoreNodeIdRef.current === node.id;

if (shouldRestoreLoopBgm) {
  pendingLoopBgmRestoreNodeIdRef.current = null;

  const loopBgm = findLatestBgmForNodePosition(node.id);

  if (loopBgm) {
    bgmStoppedByStoryRef.current = false;
    playBgm(loopBgm);
  } else {
    bgmStoppedByStoryRef.current = true;
    requestedBgmSrcRef.current = null;
    stopBgm(true);
  }
} else if ("bgm" in node && node.bgm) {
  if (node.bgm === "none" || node.bgm === "stopBgm") {
    bgmStoppedByStoryRef.current = true;
    requestedBgmSrcRef.current = null;
    stopBgm(true);
  } else {
    bgmStoppedByStoryRef.current = false;
    playBgm(`/bgm/${node.bgm}.mp3`);
  }
} else {
  // bgm: "stopBgm" / "none" の後は、次に明示的な bgm が出るまで無音維持
  if (!bgmStoppedByStoryRef.current && !bgmRef.current) {
    const latestBgm = findLatestBgmForCurrentPosition();

    if (latestBgm) {
      playBgm(latestBgm);
    }
  }
}

  stopOneShotSE();

  const loopSeKeys =
    "seLoop" in node && node.seLoop ? node.seLoop : [];

  syncLoopingSE(loopSeKeys);

  if ("se" in node && node.se) {
    node.se.forEach((key) => playSE(key));
  }

  if ("cv" in node && node.cv) {
    playCV(node.cv);
  }
}, [
  node.id,
  audioUnlocked,
  screen,
  state.currentNodeId,
  state.visitedNodeIds,
]);

const displayNode = useMemo(() => {
  if (node.type !== "choice") return node;

  if (node.id !== "day1_station_transport_choice") return node;

  if (state.flags.day1_last_transport_was_bicycle) {
    return node;
  }

  return {
    ...node,
    choices: node.choices.filter(
      (choice) => choice.next !== "day1_station_bicycle_001"
    ),
  };
}, [node, state.flags.day1_last_transport_was_bicycle]);

  function handleChoice(index: number) {
  if (showMemo && !canProgressWithMemoOpen) return;
  if (displayNode.type !== "choice") return;

  const choice = displayNode.choices[index];

  setState((prev) => {
    const nextState = chooseOption(prev, choice);

    if (node.id === "day1_transport_choice") {
      return {
        ...nextState,
        flags: {
          ...nextState.flags,
          day1_last_transport_was_bicycle:
            choice.next === "day1_bicycle_001",
        },
      };
    }

    return nextState;
  });
}

  function handleMiniGameFinish(success: boolean) {
  if (node.type !== "miniGame") return;

  const nextNodeId = success ? node.successNext : node.failNext;
  const nextNode = storyNodes[nextNodeId];

  setState((prev) =>
    completeMiniGame(
      prev,
      node.miniGameId,
      success,
      node.successNext,
      node.failNext
    )
  );

  setShowMiniGame(false);

  if (nextNode && "bgm" in nextNode && nextNode.bgm) {
    if (nextNode.bgm === "none") {
      stopBgm();
    } else {
      playBgm(`/bgm/${nextNode.bgm}.mp3`);
    }
  } else {
    stopBgm();
  }
}

  function handleItemSelect(items: ItemKey[], nextNodeId: string) {
  setState((prev) => selectItems(prev, items, nextNodeId));
}

function handleMiniGameResult(
  miniGameId: MiniGameId,
  success: boolean,
  successNext: string,
  failNext: string
) {
  setState((prev) =>
    completeMiniGame(prev, miniGameId, success, successNext, failNext)
  );
}

function handleLoopButtonPress() {
  setShowMemo(false);

    if (node.id === "loop_disabled_message_001") {
    return;
  }

    if (node.id === "day3_keep_silent_0015") {
    setState((prev) => ({
      ...prev,
      currentNodeId: "day3_keep_silent_002",
      visitedNodeIds: prev.visitedNodeIds.includes("day3_keep_silent_002")
        ? prev.visitedNodeIds
        : [...prev.visitedNodeIds, "day3_keep_silent_002"],
    }));
    return;
  }

  if (node.id === "day3_loop_disabled_0015") {
  setState((prev) => ({
    ...prev,
    currentNodeId: "day3_loop_disabled_002",
    visitedNodeIds: prev.visitedNodeIds.includes("day3_loop_disabled_002")
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, "day3_loop_disabled_002"],
  }));
  return;
}

    if (state.flags.loop_disabled) {
    return;
  }

  if (state.loopStock <= 0) {
  if (!LOOP_ZERO_RESCUE_ALLOWED_NODE_IDS.includes(node.id)) {
    pendingLoopDisabledReturnNodeIdRef.current = node.id;

    const currentBackground =
  "background" in node && node.background
    ? node.background
    : "black";

const currentCharacter =
  "character" in node
    ? getLoopEffectCharacter(node.character)
    : undefined;

setLoopDisabledVisual({
  background: currentBackground,
  character: currentCharacter,
});

    setState((prev) => ({
      ...prev,
      currentNodeId: "loop_disabled_message_001",
      visitedNodeIds: prev.visitedNodeIds.includes("loop_disabled_message_001")
        ? prev.visitedNodeIds
        : [...prev.visitedNodeIds, "loop_disabled_message_001"],
    }));

    return;
  }

  setLoopZeroRescueDay("day" in node ? node.day : 1);

  setState((prev) => ({
    ...prev,
    currentNodeId: "loop_zero_rescue_001",
    visitedNodeIds: prev.visitedNodeIds.includes("loop_zero_rescue_001")
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, "loop_zero_rescue_001"],
  }));

  return;
}

    if (node.type === "bad" || node.type === "end") {
    const targetNodeId = state.lastChoiceNodeId ?? "day1_loop_title_004";

    const currentBackground =
      "background" in node && node.background ? node.background : "black";

    const currentCharacter =
      "character" in node ? getLoopEffectCharacter(node.character) : undefined;

    setPendingLoopTarget(targetNodeId);

    setLoopEffectVisual({
      background: currentBackground,
      character: currentCharacter,
    });

    setState((prev) => ({
      ...prev,
      loopStock: Math.max(0, prev.loopStock - 1),
      currentNodeId: "normal_loop_effect_001",
      visitedNodeIds: prev.visitedNodeIds.includes("normal_loop_effect_001")
        ? prev.visitedNodeIds
        : [...prev.visitedNodeIds, "normal_loop_effect_001"],
    }));

    return;
  }

  const specialTarget = SPECIAL_LOOP_TARGETS[node.id];

  if (specialTarget) {
    setState((prev) => ({
      ...prev,
      loopStock: Math.max(0, prev.loopStock - 1),
      currentNodeId: specialTarget,
      visitedNodeIds: prev.visitedNodeIds.includes(specialTarget)
        ? prev.visitedNodeIds
        : [...prev.visitedNodeIds, specialTarget],
    }));
    return;
  }

  const normalLoopUnlocked =
    NORMAL_LOOP_ALLOWED_NODE_IDS.includes(node.id) ||
    NORMAL_LOOP_ALLOWED_NODE_IDS.some((id) =>
      state.visitedNodeIds.includes(id)
    );

  if (!normalLoopUnlocked) {
    return;
  }

    let targetNodeId =
  (node.type === "choice" ||
    node.type === "line" ||
    node.type === "itemSelect") &&
  node.loopBackTo
    ? node.loopBackTo
    : state.lastChoiceNodeId ?? "day1_loop_title_004";

      const loopCapTarget = getLoopCapTarget(node.id);

if (loopCapTarget) {
  targetNodeId = clampLoopTargetToCap(targetNodeId, loopCapTarget);
}

if (state.visitedNodeIds.includes("day1_loop_title_004")) {
  targetNodeId = clampLoopTargetToCap(targetNodeId, "day1_loop_title_004");
}

  const currentBackground =
    "background" in node && node.background ? node.background : "black";

  const currentCharacter =
    "character" in node ? getLoopEffectCharacter(node.character) : undefined;

  setPendingLoopTarget(targetNodeId);

  setLoopEffectVisual({
    background: currentBackground,
    character: currentCharacter,
  });

  setState((prev) => ({
    ...prev,
    loopStock: Math.max(0, prev.loopStock - 1),
    currentNodeId: "normal_loop_effect_001",
    visitedNodeIds: prev.visitedNodeIds.includes("normal_loop_effect_001")
      ? prev.visitedNodeIds
      : [...prev.visitedNodeIds, "normal_loop_effect_001"],
  }));
}

  function confirmNormalLoop() {
  setState((prev) => {
    if (prev.loopStock <= 0) return prev;
    if (!prev.lastChoiceNodeId) return prev;

    const looped = useLoopToLastChoice({
      ...prev,
      loopStock: Math.max(0, prev.loopStock - 1),
    });

    return markLoopFirstDone(looped);
  });

  setShowLoopConfirm(false);
}

  function handleBadLoopToChoice() {
  setState((prev) => {
    if (prev.loopStock <= 0) {
      return {
        ...prev,
        currentNodeId: "loop_zero_rescue_001",
        visitedNodeIds: prev.visitedNodeIds.includes("loop_zero_rescue_001")
          ? prev.visitedNodeIds
          : [...prev.visitedNodeIds, "loop_zero_rescue_001"],
      };
    }

    const looped = useLoopToLastChoice(prev);
    return markLoopFirstDone(looped);
  });

  setShowBadConfirm(false);
}

  function handleBadBackTitle() {
  setShowBadConfirm(false);
  stopOneShotSE();
  stopAllLoopingSE(true);
  stopBgm(true);
  setScreen("title");
}

  function renderSettingsModal() {
  return (
    <>
      {showSettings && (
        <SettingsModal
          settings={state.settings}
          onChange={updateSettings}
          onClose={() => setShowSettings(false)}
          onClickSE={playClickSE}
        />
      )}
    </>
  );
}

  if (screen === "logo") {
  return (
    <div className="appFrame">
      <div
        className="splashScreen logoSplash"
        onMouseMove={unlockAudio}
        onPointerMove={unlockAudio}
        onPointerDown={unlockAudio}
        onClick={() => setScreen("disclaimer")}
      >
        <img
          className="circleLogo"
          src="/ui/circle_logo.webp"
          alt="Circle Logo"
        />
      </div>
    </div>
  );
}

if (screen === "disclaimer") {
  return (
    <div className="appFrame">
      <div
        className="splashScreen disclaimerSplash"
        onMouseMove={unlockAudio}
        onPointerMove={unlockAudio}
        onPointerDown={unlockAudio}
        onClick={() => setScreen("title")}
      >
        <div className="disclaimerText">
  <div className="disclaimerBlock disclaimerJa">
    <p>この物語はフィクションです。</p>
    <p>実在の人物・団体・地名・事件・症例などとは一切関係ありません。</p>
    <p>本作は医療行為の助言や、実際の診療内容を示すものではありません。</p>
  </div>

  <div className="disclaimerBlock disclaimerEn">
    <p>This work is fiction.</p>
    <p>
      Any resemblance to actual persons, organizations, places, events, or
      medical cases is purely coincidental.
    </p>
    <p>
      This story is not intended to provide medical advice or represent actual
      clinical practice.
    </p>
  </div>
</div>
      </div>
    </div>
  );
}

  if (screen === "title") {
  const isEn = state.settings.lang === "en";

  return (
    <div className="appFrame">
      <div
  className="titleScreenWithBg"
  onMouseMove={unlockAudio}
  onPointerMove={unlockAudio}
  onPointerDown={unlockAudio}
  onClick={() => setTitleMenuOpen(true)}
>
        <button
          className="langButton"
          onClick={(e) => {
            e.stopPropagation();
            setState((prev) => ({
              ...prev,
              settings: {
                ...prev.settings,
                lang: prev.settings.lang === "en" ? "ja" : "en",
              },
            }));
          }}
        >
          {isEn ? "日本語" : "EN"}
        </button>

        {!titleMenuOpen && (
          <div className="titleClickGuide">
            {isEn ? "Click to Start" : "クリックして開始"}
          </div>
        )}

        {titleMenuOpen && (
          <div
            className="titleMenuPanel"
            onClick={(e) => e.stopPropagation()}
          >
           {!startDayMenuOpen ? (
  <>
    <button onClick={handleNewGameFromTitle}>
      {isEn ? "New Game" : "はじめから"}
    </button>

    <button onClick={continueGame}>
      {isEn ? "Continue" : "つづきから"}
    </button>

    <button onClick={() => setScreen("routeMap")}>
  {isEn ? "Route Map" : "ルートマップ"}
</button>

    <button
      onClick={(e) => {
        e.stopPropagation();
        setShowSettings(true);
      }}
    >
      {isEn ? "Settings" : "設定"}
    </button>
  </>
) : (
  <>
    <button onClick={() => startNewGame(1)}>
      {isEn ? "Day 1 / Oct 10" : "Day1 / 10月10日"}
    </button>

    <button onClick={() => startNewGame(2)}>
      {isEn ? "Day 2 / Oct 11" : "Day2 / 10月11日"}
    </button>

    <button onClick={() => startNewGame(3)}>
      {isEn ? "Day 3 / Oct 12" : "Day3 / 10月12日"}
    </button>

    <button onClick={() => setStartDayMenuOpen(false)}>
      {isEn ? "Back" : "戻る"}
    </button>
  </>
)}
          </div>
        )}

        {renderSettingsModal()}
      </div>
    </div>
  );
}

  if (screen === "routeMap") {
  return (
    <div className="appFrame">
      <RouteMapScreen
  seenEndings={state.seenEndings}
  visitedNodeIds={state.visitedNodeIds}
  lang={state.settings.lang}
  onBack={() => setScreen("title")}
/>
    </div>
  );
}

  return (
  <div className="appFrame">
    <NovelScreen
      state={state}
      node={displayNode}
      lang={state.settings.lang}
      onNext={handleNext}
      onChoice={handleChoice}
      onItemSelect={handleItemSelect}
      onMiniGameResult={handleMiniGameResult}
      onMiniGameStart={() => {
  playBgm("/bgm/surgery.mp3");
  setShowMiniGame(true);
}}
      onOpenMemo={() => {
        setShowMemo(true);
        setForcedMemoOpen(MEMO_STORY_PROGRESS_NODE_IDS.includes(node.id));
      }}
      onOpenLoopConfirm={handleLoopButtonPress}
      onOpenLog={() => setShowLog(true)}
      onOpenSettings={() => setShowSettings(true)}
      onBackTitle={() => {
  stopOneShotSE();
  stopAllLoopingSE(true);
  stopBgm(true);
  setScreen("title");
}}
      loopEffectVisual={loopEffectVisual}
      loopDisabledVisual={loopDisabledVisual}
    />

      {showMemo && (
  <ArmMemoModal
  armMemos={state.armMemos}
  loopStock={state.loopStock}
  lang={state.settings.lang}
  lockOpen={MEMO_STORY_PROGRESS_NODE_IDS.includes(node.id)}
  allowStoryProgress={MEMO_STORY_PROGRESS_NODE_IDS.includes(node.id)}
  onClose={() => {
  setShowMemo(false);
  setForcedMemoOpen(false);
}}
/>
)}
      {showLoopConfirm && (
        <div className="modalOverlay">
          <div className="confirmModal loopDistort">
            <h2>ループしますか？</h2>
            <p>インクが少し、かすれた気がした。</p>
            <button
              disabled={state.loopStock <= 0 || !state.lastChoiceNodeId}
              onClick={confirmNormalLoop}
            >
              戻る
            </button>
            <button onClick={() => setShowLoopConfirm(false)}>
              やめる
            </button>
          </div>
        </div>
      )}

      {showBadConfirm && (
        <div className="modalOverlay">
          <div className="confirmModal">
            <h2>戻りますか？</h2>
            <p>まだ、自分のループは残っている。</p>
            <button onClick={handleBadLoopToChoice}>
              直前の選択肢へ戻る
            </button>
            <button onClick={handleBadBackTitle}>
              タイトルへ戻る
            </button>
          </div>
        </div>
      )}
      {showLog && (
  <LogModal
    log={state.log}
    onClose={() => setShowLog(false)}
  />
)}

{showSettings && (
  <SettingsModal
    settings={state.settings}
    onChange={updateSettings}
    onClose={() => setShowSettings(false)}
    onClickSE={playClickSE}
  />
)}

{showMiniGame && node.type === "miniGame" && (
  <MiniGameScreen
    miniGameId={node.miniGameId}
    forcedFail={node.forcedFail}
    onFinish={handleMiniGameFinish}
  />
)}

    </div>
  );
}