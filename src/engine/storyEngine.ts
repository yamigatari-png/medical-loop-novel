import type {
  GameState,
  PenState,
  StoryNode,
  ChoiceOption,
  ItemKey,
  MiniGameId,
  ArmMemoKey,
} from "../types";
import { DAY_START_NODE, storyNodes } from "../data/story";

export function addArmMemo(state: GameState, memo: ArmMemoKey): GameState {
  if (state.armMemos.includes(memo)) return state;

  return {
    ...state,
    armMemos: [...state.armMemos, memo],
  };
}

export function createInitialGameState(): GameState {
  return {
    currentNodeId: "day1_black_001",
    currentDay: 1,
    dayStartNodeId: DAY_START_NODE[1],
    lastChoiceNodeId: null,

    loopStock: 20,
    maxLoopStock: 20,
    girlfriendLoopUsed: false,

    usedPlayerLoop: 0,
usedHerLoop: 0,

selectedItems: [],
completedMiniGames: [],

    flags: {},
    armMemos: [],
    visitedNodeIds: [],
    seenEndings: [],
    log: [],
    settings: {
  lang: "ja",
  textSpeed: 35,
  autoSpeed: 1800,

  bgmVolume: 0.7,
  seVolume: 0.6,
  cvVolume: 0.8,
},
  };
}

export function getCurrentNode(state: GameState): StoryNode {
  const node = storyNodes[state.currentNodeId];

  if (!node) {
    return storyNodes["day1_black_001"];
  }

  return node;
}

export function getPenState(loopStock: number): PenState {
  if (loopStock <= 0) return "empty";
  if (loopStock <= 4) return "low";
  if (loopStock <= 7) return "mid";
  return "full";
}

export function canShowChoice(
  choice: ChoiceOption,
  state: GameState
): boolean {
  const flags = state.flags;

  if (choice.requireFlags?.some((flag) => !flags[flag])) return false;
  if (choice.hideIfFlags?.some((flag) => flags[flag])) return false;

  if (
    choice.requireVisitedNodes?.some(
      (nodeId) => !state.visitedNodeIds.includes(nodeId)
    )
  ) {
    return false;
  }

  if (
    choice.requireItems?.some(
      (item) => !state.selectedItems.includes(item)
    )
  ) {
    return false;
  }

  if (
    choice.requireMissingItems?.some(
      (item) => state.selectedItems.includes(item)
    )
  ) {
    return false;
  }

  if (choice.requireLoopUsed && state.usedPlayerLoop <= 0) {
    return false;
  }

  if (choice.requireHerLoopUnused && state.usedHerLoop > 0) {
    return false;
  }

  if (choice.requireHerLoopUsed && state.usedHerLoop <= 0) {
    return false;
  }

  return true;
}

export function applyNodeVisit(state: GameState, node: StoryNode): GameState {
  const visitedNodeIds = state.visitedNodeIds.includes(node.id)
    ? state.visitedNodeIds
    : [...state.visitedNodeIds, node.id];

  const armMemos =
  node.type === "line" &&
  node.addArmMemo &&
  !state.armMemos.includes(node.addArmMemo)
    ? [...state.armMemos, node.addArmMemo]
    : state.armMemos;

  const lastChoiceNodeId =
    node.type === "choice" ? node.id : state.lastChoiceNodeId;

  return {
    ...state,
    visitedNodeIds,
    armMemos,
    lastChoiceNodeId,
  };
}

export function proceedLine(state: GameState): GameState {
  const node = getCurrentNode(state);

  if (node.type !== "line") return state;

  const nextNode = storyNodes[node.next];

  return applyNodeVisit(
    {
      ...state,
      currentNodeId: node.next,
      currentDay: nextNode.day,
      dayStartNodeId: DAY_START_NODE[nextNode.day],
    },
    nextNode
  );
}

export function chooseOption(state: GameState, choice: ChoiceOption): GameState {
  const nextNode = storyNodes[choice.next];

  const nextFlags = { ...state.flags };
  choice.setFlags?.forEach((flag) => {
    nextFlags[flag] = true;
  });

  const shouldConsumeLoop = choice.consumeLoop === true && state.loopStock > 0;

  return applyNodeVisit(
    {
      ...state,
      currentNodeId: choice.next,
      currentDay: nextNode.day,
      dayStartNodeId: DAY_START_NODE[nextNode.day],
      flags: nextFlags,
      loopStock: shouldConsumeLoop ? state.loopStock - 1 : state.loopStock,
      usedPlayerLoop: shouldConsumeLoop
        ? state.usedPlayerLoop + 1
        : state.usedPlayerLoop,
    },
    nextNode
  );
}

export function useLoopToLastChoice(state: GameState): GameState {
  if (state.loopStock <= 0) return state;
  if (!state.lastChoiceNodeId) return state;

  return {
    ...state,
    currentNodeId: state.lastChoiceNodeId,
    loopStock: state.loopStock - 1,
    usedPlayerLoop: state.usedPlayerLoop + 1,
  };
}

export function handleBadEndLoopToDayMorning(state: GameState): GameState {
  return {
    ...state,
    loopStock: 3,
    usedHerLoop: state.usedHerLoop + 1,
    girlfriendLoopUsed: true,
    currentNodeId: state.dayStartNodeId,
  };
}

export function markLoopFirstDone(state: GameState): GameState {
  return {
    ...state,
    flags: {
      ...state.flags,
      loop_first_done: true,
    },
  };
}

export function selectItems(
  state: GameState,
  items: ItemKey[],
  nextNodeId: string
): GameState {
  const nextNode = storyNodes[nextNodeId];

  return applyNodeVisit(
    {
      ...state,
      selectedItems: items,
      currentNodeId: nextNodeId,
      currentDay: nextNode.day,
      dayStartNodeId: DAY_START_NODE[nextNode.day],
    },
    nextNode
  );
}

export function completeMiniGame(
  state: GameState,
  miniGameId: MiniGameId,
  success: boolean,
  successNext: string,
  failNext: string
): GameState {
  const nextNodeId = success ? successNext : failNext;
  const nextNode = storyNodes[nextNodeId];

  return applyNodeVisit(
    {
      ...state,
      completedMiniGames: state.completedMiniGames.includes(miniGameId)
        ? state.completedMiniGames
        : [...state.completedMiniGames, miniGameId],
      currentNodeId: nextNodeId,
      currentDay: nextNode.day,
      dayStartNodeId: DAY_START_NODE[nextNode.day],
    },
    nextNode
  );
}