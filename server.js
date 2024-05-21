const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const User = require('./models/User');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

mongoose.connect('mongodb://localhost:27017/sudokuDB').then(() => console.log('Connected to database'))
    .catch(err => console.error('Database connection error:', err));

function requireAuth(req, res, next) {
    const userId = req.cookies.userId;
    if (userId) {
        next();
    } else {
        res.redirect('/auth.html');
    }
}

app.get('/game', requireAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'sudoku.html'));
});

app.get('/', (req, res) => {
    res.redirect('/auth.html');
});

app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        // Проверка валидности email
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        // Хэширование пароля
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const maskedEmail = maskEmail(email);
        const user = new User({ email, maskedEmail, username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

function maskEmail(email) {
    const [localPart, domain] = email.split('@');
    const maskedLocalPart = localPart[0] + '*****' + localPart.slice(-1);
    return `${maskedLocalPart}@${domain}`;
  }  

  function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            // Устанавливаем cookie с идентификатором пользователя
            res.cookie('userId', user._id, { httpOnly: true });
            res.status(200).redirect('/game');
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/profile/:id/role', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('role');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ role: user.role });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.put('/api/profile/password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ error: 'Email and new password are required' });
        }
        // Находим пользователя по email и обновляем его пароль
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



app.get('/api/user/:userId/records/:difficulty', async (req, res) => {
    try {
        const { userId, difficulty } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const userRecord = user.records[difficulty];
        if (userRecord === undefined) {
            return res.status(404).json({ error: 'Record not found for this difficulty' });
        }
        res.status(200).json({ [difficulty]: userRecord });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/profile/:userId/records', async (req, res) => {
    try {
        const { userId } = req.params;
        const { difficulty, newRecord } = req.body;

        const update = {};
        update[`records.${difficulty}`] = newRecord;

        await User.updateOne({ _id: userId }, { $set: update });

        res.status(200).json({ message: 'Record updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.put('/api/profile/:id', async (req, res) => {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.status(200).json({ message: 'Profile updated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});