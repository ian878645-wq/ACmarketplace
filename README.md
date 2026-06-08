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

To run locally, use Python's built-in server:

```bash
python -m http.server 8000
```

Then visit `http://localhost:8000` in your browser.

## Deploy to Internet

### Option 1: GitHub Pages (Recommended)

1. Create a new GitHub repository named `ac-marketplace`
2. Initialize git in your local folder:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/ac-marketplace.git
   git push -u origin main
   ```
3. Go to your repository settings → Pages
4. Set "Source" to `main` branch, `/root` directory
5. Your site will be live at `https://YOUR_USERNAME.github.io/ac-marketplace`

### Option 2: Netlify (Drag and Drop)

1. Go to [netlify.com](https://netlify.com)
2. Sign in (free account)
3. Drag and drop your project folder
4. Your site is automatically deployed with a live URL

### Option 3: Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in (free account)
3. Click "New Project" → "Import Git Repository"
4. Select your GitHub repository
5. Deploy

## Data Storage

- Accounts and posts are stored in browser `localStorage`
- Each browser/device has separate data
- Data persists until browser cache is cleared

## File Structure

- `index.html` - Main page structure
- `script.js` - All application logic
- `style.css` - Styling and layout
