require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAIApi, Configuration } = require('openai'); // Ensure this import is correct

const app = express();
app.use(cors());
app.use(express.json());

// Create Configuration
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Ensure your .env file is correctly set
});

// Create OpenAI instance
const openai = new OpenAIApi(configuration);

// API endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are a friendly HR representative. Provide helpful and professional HR-related advice.`,
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
