require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure OpenAI is installed and log version
try {
  const openaiPackage = require('openai/package.json');
  console.log(`OpenAI library version: ${openaiPackage.version}`);
} catch (error) {
  console.error('Failed to determine OpenAI version:', error.message);
}

// Initialize OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create OpenAI API instance
const openai = new OpenAIApi(configuration);

// Define API route for chat
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful HR assistant.' },
        { role: 'user', content: userMessage },
      ],
    });

    // Extract and send the response
    const assistantMessage = response.data.choices[0].message.content;
    res.json({ assistantMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.message);
    res.status(500).send('Failed to process the request.');
  }
});

// Add a debug route to check OpenAI version
app.get('/api/debug/version', (req, res) => {
  try {
    const openaiPackage = require('openai/package.json');
    res.json({ openaiVersion: openaiPackage.version });
  } catch (error) {
    res.status(500).send('Failed to retrieve OpenAI version.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
