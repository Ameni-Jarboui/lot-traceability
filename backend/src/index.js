require('dotenv').config();
const express = require('express');
const cors = require('cors');

const lotsRouter = require('./routes/lots');
const authRouter = require('./routes/auth');
const controlesRouter = require('./routes/controles');
const rappelsRouter = require('./routes/rappels');
const usersRouter = require('./routes/users');
const documentsRouter = require('./routes/documents');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'API is running' });
});
app.use('/api/documents', documentsRouter);

app.use('/api/lots', lotsRouter);
app.use('/api/auth', authRouter);
app.use('/api/controles', controlesRouter);
app.use('/api/rappels', rappelsRouter);
app.use('/api/users', usersRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});