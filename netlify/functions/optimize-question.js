// Questo è il nuovo codice per: /netlify/functions/optimize-question.js

exports.handler = async function (event, context) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { prompt } = JSON.parse(event.body);
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("La chiave API di OpenAI non è stata impostata.");
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // MODIFICATO: Usa il modello più economico
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.2, // Molto preciso, poca creatività
        response_format: { type: "json_object" }, 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return { 
        statusCode: response.status, 
        body: JSON.stringify({ error: 'Errore durante la chiamata a OpenAI.' }) 
      };
    }

    const data = await response.json();
    const optimizedData = JSON.parse(data.choices[0].message.content);
    
    return {
      statusCode: 200,
      body: JSON.stringify(optimizedData),
    };

  } catch (error) {
    console.error("Errore nella funzione:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Errore interno del server o nel parsing.' }),
    };
  }
};
