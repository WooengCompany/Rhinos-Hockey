const draft = document.querySelector(".inquiry-draft");
const purpose = draft.querySelector('select[name="purpose"]');
const session = draft.querySelector('select[name="session"]');
const message = draft.querySelector("textarea");
const copy = draft.querySelector(".copy-draft");
const status = draft.querySelector('[role="status"]');

const messages = {
  start: ["첫 체험", "스케이트 경험: ", "체험 비용과 장비 대여 여부, 준비물을 알려주세요."],
  youth: ["자녀 체험", "자녀 나이와 스케이트 경험: ", "참여할 수 있는 반, 장비 대여와 보호자 참관 여부를 알려주세요."],
  transfer: ["팀 이동", "하키 경력과 포지션: ", "훈련 방식과 체험 참여 가능 여부를 알려주세요."],
  watch: ["훈련 참관", "함께 방문할 인원: ", "참관 가능 여부와 도착 시간을 알려주세요."],
};

function updateMessage() {
  const [topic, experience, question] = messages[purpose.value];
  message.value = [
    `안녕하세요. ${draft.dataset.team} ${topic} 문의드립니다.`,
    `희망 일정: ${session.value || "상담 후 결정"}`,
    experience,
    question,
  ].join("\n");
  status.textContent = "";
}

draft.addEventListener("change", updateMessage);
if (navigator.clipboard?.writeText) {
  copy.hidden = false;
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(message.value);
      status.textContent = "문구를 복사했어요.";
    } catch {
      message.focus();
      message.select();
      status.textContent = "선택된 문구를 직접 복사해 주세요.";
    }
  });
}

updateMessage();
draft.hidden = false;
