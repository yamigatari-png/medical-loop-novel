import type { Lang } from "../types";

type Props = {
  seenEndings: string[];
  visitedNodeIds: string[];
  lang: Lang;
  onBack: () => void;
};

type RouteEnding = {
  ids: string[];
  title: string;
  titleEn: string;
  date: string;
  dateEn?: string;
  text: string;
  textEn: string;
  image: string;
};

type RouteSection = {
  label: string;
  labelEn: string;
  className: string;
  endings: RouteEnding[];
};

type ChartNode = {
  id: string;
  label: string;
  labelEn: string;
  unlockIds: string[];
  kind?: "choice" | "bad" | "good" | "true" | "extra";
};

type ChartDay = {
  label: string;
  labelEn: string;
  nodes: ChartNode[];
};

const TRUE_ENDINGS: RouteEnding[] = [
  {
    ids: ["route_a_true"],
    title: "トゥルーエンド",
    titleEn: "True End",
    date: "Day3 / 10月12日",
    dateEn: "Day 3 / Oct 12",
    text: "それでも、前へ進む。",
    textEn: "Even so, he moves forward.",
    image: "/route_endings/true_end.webp",
  },
];

const GOOD_ENDINGS: RouteEnding[] = [
  {
    ids: ["route_a_good"],
    title: "グッドエンド",
    titleEn: "Good End",
    date: "Day3 / 10月12日",
    dateEn: "Day 3 / Oct 12",
    text: "医療に、やり直しはない。",
    textEn: "There are no do-overs in medicine.",
    image: "/route_endings/good_end.webp",
  },
];

const DAY1_BAD_ENDINGS: RouteEnding[] = [
  {
    ids: ["day1_badend_no_work"],
    title: "バッドエンド １",
    titleEn: "Bad End 1",
    date: "Day1 / 10月10日",
    dateEn: "Day 1 / Oct 10",
    text: "病院へ行け",
    textEn: "Go to the hospital",
    image: "/route_endings/phone.webp",
  },
  {
    ids: ["day1_badend_walk"],
    title: "バッドエンド２",
    titleEn: "Bad End 2",
    date: "Day1 / 10月10日",
    dateEn: "Day 1 / Oct 10",
    text: "歩き☓",
    textEn: "Do not walk.",
    image: "/route_endings/badend2.webp",
  },
  {
    ids: ["day1_badend_bus"],
    title: "バッドエンド３",
    titleEn: "Bad End 3",
    date: "Day1 / 10月10日",
    dateEn: "Day 1 / Oct 10",
    text: "バス☓",
    textEn: "Bus ×",
    image: "/route_endings/badend3.webp",
  },
  {
    ids: ["day1_badend_gokon"],
    title: "バッドエンド４",
    titleEn: "Bad End 4",
    date: "Day1 / 10月10日",
    dateEn: "Day 1 / Oct 10",
    text: "約束を守れ",
    textEn: "Keep your promise",
    image: "/route_endings/badend4.webp",
  },
  {
    ids: ["day1_badend_drink_drive"],
    title: "バッドエンド５",
    titleEn: "Bad End 5",
    date: "Day1 / 10月10日",
    dateEn: "Day 1 / Oct 10",
    text: "飲酒運転☓",
    textEn: "No drink driving",
    image: "/route_endings/badend5.webp",
  },
];

const DAY2_BAD_ENDINGS: RouteEnding[] = [];

const DAY3_BAD_ENDINGS: RouteEnding[] = [
  {
    ids: ["day3_keep_silent_bad_end"],
    title: "バッドエンド６",
    titleEn: "Bad End 6",
    date: "Day3 / 10月12日",
    dateEn: "Day 3 / Oct 12",
    text: "報告する",
    textEn: "Report it.",
    image: "/route_endings/badend6.webp",
  },
  {
    ids: ["day3_remove_gauze_bad_end"],
    title: "バッドエンド７",
    titleEn: "Bad End 7",
    date: "Day3 / 10月12日",
    dateEn: "Day 3 / Oct 12",
    text: "摘出×",
    textEn: "Don't remove it.",
    image: "/route_endings/badend7.webp",
  },
  {
    ids: ["day3_run_away_bad_end"],
    title: "バッドエンド８",
    titleEn: "Bad End 8",
    date: "Day3 / 10月12日",
    dateEn: "Day 3 / Oct 12",
    text: "逃げちゃダメだ",
    textEn: "Face it.",
    image: "/route_endings/badend8.webp",
  },
  {
    ids: ["day3_blame_takamiya_bad_end", "day3_blame_bad_end"],
    title: "バッドエンド９",
    titleEn: "Bad End 9",
    date: "Day3 / 10月12日",
    dateEn: "Day 3 / Oct 12",
    text: "責任を押し付けるな",
    textEn: "Don't shift the blame",
    image: "/route_endings/badend9.webp",
  },
];

const EXTRA_ENDINGS: RouteEnding[] = [
  {
    ids: ["route_a_extra"],
    title: "エクストラエンド",
    titleEn: "Extra End",
    date: "Day1 / 10月10日",
    dateEn: "Day 1 / Oct 10",
    text: "スーパードクター爆誕",
    textEn: "[A Super Doctor Is Born]",
    image: "/route_endings/extra_end.webp",
  },
];

const SECTIONS: RouteSection[] = [
  { label: "TRUE END", labelEn: "TRUE END", className: "true", endings: TRUE_ENDINGS },
  { label: "GOOD END", labelEn: "GOOD END", className: "good", endings: GOOD_ENDINGS },
  { label: "DAY1 BAD END（10月10日）", labelEn: "DAY 1 BAD END (Oct 10)", className: "bad", endings: DAY1_BAD_ENDINGS },
  { label: "DAY2 BAD END（10月11日）", labelEn: "DAY 2 BAD END (Oct 11)", className: "bad", endings: DAY2_BAD_ENDINGS },
  { label: "DAY3 BAD END（10月12日）", labelEn: "DAY 3 BAD END (Oct 12)", className: "bad", endings: DAY3_BAD_ENDINGS },
  { label: "EXTRA END", labelEn: "EXTRA END", className: "extra", endings: EXTRA_ENDINGS },
];

const STORY_CHART: ChartDay[] = [
  {
    label: "Day1 / 10月10日",
    labelEn: "Day 1 / Oct 10",
    nodes: [
      { id: "day1_surgery_prepare_choice", label: "手術の予習",labelEn: "Surgery Preparation", unlockIds: ["day1_surgery_prepare_choice"], kind: "choice" },
      { id: "route_a_extra", label: "エクストラエンドスーパードクター爆誕",labelEn: "Extra End: Super Doctor Awakens", unlockIds: ["route_a_extra"], kind: "extra" },
      { id: "day1_bedroom_loop_choice_001", label: "文字を消す？",labelEn: "Erase the message?", unlockIds: ["day1_bedroom_loop_choice_001"], kind: "choice" },
      { id: "day1_living_loop_choice_cup", label: "コップをつかむ", labelEn: "Grab the cup", unlockIds: ["day1_living_loop_choice_cup"], kind: "choice" },
      { id: "day1_living_loop_go_choice", label: "仕事に行く／行かない", labelEn: "Go to work / Stay home", unlockIds: ["day1_living_loop_go_choice"], kind: "choice" },
      { id: "day1_badend_no_work", label: "バッドエンド １病院へ行け",labelEn: "Bad End 1: Go to the Hospital", unlockIds: ["day1_badend_no_work"], kind: "bad" },
      { id: "day1_transport_choice", label: "どうやって行く？",labelEn: "How will you get there?", unlockIds: ["day1_transport_choice"], kind: "choice" },
      { id: "day1_badend_walk", label: "バッドエンド２ 歩き☓", labelEn: "Bad End 2: Walking", unlockIds: ["day1_badend_walk"], kind: "bad" },
      { id: "day1_badend_bus", label: "バッドエンド３ バス☓",labelEn: "Bad End 3: Bus", unlockIds: ["day1_badend_bus"], kind: "bad" },
      { id: "day1_bus_bad_choice", label: "バス遅刻：なんて答える？",labelEn: "Late for Work: How do you respond?", unlockIds: ["day1_bus_bad_choice"], kind: "choice" },
      { id: "day1_bicycle_action_choice", label: "何をする？",labelEn: "What will you do?", unlockIds: ["day1_bicycle_action_choice"], kind: "choice" },
      { id: "day1_prepare_surgery_choice", label: "もう一度解説を見る？", labelEn: "Review the tutorial again?", unlockIds: ["day1_prepare_surgery_choice"], kind: "choice" },
      { id: "day1_return_station", label: "手術準備／カルテ／疼痛時指示", labelEn: "Surgery Prep / Charts / Pain Orders", unlockIds: ["day1_return_station"], kind: "choice" },
      { id: "day1_gokon_choice", label: "合コンに行く？", labelEn: "Go to the mixer?", unlockIds: ["day1_gokon_choice"], kind: "choice" },
      { id: "day1_badend_gokon", label: "バッドエンド４ 約束を守れ", labelEn: "Bad End 4: Keep Your Promise", unlockIds: ["day1_badend_gokon"], kind: "bad" },
      { id: "day1_station_transport_choice", label: "駅前へ向かう交通手段", labelEn: "How to Get to the Station", unlockIds: ["day1_station_transport_choice"], kind: "choice" },
      { id: "day1_badend_drink_drive", label: "バッドエンド５ 飲酒運転☓", labelEn: "Bad End 5: Drunk Driving", unlockIds: ["day1_badend_drink_drive"], kind: "bad" },
      { id: "day1_marriage_choice", label: "どうせ結婚の話だろ？", labelEn: "It's about marriage, isn't it?", unlockIds: ["day1_marriage_choice"], kind: "choice" },
      { id: "day1_after_restaurant_choice", label: "帰宅する／追いかける", labelEn: "Go Home / Follow Her", unlockIds: ["day1_after_restaurant_choice"], kind: "choice" },
    ],
  },
  {
    label: "Day2 / 10月11日",
    labelEn: "Day 2 / Oct 11",
    nodes: [
      { id: "day2_yesterday_choice", label: "昨日のことを聞く／黙る", labelEn: "Ask About Yesterday / Stay Silent", unlockIds: ["day2_yesterday_choice"], kind: "choice" },
      { id: "day2_transport_choice", label: "交通手段は？",labelEn: "How Will You Travel?", unlockIds: ["day2_transport_choice"], kind: "choice" },
      { id: "day2_noise_choice", label: "声の聞こえる方へ", labelEn: "Head Toward the Voice", unlockIds: ["day2_noise_choice"], kind: "choice" },
      { id: "day2_help_choice", label: "助けに行く／先を急ぐ", labelEn: "Help Them / Keep Going", unlockIds: ["day2_help_choice"], kind: "choice" },
      { id: "day2_assessment_choice", label: "倒れた人の初期対応", labelEn: "Initial Assessment", unlockIds: ["day2_assessment_choice"], kind: "choice" },
      { id: "day2_aed_branch_choice", label: "AEDは？", labelEn: "What About the AED?", unlockIds: ["day2_aed_branch_choice"], kind: "choice" },
      { id: "day2_bus_help_choice", label: "バスルート：助けに行く／様子を見る", labelEn: "Bus Route: Help Them / Wait and See",  unlockIds: ["day2_bus_help_choice"], kind: "choice" },
      { id: "day2_bus_assessment_choice", label: "バスルート：初期対応", labelEn: "Bus Route: Initial Assessment",unlockIds: ["day2_bus_assessment_choice"], kind: "choice" },
      { id: "day2_bus_aed_branch_choice", label: "バスルート：AEDは？", labelEn: "Bus Route: What About the AED?",  unlockIds: ["day2_bus_aed_branch_choice"], kind: "choice" },
      { id: "day2_id_check_choice", label: "IDカードは？", labelEn: "Where Is Your ID Card?", unlockIds: ["day2_id_check_choice"], kind: "choice" },
      { id: "day2_before_clinic_choice", label: "カルテ／回診", labelEn: "Charts / Ward Round", unlockIds: ["day2_before_clinic_choice"], kind: "choice" },
      { id: "day2_painkiller_choice", label: "痛み止め処方／後回し", labelEn: "Prescribe Painkillers / Later", unlockIds: ["day2_painkiller_choice"], kind: "choice" },
      { id: "day2_clinic_p1_choice", label: "外来1：診断は？", labelEn: "Clinic Case 1: Diagnosis?", unlockIds: ["day2_clinic_p1_choice"], kind: "choice" },
      { id: "day2_clinic_p2_choice_allcorrect", label: "外来2：問診", labelEn: "Clinic Case 2: History Taking", unlockIds: ["day2_clinic_p2_choice_allcorrect", "day2_clinic_p2_choice_mistake"], kind: "choice" },
      { id: "day2_clinic_p3_choice_allcorrect", label: "外来3：診断は？", labelEn: "Clinic Case 3: Diagnosis?", unlockIds: ["day2_clinic_p3_choice_allcorrect", "day2_clinic_p3_choice_mistake"], kind: "choice" },
      { id: "day2_painkiller_choice_looped", label: "ループ後：アレルギー歴確認", labelEn: "After Loop: Allergy Check", unlockIds: ["day2_painkiller_choice_looped"], kind: "choice" },
      { id: "day2_er_disposition_choice", label: "入院／帰宅外来治療", labelEn: "Admit / Outpatient Treatment", unlockIds: ["day2_er_disposition_choice"], kind: "choice" },
      { id: "day2_evening_choice_first", label: "家に帰る", labelEn: "Go Home", unlockIds: ["day2_evening_choice_first"], kind: "choice" },
      { id: "day2_evening_choice_looped_004", label: "家に帰る／詩織を探す", labelEn: "Go Home / Look for Shiori", unlockIds: ["day2_evening_choice_looped_004"], kind: "choice" },
      { id: "day2_park_choice", label: "声をかける？", labelEn: "Talk to Her?", unlockIds: ["day2_park_choice"], kind: "choice" },
      { id: "day2_after_park_choice", label: "追う／追わない", labelEn: "Follow / Don't Follow", unlockIds: ["day2_after_park_choice"], kind: "choice" },
    ],
  },
  {
    label: "Day3 / 10月12日",
    labelEn: "Day 3 / Oct 12",
    nodes: [
      { id: "day3_ask_yesterday_choice", label: "昨日のことを聞く／聞かない", labelEn: "Ask About Yesterday / Don't Ask", unlockIds: ["day3_ask_yesterday_choice"], kind: "choice" },
      { id: "day3_pen_choice", label: "ごまかす／認める", labelEn: "Deny It / Admit It", unlockIds: ["day3_pen_choice"], kind: "choice" },
      { id: "day3_loop_reveal_choice", label: "なぜ知ってるのか尋ねる／しらを切る", labelEn: "Ask How She Knows / Play Dumb", unlockIds: ["day3_loop_reveal_choice"], kind: "choice" },
      { id: "day3_feelings_choice", label: "なんて答える？", labelEn: "How Do You Respond?", unlockIds: ["day3_feelings_choice"], kind: "choice" },
      { id: "day3_go_hospital_choice", label: "病院へ行く／行かない", labelEn: "Go to the Hospital / Don't Go", unlockIds: ["day3_go_hospital_choice"], kind: "choice" },
      { id: "day3_gauze_choice_001", label: "鷹宮に報告する／黙る", labelEn: "Report to Takamiya / Stay Silent", unlockIds: ["day3_gauze_choice_001"], kind: "choice" },
      { id: "day3_keep_silent_bad_end", label: "バッドエンド６ 報告する", labelEn: "Bad End 6: Report It", unlockIds: ["day3_keep_silent_bad_end"], kind: "bad" },
      { id: "day3_return_to_operation_choice", label: "手術した日まで戻りますか？", labelEn: "Return to the Day of the Surgery?", unlockIds: ["day3_return_to_operation_choice"], kind: "choice" },
      { id: "day3_after_loop_disabled_choice", label: "摘出する／鷹宮先生を待つ／逃げる", labelEn: "Remove It / Wait for Takamiya / Run Away", unlockIds: ["day3_after_loop_disabled_choice"], kind: "choice" },
      { id: "day3_remove_gauze_bad_end", label: "バッドエンド７ 摘出×", labelEn: "Bad End 7: Removal Failed", unlockIds: ["day3_remove_gauze_bad_end"], kind: "bad" },
      { id: "day3_run_away_bad_end", label: "バッドエンド８ 逃げちゃダメだ", labelEn: "Bad End 8: Running Away", unlockIds: ["day3_run_away_bad_end"], kind: "bad" },
      { id: "day3_takamiya_report_choice", label: "何を伝える？", labelEn: "What Do You Tell Him?", unlockIds: ["day3_takamiya_report_choice"], kind: "choice" },
      { id: "day3_blame_bad_end", label: "バッドエンド９ 責任を押し付けるな", labelEn: "Bad End 9: Don't Shift the Blame", unlockIds: ["day3_blame_takamiya_bad_end", "day3_blame_bad_end"], kind: "bad" },
      { id: "day3_ask_save_patient_choice", label: "患者さんを助けてください", labelEn: "Please Save the Patient", unlockIds: ["day3_ask_save_patient_choice"], kind: "choice" },
      { id: "day3_route_a_no_transfer_choice", label: "ループを使う？", labelEn: "Use the Loop?", unlockIds: ["day3_route_a_no_transfer_choice"], kind: "choice" },
      { id: "route_a_good", label: "グッドエンド 医療に、やり直しはない。", labelEn: "Good End: There Are No Do-Overs in Medicine", unlockIds: ["route_a_good"], kind: "good" },
      { id: "route_a_true", label: "トゥルーエンド それでも、前へ進む。", labelEn: "True End: Even So, He Moves Forward", unlockIds: ["route_a_true"], kind: "true" },
    ],
  },
];

function isUnlocked(ending: RouteEnding, seenEndings: string[]) {
  return ending.ids.some((id) => seenEndings.includes(id));
}

function isChartUnlocked(
  chartNode: ChartNode,
  seenEndings: string[],
  visitedNodeIds: string[]
) {
  return chartNode.unlockIds.some(
    (id) => seenEndings.includes(id) || visitedNodeIds.includes(id)
  );
}

export function RouteMapScreen({
  seenEndings,
  visitedNodeIds,
  lang,
  onBack,
}: Props) {
  const isEn = lang === "en";
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
        {isEn ? "Return to Title" : "タイトルへ戻る"}
      </button>

      <div className="routeMapHeader">
        <h1>{isEn ? "Route Map" : "ルートマップ"}</h1>
<p>
  {unlockedCount}/{totalEndingCount}{" "}
  {isEn ? "Collected" : "回収"}
</p>
      </div>

      <section className="storyChartSection">
        <h2>{isEn ? "Story Chart" : "ストーリーチャート"}</h2>

        <div className="storyChartDays">
          {STORY_CHART.map((day) => (
            <div className="storyChartDay" key={day.label}>
              <h3>{isEn ? day.labelEn : day.label}</h3>

              <div className="storyChartNodes">
                {day.nodes.map((chartNode, index) => {
                  const unlocked = isChartUnlocked(
                    chartNode,
                    seenEndings,
                    visitedNodeIds
                  );

                  return (
                    <div className="storyChartNodeWrap" key={chartNode.id}>
                      <div
                        className={`storyChartNode storyChartNode-${
                          chartNode.kind ?? "choice"
                        } ${unlocked ? "unlocked" : "locked"}`}
                      >
                        <span className="storyChartNodeMark">
                          {unlocked ? "✓" : "？"}
                        </span>
                        <span>
  {unlocked
    ? isEn
      ? chartNode.labelEn
      : chartNode.label
    : "？？？"}
</span>
                      </div>

                      {index < day.nodes.length - 1 && (
                        <div className="storyChartLine" />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="routeMapSections">
        {SECTIONS.map((section) => (
          <section
            className={`routeMapSection routeMapSection-${section.className}`}
            key={section.label}
          >
            <h2>{isEn ? section.labelEn : section.label}</h2>

            {section.endings.length === 0 ? (
              <div className="routeMapEmpty">
                {isEn ? "There are no bad endings for this day." : "この日のバッドエンドはありません。"}
              </div>
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
                            alt={isEn ? ending.titleEn : ending.title}
                          />
                        ) : (
                          <div className="routeEndingUnknown">？？？</div>
                        )}
                      </div>

                      <div className="routeEndingBody">
                        <div className="routeEndingDate">
  {unlocked ? (isEn ? ending.dateEn ?? ending.date : ending.date) : "？？？"}
</div>

<h3>{unlocked ? (isEn ? ending.titleEn : ending.title) : "？？？"}</h3>
                        <p>
  {unlocked
    ? isEn
      ? ending.textEn
      : ending.text
    : isEn
      ? "Not reached"
      : "未到達"}
</p>

<small>
  {unlocked
    ? isEn
      ? "Unlocked"
      : "到達済み"
    : isEn
      ? "Locked"
      : "未回収"}
</small>
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
        {isEn ? "Return to Title" : "タイトルへ戻る"}
      </button>
    </div>
  );
}