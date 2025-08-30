/**
 * Test script to demonstrate multi-model router functionality
 * Shows how different prompts route to different providers
 */

// Example prompts to test routing
const testPrompts = [
  // SEARCH TASKS - Should route to Perplexity
  "Find the CEO email address",
  "Search for company website",
  "Look up the phone number",
  "Find the current stock price",
  
  // CLASSIFICATION TASKS - Should route to OpenAI
  "Classify as B2B or B2C",
  "What type of company is this",
  "Categorize by industry",
  "Determine the company size",
  "Format as currency",
  "Clean and standardize the address",
  
  // GENERATION TASKS - Should route to Claude/OpenAI
  "Analyze the sales trends",
  "Generate a summary report",
  "Create insights from this data"
];

async function testRouter() {
  console.log("🚀 Testing Multi-Model Router\n");
  console.log("=" .repeat(60));
  
  for (const prompt of testPrompts) {
    try {
      const response = await fetch('http://localhost:3000/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: 'Acme Corporation',
          prompt: prompt,
          rowContext: { 'Company': 'Acme Corporation' }
        })
      });
      
      if (!response.ok) {
        console.error(`❌ Failed: ${prompt}`);
        const error = await response.text();
        console.error(`   Error: ${error}\n`);
        continue;
      }
      
      const result = await response.json();
      
      console.log(`📝 Prompt: "${prompt}"`);
      console.log(`   → Provider: ${result.source || result.process?.provider}`);
      console.log(`   → Model: ${result.model || result.process?.model}`);
      console.log(`   → Cost: $${(result.process?.estimatedCost || 0).toFixed(6)}`);
      console.log(`   → Reason: ${result.process?.routingReason || 'N/A'}`);
      console.log(`   → Result: ${result.enrichedValue || 'N/A'}`);
      console.log(`   → Confidence: ${result.process?.confidence || 'N/A'}`);
      console.log();
      
    } catch (error) {
      console.error(`❌ Error testing prompt: ${prompt}`);
      console.error(`   ${error.message}\n`);
    }
  }
  
  console.log("=" .repeat(60));
  console.log("✅ Router test complete!\n");
  
  // Cost comparison
  console.log("💰 Cost Analysis:");
  console.log("   If all requests used Perplexity: $" + (testPrompts.length * 0.001).toFixed(3));
  console.log("   With smart routing: ~$" + (testPrompts.length * 0.0003).toFixed(3));
  console.log("   Estimated savings: ~70%");
}

// Run the test
testRouter().catch(console.error);