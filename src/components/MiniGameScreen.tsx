import { useEffect, useMemo, useRef, useState } from "react";
import type { MiniGameId } from "../types";
import { miniGames, type InstrumentKey } from "../data/miniGames";

type Props = {
  miniGameId: MiniGameId;
  forcedFail?: boolean;
  lang?: "ja" | "en";
  onFinish: (success: boolean) => void;
};

type HandSide = "left" | "right";

type Hands = Record<HandSide, InstrumentKey | null>;

type FeedbackLine = {
  text: string;
  textEn?: string;
  cv?: string;
};

const CORRECT_LINES: FeedbackLine[] = [
  { text: "よし、その調子です。", textEn: "Good. That's correct.", cv: "surgery_correct_01" },
  { text: "よろしい。", textEn: "Correct.", cv: "surgery_correct_02" },
  { text: "いい判断です。", textEn: "Good judgment.", cv: "surgery_correct_03" },
];

const WRONG_LINES: FeedbackLine[] = [
  { text: "違います。次！", textEn: "Wrong. Next!", cv: "surgery_wrong_01" },
  { text: "そうではありません。指示に従って。", textEn: "No. Follow my instructions.", cv: "surgery_wrong_02" },
  { text: "判断が遅い。集中してください！", textEn: "Too slow. Focus!", cv: "surgery_wrong_03" },
];

const PERFECT_FINISH_LINES: FeedbackLine[] = [
  { text: "素晴らしい。完璧な手際でした。", textEn: "Excellent. Perfect technique.", cv: "surgery_perfect_01" },
];

const FAIL_FINISH_LINES: FeedbackLine[] = [
  { text: "全然ダメです。これではオペは任せられません。", textEn: "Not good enough. I can't trust you with surgery yet.", cv: "surgery_fail_01" },
];

export function MiniGameScreen({
  miniGameId,
  lang = "ja",
  onFinish,
}: Props) {
  const game = miniGames[miniGameId];

  const [questionIndex, setQuestionIndex] = useState(0);
  const question = game.questions[questionIndex];

  const [hands, setHands] = useState<Hands>({
  left: null,
  right: null,
});

const handsRef = useRef<Hands>({
  left: null,
  right: null,
});

  const answerLockedRef = useRef(false);
  const timeoutRef = useRef<number | null>(null);

  const [draggedInstrument, setDraggedInstrument] =
    useState<InstrumentKey | null>(null);

  const [timeLeft, setTimeLeft] = useState(question.timeLimitMs);
  const [mistakeCount, setMistakeCount] = useState(0);
  const [feedback, setFeedback] = useState<FeedbackLine | null>(null);
  const [isFeedbackShowing, setIsFeedbackShowing] = useState(false);
  const [finalResult, setFinalResult] = useState<boolean | null>(null);

  const instrumentLabelMap = useMemo(() => {
    return Object.fromEntries(
      game.instruments.map((inst) => [
        inst.key,
        lang === "en" && inst.labelEn ? inst.labelEn : inst.label,
      ])
    ) as Record<InstrumentKey, string>;
  }, [game.instruments, lang]);

  useEffect(() => {
    answerLockedRef.current = false;

    const emptyHands: Hands = { left: null, right: null };
handsRef.current = emptyHands;
setHands(emptyHands);
setDraggedInstrument(null);

    setTimeLeft(question.timeLimitMs);
  }, [question.id, question.timeLimitMs]);

  useEffect(() => {
    if (finalResult !== null) return;
    if (isFeedbackShowing) return;
    if (answerLockedRef.current) return;

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 100) {
  window.clearInterval(timer);

  // 時間切れ時も、すでに正しい器具を持っていれば正解判定する
  handleAnswer(judgeHands());

  return 0;
}

        return prev - 100;
      });
    }, 100);

    return () => window.clearInterval(timer);
  }, [question.id, isFeedbackShowing, finalResult]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function getQuestionPrompt() {
    return lang === "en" && question.promptEn ? question.promptEn : question.prompt;
  }

  function getFeedbackText(line: FeedbackLine) {
    return lang === "en" && line.textEn ? line.textEn : line.text;
  }

  function pickRandomLine(lines: FeedbackLine[]) {
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function playCv(line: FeedbackLine) {
    if (!line.cv) return;

    const audio = new Audio(`/cv/${line.cv}.mp3`);
    audio.volume = 1;
    audio.play().catch(() => {});
  }

  function judgeHands() {
  const currentHands = handsRef.current;

  const selectedKeys = [currentHands.left, currentHands.right].filter(
    (v): v is InstrumentKey => Boolean(v)
  );

  const correctKeys = question.correct;

  const hasWrongInstrument = selectedKeys.some(
    (key) => !correctKeys.includes(key)
  );

  const hasAllRequiredInstruments = correctKeys.every(
    (key) => selectedKeys.includes(key)
  );

  const result =
    selectedKeys.length > 0 &&
    !hasWrongInstrument &&
    hasAllRequiredInstruments;

  console.log(
    "[MiniGame Judge]",
    JSON.stringify({
      questionId: question.id,
      prompt: question.prompt,
      left: currentHands.left,
      right: currentHands.right,
      selectedKeys,
      correctKeys,
      hasWrongInstrument,
      hasAllRequiredInstruments,
      result,
    })
  );

  return result;
}

  function showFeedback(
    line: FeedbackLine,
    after: () => void,
    keepVisible = false
  ) {
    setFeedback(line);
    setIsFeedbackShowing(true);
    playCv(line);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      setIsFeedbackShowing(false);

      if (!keepVisible) {
        setFeedback(null);
      }

      after();
    }, 1200);
  }

  function finishMiniGame(nextMistakeCount: number) {
  const finalSuccess = nextMistakeCount === 0;

  const line = finalSuccess
    ? pickRandomLine(PERFECT_FINISH_LINES)
    : pickRandomLine(FAIL_FINISH_LINES);

  showFeedback(
    line,
    () => {
      setFeedback(line);
      setFinalResult(finalSuccess);
    },
    true
  );
}

  function goNextQuestion(nextMistakeCount: number) {
    const emptyHands = { left: null, right: null };
    setHands(emptyHands);
    setDraggedInstrument(null);

    if (questionIndex >= game.questions.length - 1) {
      finishMiniGame(nextMistakeCount);
      return;
    }

    setQuestionIndex((prev) => prev + 1);
  }

  function handleAnswer(correct: boolean) {
  if (answerLockedRef.current) return;
  if (isFeedbackShowing) return;
  if (finalResult !== null) return;

  answerLockedRef.current = true;

  // forcedFail はここでは絶対に使わない
  const actualCorrect = correct;
  const nextMistakeCount = actualCorrect ? mistakeCount : mistakeCount + 1;

  console.log("[MiniGame Answer]", {
    questionId: question.id,
    prompt: question.prompt,
    hands: handsRef.current,
    correctAnswer: question.correct,
    actualCorrect,
  });

  if (!actualCorrect) {
    setMistakeCount(nextMistakeCount);
  }

  const line = actualCorrect
    ? pickRandomLine(CORRECT_LINES)
    : pickRandomLine(WRONG_LINES);

  showFeedback(line, () => {
    goNextQuestion(nextMistakeCount);
  });
}

  function putInstrumentToHand(hand: HandSide, key: InstrumentKey) {
  const nextHands: Hands = {
    ...handsRef.current,
    [hand]: key,
  };

  handsRef.current = nextHands;
  setHands(nextHands);

  console.log("[MiniGame Hand Set]", JSON.stringify(nextHands));
}

  function handleDragStart(
    e: React.DragEvent<HTMLButtonElement>,
    key: InstrumentKey
  ) {
    setDraggedInstrument(key);
    e.dataTransfer.setData("text/plain", key);
    e.dataTransfer.setData("instrumentKey", key);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>, hand: HandSide) {
    e.preventDefault();
    e.stopPropagation();

    if (finalResult !== null) return;
    if (isFeedbackShowing) return;

    const key =
      (e.dataTransfer.getData("instrumentKey") ||
        e.dataTransfer.getData("text/plain") ||
        draggedInstrument) as InstrumentKey | null;

    if (!key) return;

    putInstrumentToHand(hand, key);
    setDraggedInstrument(null);
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "move";
  }

  function handleHandClick(hand: HandSide) {
    if (!draggedInstrument) return;
    if (finalResult !== null) return;
    if (isFeedbackShowing) return;

    putInstrumentToHand(hand, draggedInstrument);
    setDraggedInstrument(null);
  }

    return (
    <div className="miniGameOverlay operationMiniGame">
      <div className="operationGameScaler">
        <div className="operationTopPanel">
          <div className="miniGameTimer">
            {lang === "en" ? "Time" : "残り"} {(timeLeft / 1000).toFixed(1)}
            {lang === "en" ? "s" : " 秒"}
          </div>

          <div className="miniGamePrompt">{getQuestionPrompt()}</div>

          <div className="miniGameMistake">
            {lang === "en" ? "Mistakes" : "ミス"} {mistakeCount} /{" "}
            {game.questions.length}
          </div>
        </div>

        <div className="instrumentTray">
          {game.instruments.map((inst) => (
            <button
              key={inst.key}
              className={`instrumentIcon ${
                draggedInstrument === inst.key ? "instrumentIconSelected" : ""
              }`}
              draggable={finalResult === null && !isFeedbackShowing}
              onClick={() => {
                if (finalResult !== null) return;
                if (isFeedbackShowing) return;
                setDraggedInstrument(inst.key);
              }}
              onDragStart={(e) => handleDragStart(e, inst.key)}
            >
              {lang === "en" && inst.labelEn ? inst.labelEn : inst.label}
            </button>
          ))}
        </div>

        <div
          className="operationHandDrop left"
          onClick={() => handleHandClick("left")}
          onDrop={(e) => handleDrop(e, "left")}
          onDragOver={handleDragOver}
        >
          <div className="handHeldLabel">
            {hands.left
              ? `${lang === "en" ? "Left hand" : "左手"}：${instrumentLabelMap[hands.left]}`
              : lang === "en"
                ? "Left hand: Empty"
                : "左手：なし"}
          </div>
        </div>

        <div
          className="operationHandDrop right"
          onClick={() => handleHandClick("right")}
          onDrop={(e) => handleDrop(e, "right")}
          onDragOver={handleDragOver}
        >
          <div className="handHeldLabel">
            {hands.right
              ? `${lang === "en" ? "Right hand" : "右手"}：${instrumentLabelMap[hands.right]}`
              : lang === "en"
                ? "Right hand: Empty"
                : "右手：なし"}
          </div>
        </div>

        {feedback && (
          <div className="operationTextBox">
            <div className="speakerName">
              {lang === "en" ? "Takamiya" : "鷹宮"}
            </div>

            <div className="text">{getFeedbackText(feedback)}</div>
          </div>
        )}

        {finalResult !== null && (
          <div className="miniGameFinalResult">
            <button
              className="miniGameReturnButton"
              onClick={() => onFinish(finalResult)}
            >
              {lang === "en" ? "Return to story" : "ストーリーへ戻る"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}