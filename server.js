require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai'); // Ensure correct import

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Your OpenAI API Key
});

// Create OpenAI instance
const openai = new OpenAIApi(configuration);

// API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a helpful HR representative.`,
        },
        { role: 'user', content: userMessage },
      ],
    });

    res.json({
      assistantMessage: response.data.choices[0].message.content,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Something went wrong with the AI request.');
  }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
