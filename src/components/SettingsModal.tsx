export function SettingsModal({
  settings,
  onChange,
  onClose,
  onClickSE,
}: any) {
  const bgmDisplayValue = Math.min(
    100,
    Math.round(((settings.bgmVolume ?? 0.5) / 0.5) * 80)
  );
  const textSpeedDisplay = 101 - settings.textSpeed;
  const autoSpeedDisplay = 3100 - settings.autoSpeed;

  return (
    <div className="modalOverlay">
      <div className="memoModal settingsModal">
        <h2>設定</h2>

        <label className="settingsRow">
          <span>テキスト速度：{settings.textSpeed}</span>

          <input
            type="range"
            min={10}
            max={100}
            value={textSpeedDisplay}
onChange={(e) =>
  onChange({
    ...settings,
    textSpeed: 101 - Number(e.target.value),
  })
}
          />
        </label>

        <label className="settingsRow">
          <span>オート速度：{settings.autoSpeed}ms</span>

          <input
            type="range"
            min={500}
            max={5000}
            step={100}
            value={autoSpeedDisplay}
onChange={(e) =>
  onChange({
    ...settings,
    autoSpeed: 3100 - Number(e.target.value),
  })
}
          />
        </label>

        <label className="settingsRow">
  <span>BGM音量：{bgmDisplayValue}%</span>

  <input
    type="range"
    min={0}
    max={100}
    step={5}
    value={bgmDisplayValue}
    onChange={(e) =>
      onChange({
        ...settings,
        bgmVolume: (Number(e.target.value) / 80) * 0.5,
      })
    }
  />
</label>

        <label className="settingsRow">
          <span>
            SE音量：{Math.round((settings.seVolume ?? 1) * 100)}%
          </span>

          <input
  type="range"
  min={0}
  max={1}
  step={0.05}
  value={settings.seVolume ?? 1}
  onInput={(e) => {
    const nextSeVolume = Number((e.target as HTMLInputElement).value);

    onChange({
      ...settings,
      seVolume: nextSeVolume,
    });

    onClickSE?.(nextSeVolume);
  }}
/>
        </label>

        <label className="settingsRow">
          <span>
            キャラボイス音量：{Math.round((settings.cvVolume ?? 1) * 100)}%
          </span>

          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={settings.cvVolume ?? 1}
            onChange={(e) =>
              onChange({
                ...settings,
                cvVolume: Number(e.target.value),
              })
            }
          />
        </label>

        <button onClick={onClose}>閉じる</button>
      </div>
    </div>
  );
}