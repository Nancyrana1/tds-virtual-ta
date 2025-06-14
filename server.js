// server.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));

const discourseData = JSON.parse(fs.readFileSync('discourse.json', 'utf8'));

// Initialize OpenAI (replace with your actual API key in .env)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.post('/api', async (req, res) => {
  try {
    const { question, image } = req.body;

    // Combine discourse data and question into a prompt
    const context = discourseData
      .map(d => `Title: ${d.title}\nLink: ${d.link}`)
      .slice(0, 10) // limit to top 10 for speed
      .join('\n\n');

    const messages = [
      {
        role: "system",
        content: "You are a helpful TA answering questions from students in the Tools in Data Science course using context from Discourse and course content.",
      },
      {
        role: "user",
        content: `Question: ${question}\n\nRelevant posts:\n${context}`,
      }
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages,
    });

    const answer = completion.choices[0].message.content;

    // Extract top 2 matching links (you can use better matching later)
    const links = discourseData.slice(0, 2).map(d => ({
      url: d.link,
      text: d.title
    }));

    res.json({
      answer,
      links
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong." });
  }
});

app.listen(port, () => {
  console.log(`API running at http://localhost:${port}/api`);
});
