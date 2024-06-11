const axios = require('axios');

async function callOpenAIAPI(prompt) {
  const response = await axios.post(
    'https://openrouter.ai/api/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 150,
      temperature: 0.9,
    },
    {
      headers: {
        Authorization: `Bearer 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`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data.choices[0].message.content;
}

callOpenAIAPI('Tell me a joke')
  .then((response) => {
    console.log(response);
  })
  .catch((error) => {
    console.error(
      'Error calling OpenAI API:',
      error.response ? error.response.data : error.message
    );
  });
