# Personal Finance Dashboard

## Introduction
The **Personal Finance Dashboard** is a lightweight, browser-based finance management tool designed to help users track income, expenses, budgets, savings goals, and bills — all without storing data on external servers.  
It leverages browser localStorage for data persistence and Chart.js for data visualization, allowing users to keep their financial data private while enjoying real-time insights.

## Project Type
Frontend

## Deployed App
Frontend: _https://finance-management-dashboard.netlify.app/_  
Database: _N/A (Data stored locally in browser)_

## Directory Structure
personal-finance-dashboard/
├─ index.html

## Video Walkthrough of the project
_https://youtu.be/O-3edMYUrNs_

## Video Walkthrough of the codebase
_https://youtu.be/QricPpUaHx8_

## Features
- Track income and expenses with category, payee, and notes
- Manage multiple accounts with editable balances
- Create and monitor savings goals with progress bars
- Set monthly budgets per category and get alerts when exceeded
- Add and track upcoming bills with due dates and quick payment logging
- Visual charts for income vs expense trends and category-wise spending
- Import/export all data in JSON format for backup
- Generate simple monthly, quarterly, or yearly reports

## Design decisions or assumptions
- Data is stored locally in `localStorage` for privacy — no server required.
- Chart.js used for visualizing trends and category distributions.
- Single-page HTML, CSS, and vanilla JavaScript for minimal dependencies.
- Mobile-responsive design for accessibility across devices.
- Budgets trigger browser notifications if exceeded (with user permission).

## Screenshot

![Personal Finance Dashboard Screenshot](https://drive.google.com/uc?id=1j8vD5Wp4w1VGmcH3dfwO5RnOYLhFzGPM)

## Installation & Getting started
Simply clone/download the repository and open `index.html` in any modern browser. No installation required.

```bash
# Clone the repository
git clone https://github.com/anzirish/Finance-Management.git
cd personal-finance-dashboard

# Open in browser
open index.html   # or double-click the file

Usage
Open the app in your browser.

Add accounts, transactions, budgets, goals, and bills using the respective forms.

Use filters and search to find transactions quickly.

View charts and reports for insights.

Export data for backup or import previously saved JSON files.

# Example: Export JSON
Click "Export JSON" to download a backup of your financial data.
Credentials
No authentication required — all features are available offline.

APIs Used
Chart.js — for visualizing trends and category-based spending.
https://www.chartjs.org/

Technology Stack
HTML5
CSS3
Vanilla JavaScript
Chart.js
