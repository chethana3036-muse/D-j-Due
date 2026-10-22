# Déjà Due: Smart Calendar-Integrated Date Alarm Engine with AI & Python

## 🎓 Academic Project Submission Summary

- **Project Title:** Déjà Due — High-Precision Date-Specific Alarm & Calendar Engine
- **Primary Domain:** Human-Computer Interaction, Artificial Intelligence & Time-Series Scheduling
- **Tech Stack:** Python 3.10, Google Gemini AI (@google/genai), Express Full-Stack, React 19, Web Audio Synthesizer, Tailwind CSS
- **Submission Author:** Chethana

---

## 💡 1. Problem Statement & Motivation

Modern smartphones provide two distinct temporal management tools that suffer from a critical usability gap:
1. **Clock App Alarms:** Deliver auditory urgency (loud chimes, persistent vibration, wake-up missions), but are constrained strictly to repeating days-of-the-week (e.g. "Every Monday at 7:00 AM"). Setting an alarm for a specific calendar date (e.g., *December 22nd, 2026 for a Best Friend's Birthday*) is impossible.
2. **Calendar Apps:** Support future date selection, but only trigger quiet, single-ping system notifications that are easily overlooked during sleep or busy hours.

**Déjà Due** solves this dilemma by bridging **calendar date specificity** with **alarm clock sensory urgency**. Users can set alarms for any future day (such as December 22, 2026), recurring annual milestones, or specific countdowns with custom wake-up audio, heartfelt greeting cards, and AI-assisted scheduling.

---

## 🧠 2. Python Architecture & AI Integration

The core engine is implemented in Python (`server/python/alarm_ai_core.py`) and coupled to Google Gemini 3.8 Flash via full-stack Express bridging:

1. **Natural Language Parser (`NLPAlarmParser`):**
   - Extracts date tokens (day, month, year, relative targets like "tomorrow" or "Dec 22 2026").
   - Identifies time tokens and meridiem (`AM`/`PM`).
   - Categorizes alarms into meaningful life clusters: `BFF_BIRTHDAY`, `ROMANCE`, `SELF_CARE`, `EXAM_WORK`, `TRAVEL`, `MILESTONE`.
   - Google Gemini AI fallback for complex conversational utterances.

2. **Leap-Year Safe Temporal Engine (`DateAlarm`):**
   - Handles boundary conditions, such as February 29th recurrences on non-leap years (clamped gracefully to February 28th).
   - Dynamically calculates remaining delta ($\Delta t = t_{target} - t_{now}$) down to second-level precision.
   - Detects scheduling conflicts where multiple active alarms occur within 15 minutes of each other.

3. **BFF Celebration Intelligence (`BFFCelebrationEngine`):**
   - Computes astrological zodiac signatures, multi-tier countdown timelines (100 days, 30 days, 1 week, midnight wake-up), and personalized warm wishes.

---

## 🔬 3. Computational Complexity Analysis

- **Conflict Detection:** $O(N \log N)$ where $N$ is the number of active alarms, utilizing TimSort on normalized POSIX timestamps followed by a single-pass adjacency scan.
- **NLP Token Parsing:** $O(L)$ where $L$ is input character length via deterministic regular expression matching.
- **Space Complexity:** $O(N)$ for state persistence and alarm queue representation.

---

## 🧪 4. Unit Testing & Verification

Automated test cases verified via Python's standard `unittest` framework:
- `test_bff_birthday_parsing`: Verifies parsing of strings such as `"set an alarm for 22nd dec 2026 as my bffs bday at 8:30am"`.
- `test_leap_year_handling`: Validates leap day (Feb 29) handling on non-leap years.
- `test_time_until_future`: Confirms exact multi-year delta calculations.

---

## 🎨 5. User Interface & Aesthetic Direction

Tailored with a soft pink, peach, and white gradient aesthetic, friendly rounded cards, intuitive calendar views, real Web Audio chime synthesis, and a dedicated Python & AI Studio tab where instructors can inspect the source code and run live diagnostics.
