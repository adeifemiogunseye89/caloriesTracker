// Get references to the HTML elements
const lightActivitySelect = document.getElementById('activitySelect');
const moderateActivitySelect = document.getElementById('active');
const vigorousActivitySelect = document.getElementById('activities');
const durationInput = document.getElementById('durationInput');
const weightInput = document.getElementById('weightInput');
const calculateButton = document.getElementById('calculateButton');
const resultDiv = document.getElementById('result');

// Store all select elements in an array for easier handling
const allSelects = [lightActivitySelect, moderateActivitySelect, vigorousActivitySelect];

// --- Function to reset other select elements ---
function resetOtherSelects(currentSelect) {
    allSelects.forEach(select => {
        // If the select element is not the one that was just changed...
        if (select !== currentSelect) {
            // ...reset its value to the default (empty string)
            select.value = "";
        }
    });
}

// --- Add event listeners to each select to handle resetting others ---
allSelects.forEach(select => {
    select.addEventListener('change', (event) => {
        // When a selection is made (and it's not the placeholder)
        // reset the other dropdowns.
        if (event.target.value !== "") {
            resetOtherSelects(event.target); // Pass the changed select element
        }
    });
});


// --- Add event listener to the button ---
calculateButton.addEventListener('click', calculateCalories);

// --- Function to perform the calculation ---
function calculateCalories() {
    // --- 1. Find the selected MET value ---
    let metValueString = "";
    // Check each select box. If one has a non-empty value, use it.
    if (lightActivitySelect.value !== "") {
        metValueString = lightActivitySelect.value;
    } else if (moderateActivitySelect.value !== "") {
        metValueString = moderateActivitySelect.value;
    } else if (vigorousActivitySelect.value !== "") {
        metValueString = vigorousActivitySelect.value;
    }

    // --- 2. Get duration and weight ---
    const durationMinutesString = durationInput.value;
    const weightKgString = weightInput.value;

    // --- 3. Validate Input ---
    // Check if *any* activity was selected AND duration/weight were entered
    if (!metValueString || !durationMinutesString || !weightKgString) {
        resultDiv.textContent = 'Error: Please select ONE activity and enter duration and weight.';
        resultDiv.style.color = 'red';
        return; // Stop the function
    }

    // --- 4. Convert values to numbers ---
    const metValue = parseFloat(metValueString);
    const durationMinutes = parseFloat(durationMinutesString);
    const weightKg = parseFloat(weightKgString);

    // --- Further Validation ---
    if (isNaN(metValue) || isNaN(durationMinutes) || isNaN(weightKg) || durationMinutes < 0 || weightKg < 0 || metValue <= 0) { // Added metValue > 0 check
         resultDiv.textContent = 'Error: Please enter valid positive numbers for duration, weight, and select a valid activity.';
         resultDiv.style.color = 'red';
         return; // Stop if conversion failed or values are invalid
    }


    // --- 5. Perform the Calculation ---
    const durationHours = durationMinutes / 60;
    // Formula: Calories ≈ METs * Weight(kg) * Time(hours)
    const caloriesBurned = metValue * weightKg * durationHours;

    // --- 6. Display the Result ---
    resultDiv.textContent = `Estimated Calories Burned: ${caloriesBurned.toFixed(1)}`;
    resultDiv.style.color = 'black'; // Reset color
};


document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const monthSelect = document.getElementById('month-select');
    const yearSelect = document.getElementById('year-select');
    const calendarBody = document.getElementById('calendar-body');
    const prevMonthButton = document.getElementById('prev-month');
    const nextMonthButton = document.getElementById('next-month');
    const todayButton = document.getElementById('today-button');
    const scheduleSection = document.getElementById('schedule-section');
    const selectedDateDisplay = document.getElementById('selected-date-display');
    const scheduleTableContainer = document.getElementById('schedule-table-container');
    const noScheduleMessage = document.getElementById('no-schedule-message');
    const scheduleTableTemplate = document.getElementById('schedule-table-template');

    // --- State ---
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)
    let currentYear = currentDate.getFullYear();
    let selectedDateStr = null; // To store the currently selected date string 'YYYY-MM-DD'

    // --- Constants ---
    const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const START_YEAR = 1960;
    const CURRENT_YEAR = new Date().getFullYear();

    // --- Initialization ---
    populateYearSelect();
    populateMonthSelect();
    renderCalendar(currentYear, currentMonth);
    setupEventListeners();
    showNoScheduleMessage(); // Initially show the placeholder message


    // --- Functions ---

    function populateYearSelect() {
        for (let year = START_YEAR; year <= CURRENT_YEAR; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        yearSelect.value = currentYear; // Set initial value
    }

    function populateMonthSelect() {
        MONTH_NAMES.forEach((name, index) => {
            const option = document.createElement('option');
            option.value = index; // 0-indexed month
            option.textContent = name;
            monthSelect.appendChild(option);
        });
        monthSelect.value = currentMonth; // Set initial value
    }

    function renderCalendar(year, month) {
        calendarBody.innerHTML = ''; // Clear previous calendar
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0=Sun, 1=Mon,...
        const daysInMonth = new Date(year, month + 1, 0).getDate(); // Get last day of current month

        let date = 1;
        const todayStr = formatDate(new Date()); // YYYY-MM-DD format for comparison

        // Create rows (max 6 weeks)
        for (let i = 0; i < 6; i++) {
            const row = document.createElement('tr');
            let allCellsEmptyInRow = true;

            // Create cells (7 days a week)
            for (let j = 0; j < 7; j++) {
                const cell = document.createElement('td');
                // Fill in days only after the first day and within the month's range
                if (i === 0 && j < firstDayOfMonth) {
                    cell.classList.add('empty');
                } else if (date > daysInMonth) {
                    cell.classList.add('empty');
                } else {
                    allCellsEmptyInRow = false; // Mark row as not empty
                    cell.textContent = date;
                    cell.classList.add('clickable-day');
                    const cellDate = new Date(year, month, date);
                    const cellDateStr = formatDate(cellDate);
                    cell.dataset.date = cellDateStr; // Store date as 'YYYY-MM-DD'

                    if (cellDateStr === todayStr) {
                        cell.classList.add('today');
                    }
                    if (cellDateStr === selectedDateStr) {
                        cell.classList.add('selected'); // Re-apply selected style if rendering again
                    }

                    cell.addEventListener('click', handleDateClick);
                    date++;
                }
                row.appendChild(cell);
            }

            // Only add the row if it contains actual dates (prevents empty last row)
             if (!allCellsEmptyInRow) {
                calendarBody.appendChild(row);
             }
        }
        // Update selects to reflect current view
        yearSelect.value = year;
        monthSelect.value = month;
    }

    function handleDateClick(event) {
        const clickedCell = event.target;
        if (!clickedCell.classList.contains('clickable-day')) return; // Ignore clicks on empty cells

        selectedDateStr = clickedCell.dataset.date; // Update selected date

        // Update visual selection
        document.querySelectorAll('#calendar td.selected').forEach(td => td.classList.remove('selected'));
        clickedCell.classList.add('selected');

        // Format date for display (e.g., "October 27, 2023")
        const [year, month, day] = selectedDateStr.split('-').map(Number);
        const displayDate = new Date(year, month - 1, day); // Month is 0-indexed for Date constructor
        selectedDateDisplay.textContent = displayDate.toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric'
        });

        // Show schedule section and load data
        displayScheduleForDate(selectedDateStr);
    }

    function displayScheduleForDate(dateStr) {
        scheduleTableContainer.innerHTML = ''; // Clear previous table
        noScheduleMessage.classList.add('hidden'); // Hide placeholder message

        // Clone the template
        const scheduleTableNode = scheduleTableTemplate.content.cloneNode(true);
        const checkboxes = scheduleTableNode.querySelectorAll('input[type="checkbox"]');

        // Load data from localStorage
        const savedSchedule = loadSchedule(dateStr); // Returns object like { morning: true, ... } or {}

        // Set checkbox states based on loaded data
        checkboxes.forEach(checkbox => {
            const timeslot = checkbox.dataset.timeslot;
            checkbox.checked = savedSchedule[timeslot] || false; // Set checked state, default to false
            // Add event listener to save on change
            checkbox.addEventListener('change', () => saveSchedule(dateStr));
        });

        // Append the populated table to the container
        scheduleTableContainer.appendChild(scheduleTableNode);
        scheduleSection.classList.remove('hidden'); // Show the schedule section
    }

     function showNoScheduleMessage() {
        scheduleSection.classList.remove('hidden'); // Ensure section is visible
        scheduleTableContainer.innerHTML = ''; // Clear any old table
        selectedDateDisplay.textContent = "..."; // Reset date display
        noScheduleMessage.classList.remove('hidden'); // Show the message
    }

    function saveSchedule(dateStr) {
        if (!dateStr) return; // Don't save if no date is selected

        const checkboxes = scheduleTableContainer.querySelectorAll('input[type="checkbox"]');
        const scheduleData = {};

        checkboxes.forEach(checkbox => {
            const timeslot = checkbox.dataset.timeslot;
            scheduleData[timeslot] = checkbox.checked;
        });

        try {
            localStorage.setItem(dateStr, JSON.stringify(scheduleData));
            console.log(`Schedule saved for ${dateStr}:`, scheduleData);
        } catch (e) {
            console.error("Error saving to localStorage:", e);
            alert("Could not save schedule. LocalStorage might be full or disabled.");
        }
    }

    function loadSchedule(dateStr) {
        try {
            const data = localStorage.getItem(dateStr);
            return data ? JSON.parse(data) : {}; // Return parsed data or empty object
        } catch (e) {
            console.error("Error reading from localStorage:", e);
            return {}; // Return empty object on error
        }
    }

    // Helper function to format date as 'YYYY-MM-DD'
    function formatDate(date) {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
        const day = date.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // --- Event Listeners Setup ---
    function setupEventListeners() {
        prevMonthButton.addEventListener('click', () => {
            currentMonth--;
            if (currentMonth < 0) {
                currentMonth = 11;
                currentYear--;
            }
            renderCalendar(currentYear, currentMonth);
        });

        nextMonthButton.addEventListener('click', () => {
            currentMonth++;
            if (currentMonth > 11) {
                currentMonth = 0;
                currentYear++;
            }
            renderCalendar(currentYear, currentMonth);
        });

        todayButton.addEventListener('click', () => {
            currentDate = new Date();
            currentYear = currentDate.getFullYear();
            currentMonth = currentDate.getMonth();
            selectedDateStr = null; // Reset selection when jumping to today
            renderCalendar(currentYear, currentMonth);
            showNoScheduleMessage(); // Hide schedule when jumping
        });

        yearSelect.addEventListener('change', (e) => {
            currentYear = parseInt(e.target.value);
            renderCalendar(currentYear, currentMonth);
        });

        monthSelect.addEventListener('change', (e) => {
            currentMonth = parseInt(e.target.value);
            renderCalendar(currentYear, currentMonth);
        });
    }
});







/*// Get references to the HTML elements we need to interact with
const activitySelect = document.getElementById('activitySelect');
const durationInput = document.getElementById('durationInput');
const weightInput = document.getElementById('weightInput');
const calculateButton = document.getElementById('calculateButton');
const resultDiv = document.getElementById('result');

// Function to perform the calculation
function calculateCalories() {
    // --- 1. Get the selected MET value ---
    // 'activitySelect.value' directly gives us the 'value' attribute
    // of the currently selected <option>
    const metValueString = activitySelect.value;

    // --- 2. Get the duration and weight values ---
    const durationMinutesString = durationInput.value;
    const weightKgString = weightInput.value;

    // --- 3. Validate Input ---
    // Check if an activity was selected and if duration/weight were entered
    if (!metValueString || !durationMinutesString || !weightKgString) {
        resultDiv.textContent = 'Error: Please select an activity and enter duration and weight.';
        resultDiv.style.color = 'red'; // Make errors stand out
        return; // Stop the function here if input is missing
    }

    // --- 4. Convert values to numbers ---
    // Values from input fields and select options are initially strings.
    // We need to convert them to numbers for calculations.
    // Use parseFloat to allow for decimal MET values.
    const metValue = parseFloat(metValueString);
    const durationMinutes = parseFloat(durationMinutesString);
    const weightKg = parseFloat(weightKgString);

    // --- Further Validation ---
    // Check if the converted values are valid numbers and non-negative
    if (isNaN(metValue) || isNaN(durationMinutes) || isNaN(weightKg) || durationMinutes < 0 || weightKg < 0) {
         resultDiv.textContent = 'Error: Please enter valid positive numbers for duration and weight.';
         resultDiv.style.color = 'red';
         return; // Stop if conversion failed or values are invalid
    }


    // --- 5. Perform the Calculation ---
    // Convert duration from minutes to hours for the formula
    const durationHours = durationMinutes / 60;

    // Formula: Calories ≈ METs * Weight(kg) * Time(hours)
    const caloriesBurned = metValue * weightKg * durationHours;

    // --- 6. Display the Result ---
    // Update the text content of the resultDiv
    // .toFixed(1) rounds the result to 1 decimal place for readability
    resultDiv.textContent = `Estimated Calories Burned during this activity is: ${caloriesBurned.toFixed(1)}`;
    resultDiv.style.color = 'black'; // Reset color in case it was red before
};

// Add an event listener to the button
// When the button is clicked, run the 'calculateCalories' function
calculateButton.addEventListener('click', calculateCalories);*/


