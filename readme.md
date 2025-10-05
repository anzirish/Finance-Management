# Personal Finance Dashboard
## Introduction
The Personal Finance Dashboard is a lightweight, browser-based finance management tool designed to help users track income, expenses, budgets, savings goals, and bills — all without storing data on external servers. It leverages browser localStorage for data persistence and Chart.js for data visualization, allowing users to keep their financial data private while enjoying real-time insights. The application provides a complete personal finance management solution with visual analytics, budget monitoring, and comprehensive reporting features.
## Project Type
Frontend
## Deployed App
Frontend: https://finance-management-dashboard.netlify.app/ </br>
Database: N/A (Data stored locally in browser)
## Directory Structure
```
personal-finance-dashboard/
├─ index.html
├─ styles.css
├─ app.js
└─ README.md
```
## Features
- Track income and expenses with category, payee, and notes
- Manage multiple accounts with editable balances
- Create and monitor savings goals with progress bars
- Set monthly budgets per category and get alerts when exceeded
- Add and track upcoming bills with due dates and quick payment logging
- Visual charts for income vs expense trends and category-wise spending
- Import/export all data in JSON format for backup
- Generate simple monthly, quarterly, or yearly reports
- Mobile-responsive design for accessibility across devices
- Browser notifications for budget alerts
- Search and filter functionality for transactions
## Design Decisions or Assumptions
- Data is stored locally in localStorage for privacy, with no server required
- Chart.js used for visualizing trends and category distributions
- Single-page HTML, CSS, and vanilla JavaScript for minimal dependencies
- Mobile-responsive design for accessibility across devices
- Budgets trigger browser notifications if exceeded with user permission
- Assumed users prioritize privacy and prefer local data storage over cloud solutions
- Implemented JSON import/export for data portability and backup
- Used vanilla JavaScript to avoid framework overhead for a lightweight application
## Installation & Getting started
```bash
git clone https://github.com/anzirish/Finance-Management.git
cd personal-finance-dashboard
open index.html
```
Simply clone or download the repository and open `index.html` in any modern browser. No installation required.
## Usage
```bash
# Open in browser
open index.html
```
1. Open the app in your browser
2. Add accounts, transactions, budgets, goals, and bills using the respective forms
3. Use filters and search to find transactions quickly
4. View charts and reports for insights
5. Export data for backup or import previously saved JSON files

![Personal Finance Dashboard Screenshot](https://github.com/anzirish/Masai/blob/main/Screenshot%20(113).png)
## Credentials
No authentication required — all features are available offline.
## APIs Used
- Chart.js - For visualizing trends and category-based spending (https://www.chartjs.org/)
## Technology Stack
- HTML5
- CSS3
- Vanilla JavaScript
- Chart.js
- localStorage API
