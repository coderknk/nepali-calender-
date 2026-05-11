// Nepali months names
const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भाद्र", "आश्विन",
  "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुण", "चैत्र"
];

// Convert English numbers to Nepali/Devanagari
function toNepaliNumber(num) {
  const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return num.toString().split("").map(digit => nepaliDigits[parseInt(digit)] || digit).join("");
}

// DOM elements
const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");
const todayText = document.getElementById("todayText");
const clock = document.getElementById("clock");
const modal = document.getElementById("modal");
const modalDate = document.getElementById("modalDate");
const eventTitle = document.getElementById("eventTitle");
const eventDesc = document.getElementById("eventDesc");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const saveBtn = document.getElementById("saveBtn");
const deleteBtn = document.getElementById("deleteBtn");
const closeBtn = document.getElementById("closeBtn");
const toast = document.getElementById("toast");

// State variables
let currentMonth = 0;
let currentYear = 2081;
let selectedDate = "";
let bsDate = { day: 1, month: 1, year: 2081 };

// Initialize calendar with current date
function initCalendar() {
  const now = new Date();
  const bs = bikramSambat.fromAD(now.getFullYear(), now.getMonth() + 1, now.getDate());
  bsDate = { day: bs.day, month: bs.month, year: bs.year };
  currentMonth = bs.month - 1;
  currentYear = bs.year;
  
  renderCalendar();
  updateClock();
  setInterval(updateClock, 1000);
}

// Update clock
function updateClock() {
  const now = new Date();
  const hours = toNepaliNumber(now.getHours().toString().padStart(2, '0'));
  const minutes = toNepaliNumber(now.getMinutes().toString().padStart(2, '0'));
  const seconds = toNepaliNumber(now.getSeconds().toString().padStart(2, '0'));
  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

function renderCalendar() {

  calendar.innerHTML = "";

  monthYear.innerText =
    `${nepaliMonths[currentMonth]} ${toNepaliNumber(currentYear)}`;

  todayText.innerText =
    `आज: ${toNepaliNumber(bsDate.day)} ${nepaliMonths[bsDate.month - 1]} ${toNepaliNumber(bsDate.year)}`;

  // Nepali month days
  const monthDays = [
    31, 31, 32, 31, 31, 30,
    30, 30, 29, 30, 29, 31
  ];

  const totalDays = monthDays[currentMonth];

  // Calculate first day offset (simplified - starts from Sunday)
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const firstDayOffset = firstDayOfMonth;

  // Empty boxes for alignment
  for (let x = 0; x < firstDayOffset; x++) {

    const empty = document.createElement("div");

    empty.classList.add("empty");

    calendar.appendChild(empty);
  }

  // Actual dates
  for (let i = 1; i <= totalDays; i++) {

    const day = document.createElement("div");

    day.classList.add("day");

    // Highlight today
    if (
      i === bsDate.day &&
      currentMonth === bsDate.month - 1 &&
      currentYear === bsDate.year
    ) {
      day.classList.add("today");
    }

    const key = `${currentYear}-${currentMonth + 1}-${i}`;

    const saved = JSON.parse(localStorage.getItem(key));

    day.innerHTML = `
      <div class="day-number">${toNepaliNumber(i)}</div>

      ${
        saved
          ? `
          <div class="event-title">${saved.title}</div>
          <div class="event-dot"></div>
        `
          : ""
      }
    `;

    // Click event
    day.onclick = () => {

      selectedDate = key;

      modal.classList.remove("hidden");

      modalDate.innerText =
        `${toNepaliNumber(i)} ${nepaliMonths[currentMonth]}`;

      if (saved) {
        eventTitle.value = saved.title;
        eventDesc.value = saved.desc;
      } else {
        eventTitle.value = "";
        eventDesc.value = "";
      }
    };

    calendar.appendChild(day);
  }
}

// Navigation
prevBtn.onclick = () => {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
};

nextBtn.onclick = () => {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
};

// Modal functionality
saveBtn.onclick = () => {
  const title = eventTitle.value.trim();
  const desc = eventDesc.value.trim();
  
  if (!title) {
    showToast("कृपया कार्यक्रम शीर्षक लेख्नुहोस्");
    return;
  }
  
  const eventData = { title, desc };
  localStorage.setItem(selectedDate, JSON.stringify(eventData));
  
  modal.classList.add("hidden");
  showToast("कार्यक्रम सेभ गरियो");
  renderCalendar();
};

deleteBtn.onclick = () => {
  if (confirm("कार्यक्रम मेटाउने हो?")) {
    localStorage.removeItem(selectedDate);
    modal.classList.add("hidden");
    showToast("कार्यक्रम मेटाइयो");
    renderCalendar();
  }
};

closeBtn.onclick = () => {
  modal.classList.add("hidden");
};

// Click outside modal to close
modal.onclick = (e) => {
  if (e.target === modal) {
    modal.classList.add("hidden");
  }
};

// Toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show-toast");
  setTimeout(() => {
    toast.classList.remove("show-toast");
  }, 3000);
}

// Initialize on load
window.onload = initCalendar;