require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import the OpenAI library from the local folder
const { Configuration, OpenAIApi } = require('./libs/openai'); // Importing from the local package

const app = express();
app.use(cors());
app.use(express.json());

// Initialize OpenAI Configuration
let openai;
try {
  const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY, // Your OpenAI API key from environment variables
  });

  openai = new OpenAIApi(configuration);
  console.log('OpenAI Configuration initialized successfully.');
} catch (error) {
  console.error('Failed to initialize OpenAI Configuration:', error.message);
  process.exit(1); // Exit process if OpenAI configuration fails
}

// Define a chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    const response = await openai.createChatCompletion({
      model:
