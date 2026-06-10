const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'db.json');
const DEFAULT_DATA = { accounts: [], ads: [], nextAdId: 1 };

app.use(express.json({ limit: '12mb' }));
app.use(session({
  secret: 'ac-marketplace-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  }
}));

async function loadData() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (error) {
    if (error.code === 'ENOENT') {
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
    throw error;
  }
}

async function saveData(data) {
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
}

async function withData(transform) {
  const data = await loadData();
  const result = await transform(data);
  await saveData(data);
  return result;
}

function normalizeText(value) {
  return String(value || '').trim();
}

app.get('/api/auth/me', async (req, res) => {
  res.json({ username: req.session?.username || null });
});

app.post('/api/auth/register', async (req, res) => {
  const username = normalizeText(req.body.username);
  const password = normalizeText(req.body.password);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const newAccount = await withData(async data => {
      if (data.accounts.some(account => account.username.toLowerCase() === username.toLowerCase())) {
        throw new Error('USERNAME_TAKEN');
      }
      const account = { username, password };
      data.accounts.push(account);
      req.session.username = username;
      return account;
    });

    res.json({ username: newAccount.username });
  } catch (error) {
    if (error.message === 'USERNAME_TAKEN') {
      return res.status(400).json({ error: 'That username is already taken.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Unable to register the user.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const username = normalizeText(req.body.username);
  const password = normalizeText(req.body.password);

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  try {
    const data = await loadData();
    const account = data.accounts.find(account => account.username.toLowerCase() === username.toLowerCase());

    if (!account || account.password !== password) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    req.session.username = account.username;
    res.json({ username: account.username });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to login.' });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({});
  });
});

app.get('/api/ads', async (req, res) => {
  try {
    const query = normalizeText(req.query.search).toLowerCase();
    const data = await loadData();
    const ads = data.ads
      .filter(ad => {
        if (!query) return true;
        return (
          ad.title.toLowerCase().includes(query) ||
          ad.description.toLowerCase().includes(query) ||
          ad.price.toLowerCase().includes(query) ||
          ad.user.toLowerCase().includes(query) ||
          (ad.university || '').toLowerCase().includes(query) ||
          (ad.location || '').toLowerCase().includes(query)
        );
      })
      .slice()
      .reverse();

    res.json({ ads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load ads.' });
  }
});

app.post('/api/ads', async (req, res) => {
  const user = req.session?.username;

  if (!user) {
    return res.status(401).json({ error: 'Login required to post an ad.' });
  }

  const title = normalizeText(req.body.title);
  const price = normalizeText(req.body.price);
  const description = normalizeText(req.body.description);
  const location = normalizeText(req.body.location);
  const university = normalizeText(req.body.university);
  const status = normalizeText(req.body.status) || 'selling';
  const image = req.body.image || null;

  if (!title || !price || !description || !location || !university) {
    return res.status(400).json({ error: 'All item fields are required.' });
  }

  try {
    const ad = {
      id: null,
      title,
      price,
      description,
      location,
      university,
      status,
      image,
      user,
      createdAt: new Date().toISOString()
    };

    await withData(async data => {
      ad.id = data.nextAdId++;
      data.ads.push(ad);
    });

    res.json({ ad });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to post ad.' });
  }
});

app.get('/api/ads/my-listings', async (req, res) => {
  const user = req.session?.username;

  if (!user) {
    return res.status(401).json({ error: 'Login required.' });
  }

  try {
    const data = await loadData();
    const userAds = data.ads.filter(ad => ad.user === user);
    res.json({ ads: userAds });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load your listings.' });
  }
});

app.put('/api/ads/:id', async (req, res) => {
  const user = req.session?.username;
  const adId = parseInt(req.params.id);

  if (!user) {
    return res.status(401).json({ error: 'Login required.' });
  }

  const title = normalizeText(req.body.title);
  const price = normalizeText(req.body.price);
  const description = normalizeText(req.body.description);
  const location = normalizeText(req.body.location);
  const university = normalizeText(req.body.university);
  const status = normalizeText(req.body.status) || 'selling';

  if (!title || !price || !description || !location || !university) {
    return res.status(400).json({ error: 'All fields are required.' });
  }

  try {
    await withData(async data => {
      const ad = data.ads.find(a => a.id === adId);
      if (!ad) {
        throw new Error('NOT_FOUND');
      }
      if (ad.user !== user) {
        throw new Error('UNAUTHORIZED');
      }
      ad.title = title;
      ad.price = price;
      ad.description = description;
      ad.location = location;
      ad.university = university;
      ad.status = status;
      if (req.body.image) {
        ad.image = req.body.image;
      }
    });
    res.json({ message: 'Ad updated successfully.' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Ad not found.' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'You can only edit your own ads.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Unable to update ad.' });
  }
});

app.delete('/api/ads/:id', async (req, res) => {
  const user = req.session?.username;
  const adId = parseInt(req.params.id);

  if (!user) {
    return res.status(401).json({ error: 'Login required.' });
  }

  try {
    await withData(async data => {
      const adIndex = data.ads.findIndex(a => a.id === adId);
      if (adIndex === -1) {
        throw new Error('NOT_FOUND');
      }
      if (data.ads[adIndex].user !== user) {
        throw new Error('UNAUTHORIZED');
      }
      data.ads.splice(adIndex, 1);
    });
    res.json({ message: 'Ad deleted successfully.' });
  } catch (error) {
    if (error.message === 'NOT_FOUND') {
      return res.status(404).json({ error: 'Ad not found.' });
    }
    if (error.message === 'UNAUTHORIZED') {
      return res.status(403).json({ error: 'You can only delete your own ads.' });
    }
    console.error(error);
    res.status(500).json({ error: 'Unable to delete ad.' });
  }
});

app.use(express.static(path.join(__dirname)));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
