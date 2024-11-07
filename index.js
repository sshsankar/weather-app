const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors'); 
const User = require('./models/User');
const authMiddleware = require('./middleware') ;
const bodyParser = require('body-parser');
const app = express();

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
const connectionString = 'mongodb+srv://shivam:i8LqKpXoBTfWNYns@cluster0.fw2we.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0appName=Cluster0';
mongoose.connect(connectionString, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log("unable to connect", err));
app.get('/', async (req,res)=>{
    res.send("Welcome to know weather app");
    return ;
})
app.post('/signup', async (req, res) => {
    const { username, password } = req.body;
    
    try {
        let user = await User.findOne({ user_name: username });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({
            user_name: username,
            password: await bcrypt.hash(password, 10),
            recent_history: [],
        });

        await user.save();
        res.status(201).json({ msg: 'User created successfully' });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ user_name: username });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const token = jwt.sign({ user_id: user._id }, 'secretkey');
        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

app.use(authMiddleware);
app.get('/history' , async (req, res) => {
    const { user_id } = req.user;

    try {
        const user = await User.findOne({ _id: user_id });

        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        res.json({ history: user.recent_history });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

// Add History Element
app.put('/history' ,async (req, res) => {
    const { user_id } = req.user;
    const { city, timestamp } = req.body;
    console.log(city,timestamp, 'Got the request');
    try {
        let user = await User.findOne({ _id: user_id });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.recent_history.push({ city, timestamp });

        await user.save();
        res.json({ msg: 'History updated successfully', history: user.recent_history });
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
