const { version } = require('openai/package.json'); // Import the version directly from the package
console.log(`OpenAI library version: ${version}`);

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai'); // Correct imports for version 4.8.0

const app = express();
app.use(cors());
app.use(express.json());

// OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Load API key from environment variable
});

// Create an OpenAI API instance
const openai = new OpenAIApi(configuration);

// API Endpoint for ChatGPT
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful HR representative. Answer all questions in a professional tone.`,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    // Extract response content
    const assistantMessage = response.data.choices[0].message.content;

    // Send response to client
    res.json({ assistantMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error);
    res.status(500).send('Failed to process the request.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
