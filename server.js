const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const path = require('path');
const User = require('./models/User');
const cookieParser = require('cookie-parser');

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname)));

mongoose.connect('mongodb+srv://qwertfy59:qwertfy59@db.an5vfcw.mongodb.net/?retryWrites=true&w=majority&appName=db')
    .then(() => console.log('Connected to database'))
    .catch(err => console.error('Database connection error:', err));


app.get('/api/top-records', async (req, res) => {
    try {
        const topRecords = {};
        const difficulties = ['difficulty1', 'difficulty2', 'difficulty3', 'difficulty4', 'difficulty5'];
        for (const difficulty of difficulties) {
            const records = await User.find({}).sort({ [`records.${difficulty}`]: 1 }).limit(25);
            const filteredRecords = records.filter(record => record.records[difficulty] !== 0);

            topRecords[difficulty] = filteredRecords.map((record, index) => ({
                place: index + 1,
                username: record.username,
                time: record.records[difficulty]
            }));
        }

        res.status(200).json(topRecords);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
function checkAuth(req, res, next) {
    if (req.cookies.authenticated === 'true') {
        next();
    } else {
        res.redirect('/auth');
    }
}

app.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, 'auth.html'));
});

app.get('/game', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'sudoku.html'));
});

app.get('/', (req, res) => {
    res.redirect('/auth');
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (user && await bcrypt.compare(password, user.password)) {
            res.cookie('authenticated', 'true', { maxAge: 900000 });
            res.status(200).json({ message: 'Успешный вход', userId: user._id });
        } else {
            res.status(401).json({ message: 'Неверные почта или пароль' });
        }
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
    const englishLettersRegex = /^[a-zA-Z0-9._%+-@]+$/;
    if (emailRegex.test(email) && englishLettersRegex.test(email)) {
        return true;
    } else {
        return false;
    }
}

function validatePassword(password) {
    const englishLettersRegex = /^[a-zA-Z0-9._%+-@]+$/;
    if (englishLettersRegex.test(password)) {
        return true;
    } else {
        return false;
    }
}

app.post('/api/register', async (req, res) => {
    try {
        const { email, username, password } = req.body;
        
        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Неверный формат электронной почты' });
        }
        if (!validatePassword(password)) {
            return res.status(400).json({ error: 'Неверный формат пароля' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        
        const maskedEmail = maskEmail(email);
        const user = new User({ email, maskedEmail, username, password: hashedPassword });
        await user.save();
        res.status(201).json({ message: 'Аккаунт создан' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


app.get('/api/profile/:id/role', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('role');
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
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
            return res.status(400).json({ error: 'Требуются почта и новый пароль' });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const user = await User.findOneAndUpdate({ email }, { password: hashedPassword });
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        res.status(200).json({ message: 'Пароль обновлен' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/user/:userId/records/:difficulty', async (req, res) => {
    try {
        const { userId, difficulty } = req.params;
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'Пользователь не найден' });
        }
        const userRecord = user.records[difficulty];
        if (userRecord === undefined) {
            return res.status(404).json({ error: 'Рекорд не найден' });
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

        res.status(200).json({ message: 'Рекорд обновлен' });
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
        res.status(200).json({ message: 'Профиль обновлен' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
