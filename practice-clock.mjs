const days = ["월요일", "화요일", "수요일", "목요일", "금요일", "토요일", "일요일"];
const englishDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const week = 7 * 1440;
const clock = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Seoul", weekday: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });

function minutes(value) {
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

// 서울 기준, 월요일 00:00부터 흐른 분
function seoulWeekMinute() {
  const parts = Object.fromEntries(clock.formatToParts(new Date()).map(({ type, value }) => [type, value]));
  return englishDays.indexOf(parts.weekday) * 1440 + Number(parts.hour) * 60 + Number(parts.minute);
}

function relative(delta) {
  const day = Math.floor(delta / 1440);
  const hour = Math.floor((delta % 1440) / 60);
  const minute = delta % 60;
  if (day) return `${day}일${hour ? ` ${hour}시간` : ""} 후`;
  if (hour) return `${hour}시간${minute ? ` ${minute}분` : ""} 후`;
  return `${Math.max(minute, 1)}분 후`;
}

const sessions = [...document.querySelectorAll(".schedule-row")].map((row) => {
  const [start, end] = [...row.querySelectorAll("time")].map((time) => time.dateTime);
  const dayStart = days.indexOf(row.dataset.day) * 1440;
  return { row, start, startAt: dayStart + minutes(start), endAt: dayStart + minutes(end) };
});

function render() {
  const now = seoulWeekMinute();
  const upcoming = sessions.map((session) => {
    const live = now >= session.startAt && now < session.endAt;
    return { ...session, live, wait: live ? 0 : (session.startAt - now + week) % week };
  }).sort((a, b) => a.wait - b.wait);

  for (const target of document.querySelectorAll("[data-next-practice]")) {
    target.querySelector("ol").replaceChildren(...upcoming.slice(0, Number(target.dataset.nextPractice)).map(({ row, start, live, wait }) => {
      const item = document.createElement("li");
      item.className = live ? "is-live" : "";
      for (const [tag, className, text] of [
        ["span", "next-when", `${row.dataset.day} ${start}`],
        ["strong", "next-team", row.dataset.team],
        ["span", "next-place", row.dataset.place],
        ["em", "next-countdown", live ? "지금 운동 중" : relative(wait)],
      ]) {
        const node = document.createElement(tag);
        node.className = className;
        node.textContent = text;
        item.append(node);
      }
      return item;
    }));
    target.hidden = false;
  }
}

if (sessions.length) {
  render();
  setInterval(render, 30_000);
}

// 배경 영상: 움직임 줄이기 설정을 따르고, 정지 버튼을 제공한다.
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");

// 문의 패널이 보이면 하단 고정 버튼을 숨긴다.
const stickyCta = document.querySelector(".sticky-cta");
const joinPanel = document.querySelector("#join");
if (stickyCta && joinPanel && "IntersectionObserver" in window) {
  new IntersectionObserver(([entry]) => stickyCta.classList.toggle("is-hidden", entry.isIntersecting)).observe(joinPanel);
}

// 스크롤하면 섹션이 아래에서 떠오른다.
if (!reduceMotion.matches && "IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries) => {
    for (const { isIntersecting, target } of entries) {
      if (!isIntersecting) continue;
      target.classList.add("is-in");
      observer.unobserve(target);
    }
  }, { rootMargin: "0px 0px -8% 0px" });
  for (const section of document.querySelectorAll("main > section:not(:first-child), main > .section, .stat-cards > div, .learn-steps li, .team-details .schedule-row")) {
    section.classList.add("reveal");
    observer.observe(section);
  }
}
for (const toggle of document.querySelectorAll(".video-toggle")) {
  const video = toggle.parentElement.querySelector(".hero-video");
  if (!video) continue;
  const setPaused = (paused) => {
    if (paused) video.pause();
    else video.play().catch(() => {});
    toggle.setAttribute("aria-pressed", String(paused));
    toggle.textContent = paused ? "배경 영상 재생" : "배경 영상 정지";
  };
  setPaused(reduceMotion.matches);
  toggle.addEventListener("click", () => setPaused(!video.paused));
  toggle.hidden = false;
}
