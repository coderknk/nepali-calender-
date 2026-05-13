// Nepali months names
const nepaliMonths = [
  "बैशाख", "जेठ", "असार", "श्रावण", "भाद्र", "आश्विन",
  "कार्तिक", "मंसिर", "पौष", "माघ", "फाल्गुण", "चैत्र"
];

// Nepali weekdays
const nepaliWeekdays = ["आइत", "सोम", "मंगल", "बुध", "बिही", "शुक्र", "शनि"];

// Convert English numbers to Nepali/Devanagari
function toNepaliNumber(num) {
  const nepaliDigits = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];
  return num.toString().split("").map(digit => nepaliDigits[parseInt(digit)] || digit).join("");
}

// DOM elements
let calendar, monthYear, todayText, clock, modal, modalDate, eventTitle, eventDesc;
let prevBtn, nextBtn, saveBtn, deleteBtn, closeBtn, toast;

// State variables
let currentMonth = 0;
let currentYear = 2081;
let selectedDate = "";
let bsDate = { day: 1, month: 1, year: 2081 };

// Wait for DOM to be ready
function waitForDOM() {
  if (document.getElementById("calendar")) {
    initializeApp();
  } else {
    setTimeout(waitForDOM, 100);
  }
}

// Initialize the entire app
function initializeApp() {
  // Get DOM elements
  calendar = document.getElementById("calendar");
  monthYear = document.getElementById("monthYear");
  todayText = document.getElementById("todayText");
  clock = document.getElementById("clock");
  modal = document.getElementById("modal");
  modalDate = document.getElementById("modalDate");
  eventTitle = document.getElementById("eventTitle");
  eventDesc = document.getElementById("eventDesc");
  prevBtn = document.getElementById("prevBtn");
  nextBtn = document.getElementById("nextBtn");
  saveBtn = document.getElementById("saveBtn");
  deleteBtn = document.getElementById("deleteBtn");
  closeBtn = document.getElementById("closeBtn");
  toast = document.getElementById("toast");
  
  // Initialize calendar with current date
  initCalendar();
  
  // Add fade-in animation
  document.querySelector('.container').classList.add('fade-in');
}

// Initialize calendar with current date
function initCalendar() {
  const now = new Date();
  
  // Check if bikramSambat library is loaded
  if (typeof bikramSambat !== 'undefined') {
    try {
      const bs = bikramSambat.fromAD(now.getFullYear(), now.getMonth() + 1, now.getDate());
      bsDate = { day: bs.day, month: bs.month, year: bs.year };
      currentMonth = bs.month - 1;
      currentYear = bs.year;
    } catch (error) {
      console.error('Bikram Sambat conversion error:', error);
      // Fallback to approximate BS date
      bsDate = { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() + 57 };
      currentMonth = bsDate.month - 1;
      currentYear = bsDate.year;
    }
  } else {
    // Fallback if library not loaded
    console.warn('Bikram Sambat library not loaded, using fallback');
    bsDate = { day: now.getDate(), month: now.getMonth() + 1, year: now.getFullYear() + 57 };
    currentMonth = bsDate.month - 1;
    currentYear = bsDate.year;
  }
  
  renderCalendar();
  updateClock();
  setInterval(updateClock, 1000);
  
  // Setup event listeners
  setupEventListeners();
}

// Setup all event listeners
function setupEventListeners() {
  prevBtn.onclick = () => navigateMonth(-1);
  nextBtn.onclick = () => navigateMonth(1);
  saveBtn.onclick = saveEvent;
  deleteBtn.onclick = deleteEvent;
  closeBtn.onclick = () => modal.classList.add("hidden");
  
  // Click outside modal to close
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.add("hidden");
    }
  };
}

// Update clock with current time
function updateClock() {
  const now = new Date();
  const hours = toNepaliNumber(now.getHours().toString().padStart(2, '0'));
  const minutes = toNepaliNumber(now.getMinutes().toString().padStart(2, '0'));
  const seconds = toNepaliNumber(now.getSeconds().toString().padStart(2, '0'));
  clock.textContent = `${hours}:${minutes}:${seconds}`;
}

// Navigate between months
function navigateMonth(direction) {
  currentMonth += direction;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  } else if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
}

// Render calendar with current month data
function renderCalendar() {
  if (!calendar) return;
  
  calendar.innerHTML = "";

  // Update header
  monthYear.innerText = `${nepaliMonths[currentMonth]} ${toNepaliNumber(currentYear)}`;
  todayText.innerText = `आज: ${toNepaliNumber(bsDate.day)} ${nepaliMonths[bsDate.month - 1]} ${toNepaliNumber(bsDate.year)}`;

  // Nepali month days
  const monthDays = [
    31, 31, 32, 31, 31, 30,
    30, 30, 29, 30, 29, 31
  ];

  const totalDays = monthDays[currentMonth];

  // Calculate first day of the month (0 = Sunday)
  let firstDayOffset = 0;
  try {
    // Create a date object for the first day of the current month
    const firstDate = new Date(currentYear, currentMonth, 1);
    firstDayOffset = firstDate.getDay();
  } catch (error) {
    console.error('Date calculation error:', error);
    firstDayOffset = 0; // Default to Sunday
  }

  // Add empty boxes for alignment
  for (let x = 0; x < firstDayOffset; x++) {
    const empty = document.createElement("div");
    empty.classList.add("empty");
    calendar.appendChild(empty);
  }

  // Add actual dates
  for (let i = 1; i <= totalDays; i++) {
    const day = document.createElement("div");
    day.classList.add("day");

    // Highlight today's date with enhanced styling
    if (
      i === bsDate.day &&
      currentMonth === bsDate.month - 1 &&
      currentYear === bsDate.year
    ) {
      day.classList.add("today", "pulse");
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

    // Click event for adding/editing events
    day.onclick = () => {
      selectedDate = key;
      modal.classList.remove("hidden");
      modalDate.innerText = `${toNepaliNumber(i)} ${nepaliMonths[currentMonth]}`;

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

// Save event to localStorage
function saveEvent() {
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
}

// Delete event from localStorage
function deleteEvent() {
  if (confirm("कार्यक्रम मेटाउने हो?")) {
    localStorage.removeItem(selectedDate);
    modal.classList.add("hidden");
    showToast("कार्यक्रम मेटाइयो");
    renderCalendar();
  }
}

// Show toast notification
function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show-toast");
  setTimeout(() => {
    toast.classList.remove("show-toast");
  }, 3000);
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', waitForDOM);
} else {
  waitForDOM();
}

// Fallback initialization
window.onload = function() {
  if (!calendar) {
    waitForDOM();
  }
};