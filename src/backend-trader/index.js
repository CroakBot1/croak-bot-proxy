const express = require('express');
const { handleExecution } = require('./executor');
const app = express();

app.use(express.json());

app.post('/execute', async (req, res) => {
  try {
    const result = await handleExecution(req.body);
    res.json({ success: true, tx: result });
  } catch (err) {
    console.error('❌ Execution error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

const PORT = 4000;
app.listen(PORT, () => console.log(`🚀 Executor live at http://localhost:${PORT}`));
