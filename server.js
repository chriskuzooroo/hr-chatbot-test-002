require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai'); // Proper import for OpenAI library

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
 
