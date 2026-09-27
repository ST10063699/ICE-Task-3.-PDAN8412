import express from 'express'
import cors from 'cors'

const app = express()

app.use(cors())
app.use(express.json({ limit: '5mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    model: 'llama3.1',
    temperature: 0,
    type: 'Deterministic',
    message: 'Local AI server is running'
  })
})

// MODEL A - DETERMINISTIC
app.post('/api/assistant', async (req, res) => {
  try {
    const { question, dashboard } = req.body

    if (!question || !dashboard) {
      return res.status(400).json({
        error: 'Missing question or dashboard data'
      })
    }

    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.1',
        stream: false,

        // Deterministic setting
        options: {
          temperature: 0
        },

        messages: [
          {
            role: 'system',
            content: `
You are an intelligence dashboard assistant.

Answer only using the dashboard data provided.
Do not invent information.
If information is not available in the dashboard data, say that it is not currently shown.

Keep answers clear, concise and analyst-style.

When asked for a summary, include:
- Global risk level
- Top threat
- Correlated threats
- Major cyber activity
- Major disaster activity
- Air and maritime activity
`
          },
          {
            role: 'user',
            content: `
Question:
${question}

Dashboard Data:
${JSON.stringify(dashboard, null, 2)}
`
          }
        ]
      })
    })

    const data = await ollamaResponse.json()

    res.json({
      model: 'llama3.1',
      type: 'Deterministic',
      temperature: 0,
      answer: data.message?.content || 'No response from local AI.'
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Local AI assistant failed to respond'
    })
  }
})

app.listen(5050, () => {
  console.log('Local AI server running on http://localhost:5050')
})

// MODEL B - PROBABILISTIC
// Temperature = 0.8 allows randomness in the response.
app.post('/api/assistant/probabilistic', async (req, res) => {
  try {
    const { question, dashboard } = req.body

    if (!question || !dashboard) {
      return res.status(400).json({
        error: 'Missing question or dashboard data'
      })
    }

    const ollamaResponse = await fetch('http://localhost:11434/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama3.1',
        stream: false,

        // Probabilistic setting
        options: {
          temperature: 0.8
        },

        messages: [
          {
            role: 'system',
            content: `
You are an intelligence dashboard assistant.

Answer only using the dashboard data provided.
Do not invent information.
If information is not available in the dashboard data, say that it is not currently shown.

Keep answers clear, useful and analyst-style.
`
          },
          {
            role: 'user',
            content: `
Question:
${question}

Dashboard Data:
${JSON.stringify(dashboard, null, 2)}
`
          }
        ]
      })
    })

    const data = await ollamaResponse.json()

    res.json({
      model: 'llama3.1',
      type: 'Probabilistic',
      temperature: 0.8,
      answer: data.message?.content || 'No response from local AI.'
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      error: 'Probabilistic local AI failed to respond'
    })
  }
})