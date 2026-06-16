type Props = {
  seenEndings: string[];
  onBack: () => void;
};

type RouteEnding = {
  ids: string[];
  title: string;
  date: string;
  description: string;
  image: string;
};

type RouteSection = {
  label: string;
  className: string;
  endings: RouteEnding[];
};

const TRUE_ENDINGS: RouteEnding[] = [
  {
    ids: ["route_a_true"],
    title: "トゥルーエンド",
    date: "Day3 / 10月12日",
    description: "それでも、前へ進む。",
    image: "/route_endings/true_end.webp",
  },
];

const GOOD_ENDINGS: RouteEnding[] = [
  {
    ids: ["route_a_good"],
    title: "グッドエンド",
    date: "Day3 / 10月12日",
    description: "医療に、やり直しはない。",
    image: "/route_endings/good_end.webp",
  },
];

const DAY1_BAD_ENDINGS: RouteEnding[] = [
  {
    ids: ["day1_badend_no_work"],
    title: "バッドエンド 1",
    date: "Day1 / 10月10日",
    description: "【病院へ行け】",
    image: "/route_endings/phone.webp",
  },
  {
    ids: ["day1_badend_walk"],
    title: "バッドエンド 2",
    date: "Day1 / 10月10日",
    description: "【歩き×】",
    image: "/route_endings/badend2.webp",
  },
  {
    ids: ["day1_badend_bus"],
    title: "バッドエンド 3",
    date: "Day1 / 10月10日",
    description: "【バス×】",
    image: "/route_endings/badend3.webp",
  },
  {
    ids: ["day1_badend_gokon"],
    title: "バッドエンド 4",
    date: "Day1 / 10月10日",
    description: "【約束を守れ】",
    image: "/route_endings/badend4.webp",
  },
  {
    ids: ["day1_badend_drink_drive"],
    title: "バッドエンド 5",
    date: "Day1 / 10月10日",
    description: "【飲酒運転×】",
    image: "/route_endings/badend5.webp",
  },
];

const DAY2_BAD_ENDINGS: RouteEnding[] = [];

const DAY3_BAD_ENDINGS: RouteEnding[] = [
  {
    ids: ["day3_keep_silent_bad_end"],
    title: "バッドエンド 6",
    date: "Day3 / 10月12日",
    description: "【報告する】",
    image: "/route_endings/badend6.webp",
  },
  {
    ids: ["day3_remove_gauze_bad_end"],
    title: "バッドエンド 7",
    date: "Day3 / 10月12日",
    description: "【摘出×】",
    image: "/route_endings/badend7.webp",
  },
  {
    ids: ["day3_run_away_bad_end"],
    title: "バッドエンド 8",
    date: "Day3 / 10月12日",
    description: "【逃げちゃダメだ】",
    image: "/route_endings/badend8.webp",
  },
  {
    ids: ["day3_blame_takamiya_bad_end", "day3_blame_bad_end"],
    title: "バッドエンド 9",
    date: "Day3 / 10月12日",
    description: "【責任を押し付けるな】",
    image: "/route_endings/badend9.webp",
  },
];

const SECTIONS: RouteSection[] = [
  {
    label: "TRUE END",
    className: "true",
    endings: TRUE_ENDINGS,
  },
  {
    label: "GOOD END",
    className: "good",
    endings: GOOD_ENDINGS,
  },
  {
    label: "DAY1 BAD END（10月10日）",
    className: "bad",
    endings: DAY1_BAD_ENDINGS,
  },
  {
    label: "DAY2 BAD END（10月11日）",
    className: "bad",
    endings: DAY2_BAD_ENDINGS,
  },
  {
    label: "DAY3 BAD END（10月12日）",
    className: "bad",
    endings: DAY3_BAD_ENDINGS,
  },
];

function isUnlocked(ending: RouteEnding, seenEndings: string[]) {
  return ending.ids.some((id) => seenEndings.includes(id));
}

export function RouteMapScreen({ seenEndings, onBack }: Props) {
  const totalEndingCount = SECTIONS.reduce(
    (sum, section) => sum + section.endings.length,
    0
  );

  const unlockedCount = SECTIONS.reduce(
    (sum, section) =>
      sum +
      section.endings.filter((ending) => isUnlocked(ending, seenEndings)).length,
    0
  );

  return (
    <div className="routeMapScreen">
      <button
        className="routeMapBackButton routeMapBackButtonTop"
        onClick={onBack}
      >
        タイトルへ戻る
      </button>

      <div className="routeMapHeader">
        <h1>ルートマップ</h1>
        <p>{unlockedCount}/{totalEndingCount} 回収</p>
      </div>

      <div className="routeMapSections">
        {SECTIONS.map((section) => (
          <section
            className={`routeMapSection routeMapSection-${section.className}`}
            key={section.label}
          >
            <h2>{section.label}</h2>

            {section.endings.length === 0 ? (
              <div className="routeMapEmpty">この日のバッドエンドはありません。</div>
            ) : (
              <div className="routeEndingList">
                {section.endings.map((ending) => {
                  const unlocked = isUnlocked(ending, seenEndings);

                  return (
                    <div
                      key={ending.ids.join("_")}
                      className={`routeEndingCard ${
                        unlocked ? "unlocked" : "locked"
                      }`}
                    >
                      <div className="routeEndingImageWrap">
                        {unlocked ? (
                          <img
                            className="routeEndingImage"
                            src={ending.image}
                            alt={ending.title}
                          />
                        ) : (
                          <div className="routeEndingUnknown">？？？</div>
                        )}
                      </div>

                      <div className="routeEndingBody">
                        <div className="routeEndingDate">
                          {unlocked ? ending.date : "？？？"}
                        </div>
                        <h3>{unlocked ? ending.title : "？？？"}</h3>
                        <p>{unlocked ? ending.description : "未到達"}</p>
                        <small>{unlocked ? "到達済み" : "未回収"}</small>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        ))}
      </div>

      <button className="routeMapBackButton" onClick={onBack}>
        タイトルへ戻る
      </button>
    </div>
  );
}