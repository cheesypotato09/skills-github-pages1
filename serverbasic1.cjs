const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Error Handling for missing API key
if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY not set in environment variables.');
    process.exit(1); // Exit with an error code
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
console.log("Available methods on genAI:", Object.keys(genAI)); // Debugging line to check available methods

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Start Chat and Maintain History
app.post('/ask-ai-chat', async (req, res) => {
  try {
    const { userMessage } = req.body;

    // Initialize the chat with some starter messages
    const chat = model.startChat({
      history: [
        { role: 'user', parts: [{ text: 'Hello' }] },
        { role: 'model', parts: [{ text: 'Great to meet you. What would you like to know?' }] },
      ],
    });

    // Send user's message and get the response
    const result = await chat.sendMessage(userMessage);
    const chatResponse = result.response.text(); // Get the model's response

    // Send the response to the user
    res.json({ response: chatResponse });

  } catch (error) {
    console.error('Error generating chat response:', error);
    res.status(500).json({ error: 'Failed to generate chat response' });
  }
});

// Server Listening
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));