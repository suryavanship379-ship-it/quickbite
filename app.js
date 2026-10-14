const express = require('express');
const app = express();

app.get('/', (req, res) => res.send('Welcome to QuickBite!'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;

if (require.main === module) {
  app.listen(3000, () => console.log('QuickBite running on port 3000'));
}
