const express = require('express');
const path = require('path');
require('dotenv').config();
const port = process.env.PORT;
const app = express();

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'statics/index.html'));
});

app.listen(port, () => {
    console.log(`App running on port ${port}, visit at http://localhost:${port}`);
});