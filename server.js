require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI Configuration
let openai;
try {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Ensure your API key is set in environment variables
  });

  openai = new OpenAIApi(configuration);
  console.log('OpenAI Configuration initialized successfully.');
} catch (error) {
  console.error('Failed to initialize OpenAI Configuration:', error.message);
  process.exit(1); // Exit if OpenAI Configuration fails
}

// Define an API endpoint for chat
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

    const assistantMessage = response.data.choices[0].message.content;
    res.json({ assistantMessage });
  } catch (error) {
    console.error('Error communicating with OpenAI API:', error.message);
    res.status(500).send('Failed to process the request.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
