# AC Marketplace

A simple university student marketplace for buying and selling items. Built with vanilla HTML, CSS, and JavaScript.

## Features

- User registration and login (stored locally)
- Browse public ads
- Post items for sale
- Search ads by title, description, price, seller, or university
- Select from 50+ Canadian universities
- Upload item images

## Local Testing

Install dependencies and run the backend server:

```bash
npm install
npm start
```

Then visit `http://localhost:3000` in your browser.

This starts the Express server from `server.js`, which serves the static site and provides shared backend storage for accounts and ads.

## Deploy to Internet

### Option 1: Deploy to a Node.js host

Because this version now includes a backend, GitHub Pages is no longer a complete deployment option by itself.                                                                                                                                                                                                                                                                          

- Render
- Railway
- Fly.io
- Heroku

For local deployment to a Node host, push the repository and connect it to your service. The app will run from `server.js`.

### Option 2: Keep the app local

If you only need to run it locally, use:

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Data Storage

- Accounts and ads are now stored on the backend in `db.json`
- Data is shared across devices that connect to the same running server
- Sessions are tracked in the browser using cookies

## File Structure

- `index.html` - Main page structure
- `script.js` - Frontend application logic
- `style.css` - Styling and layout
- `server.js` - Node.js backend service
- `db.json` - Shared storage for users and ads

## Data Storage

- Accounts and posts are stored in browser `localStorage`
- Each browser/device has separate data
- Data persists until browser cache is cleared

## File Structure

- `index.html` - Main page structure
- `script.js` - All application logic
- `style.css` - Styling and layout
