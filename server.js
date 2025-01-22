require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai'); // Correctly import OpenAI

const app = express();
app.use(cors());
app.use(express.json());

// Log the OpenAI library version
try {
  const openaiPackage = require('openai/package.json');
  console.log(`OpenAI library version: ${openaiPackage.version}`);
} catch (error) {
  console.error('Failed to log OpenAI version:', error.message);
}

// Initialize OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Load OpenAI API key from environment variables
});

// Create an OpenAI API instance
const openai = new OpenAIApi(configuration);

// Define a chat endpoint
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

    // Extract the response message
    const assistantMessage = response.data.choices[0].message.content;
    res.json({ assistantMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.message);
    res.status(500).send('Failed to process the request.');
  }
});

// Define a debug endpoint to check OpenAI version
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
