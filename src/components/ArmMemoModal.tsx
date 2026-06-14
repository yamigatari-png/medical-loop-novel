import { useState } from "react";
import type { ArmMemoKey, Lang } from "../types";

type Props = {
  armMemos: ArmMemoKey[];
  loopStock: number;
  lang: Lang;
  onClose: () => void;
  lockOpen?: boolean;
  allowStoryProgress?: boolean;
};

const ARM_MEMO_IMAGE: Record<ArmMemoKey, string> = {
  take_me_back: "/arm/memo_take_me_back.webp",
  responsibility_1: "/arm/memo_responsibility_1.webp",
  loop_limit: "/arm/memo_loop_limit.webp",
  dont_run: "/arm/memo_dont_run.webp",
  promise: "/arm/memo_promise.webp",
  responsibility_2: "/arm/memo_responsibility_2.webp",
  report: "/arm/memo_report.webp",
  drunk_drive_ng: "/arm/memo_drunk_drive_ng.webp",
  walk_ng: "/arm/memo_walk_ng.webp",
  go_hospital: "/arm/memo_go_hospital.webp",
  pain_order: "/arm/memo_pain_order.webp",
  resection_ng: "/arm/memo_resection_ng.webp",
  bus_ng: "/arm/memo_bus_ng.webp",
  op_prep_1: "/arm/memo_op_prep_1.webp",
  op_prep_2: "/arm/memo_op_prep_2.webp",
  idcard: "/arm/memo_idcard.webp",
  allergy: "/arm/memo_allergy.webp",
  History_Taking: "/arm/memo_History_Taking.webp",
};

const ARM_MEMO_IMAGE_EN: Record<ArmMemoKey, string> = {
  take_me_back: "/arm/en/memo_take_me_back.webp",
  responsibility_1: "/arm/en/memo_responsibility_1.webp",
  loop_limit: "/arm/en/memo_loop_limit.webp",
  dont_run: "/arm/en/memo_dont_run.webp",
  promise: "/arm/en/memo_promise.webp",
  responsibility_2: "/arm/en/memo_responsibility_2.webp",
  report: "/arm/en/memo_report.webp",
  drunk_drive_ng: "/arm/en/memo_drunk_drive_ng.webp",
  walk_ng: "/arm/en/memo_walk_ng.webp",
  go_hospital: "/arm/en/memo_go_hospital.webp",
  pain_order: "/arm/en/memo_pain_order.webp",
  resection_ng: "/arm/en/memo_resection_ng.webp",
  bus_ng: "/arm/en/memo_bus_ng.webp",
  op_prep_1: "/arm/en/memo_op_prep_1.webp",
  op_prep_2: "/arm/en/memo_op_prep_2.webp",
  idcard: "/arm/en/memo_idcard.webp",
  allergy: "/arm/en/memo_allergy.webp",
  History_Taking: "/arm/en/memo_History_Taking.webp",
};

const ARM_BASE_IMAGE = {
  ja: "/arm/arm_base.webp",
  en: "/arm/en/arm_base.webp",
} as const;

function getInkClass(loopStock: number): string {
  if (loopStock < 3) return "inkVeryFaded";
  if (loopStock < 5) return "inkFaded";
  return "";
}

export function ArmMemoModal({
  armMemos,
  loopStock,
  lang,
  lockOpen = false,
  allowStoryProgress = false,
  onClose,
}: Props) {
  const [closing, setClosing] = useState(false);
  const inkClass = getInkClass(loopStock);
  const memoImages =
  lang === "en" ? ARM_MEMO_IMAGE_EN : ARM_MEMO_IMAGE;

const armBaseImage =
  lang === "en"
    ? ARM_BASE_IMAGE.en
    : ARM_BASE_IMAGE.ja;

  function handleClose() {
    setClosing(true);
    window.setTimeout(() => {
      onClose();
    }, 320);
  }

    return (
    <>
      <div
        className={`armMemoOverlay ${closing ? "closing" : ""} ${
  allowStoryProgress ? "storyProgressAllowed armMemoBehindText" : ""
}`}
      >
        <div className={`armMemoPanel ${closing ? "closing" : ""}`}>
          <div className="armCanvas">
            <img
              src={armBaseImage}
              className="armLayer"
              alt="arm"
            />

            {[...armMemos]
              .sort((a, b) => {
                if (a === "take_me_back") return -1;
                if (b === "take_me_back") return 1;
                return 0;
              })
              .map((memo) => (
                <img
                  key={memo}
                  src={memoImages[memo]}
                  className={`armLayer armInkLayer ${inkClass}`}
                  alt=""
                />
              ))}
          </div>
        </div>
      </div>
            {!lockOpen && (
        <button className="armMemoCloseGlobal" onClick={handleClose}>
          ×
        </button>
      )}
    </>
  );
}