const { GoogleGenerativeAI } = require('@google/generative-ai');

const apiKey = process.env.GOOGLE_GEMINI_API_KEY || 'AIzaSyD5GjD8uzoeZWSnGWnhouIo73zsRJjzAcc';
const genAI = new GoogleGenerativeAI(apiKey);

async function testGrounding() {
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-exp',
    tools: [{
      googleSearch: {}
    }]
  });

  const prompt = 'Who is the current CEO of OpenAI?';
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    console.log('Text Response:', response.text());
    console.log('\nGrounding Metadata:', JSON.stringify(response.candidates?.[0]?.groundingMetadata, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
    console.log('Full error:', error);
  }
}

testGrounding();
