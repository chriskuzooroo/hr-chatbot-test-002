require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai'); // Correct imports

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI Configuration
try {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Load OpenAI API key from environment variables
  });

  // Create OpenAI API instance
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

  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT,
