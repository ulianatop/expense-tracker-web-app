# Expense Tracker Web App

This is a full-stack coursework project for tracking personal expenses. The app allows users to register, log in, manage categories, and add, view, edit, or delete their own expense records.

## My Work

My work focused on implementing and connecting full-stack features, including client-side pages, server API handlers, database logic, user authentication flow, and unit tests. I also worked with multiple-user support so each user could access their own expenses and categories after logging in.

## Technologies Used

* JavaScript
* Node.js
* MySQL
* HTML/CSS
* REST API
* bcrypt
* JSON Web Tokens
* Vitest

## How to Run Locally

Install dependencies:

```bash
cd expenses-tracker
npm install
```

Create a local `.env` file here:

```text
server/state/database/.env
```

Use `.env.example` as a guide.

Set up the database:

```bash
node server/state/database/dbSetup.mjs
```

Start the server:

```bash
node server/main.mjs
```

Open the app:

```text
http://localhost:8000
```
