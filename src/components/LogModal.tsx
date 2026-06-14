import { useEffect, useRef } from "react";

type Props = {
  log: { speaker?: string; text: string }[];
  onClose: () => void;
};

export function LogModal({ log, onClose }: Props) {
  const logEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: "end" });
  }, [log]);

  return (
    <div className="modalOverlay">
      <div className="memoModal logModal">
        <h2>ログ</h2>

        <div className="logContent">
          {log.length === 0 ? (
            <p>ログはまだありません。</p>
          ) : (
            <>
              {log.map((l, i) => (
                <div className="logLine" key={i}>
  {l.speaker ? (
    <>
      <b>{l.speaker}</b>
      <span>「{l.text}」</span>
    </>
  ) : (
    <span>{l.text}</span>
  )}
</div>
              ))}
              <div ref={logEndRef} />
            </>
          )}
        </div>

        <button className="logCloseButton" onClick={onClose}>
          閉じる
        </button>
      </div>
    </div>
  );
}