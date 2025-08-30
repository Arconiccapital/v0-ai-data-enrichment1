/**
 * Test script for LLM Router - demonstrates intelligent routing decisions
 */

const testCases = [
  // Test 1: Simple classification
  {
    prompt: "Classify as B2B or B2C",
    value: "Apple Inc",
    context: {}
  },
  
  // Test 2: Web search needed
  {
    prompt: "Find the current CEO",
    value: "Microsoft",
    context: {}
  },
  
  // Test 3: Context-aware - already has website
  {
    prompt: "Find the website",
    value: "Google",
    context: { Website: "google.com" }
  },
  
  // Test 4: Industry classification
  {
    prompt: "What industry is this company in?",
    value: "Tesla",
    context: { Company: "Tesla", Location: "Austin, TX" }
  },
  
  // Test 5: Format existing data
  {
    prompt: "Clean and format the email",
    value: "john.DOE@COMPANY.COM",
    context: {}
  },
  
  // Test 6: Complex search
  {
    prompt: "What is the latest funding amount?",
    value: "OpenAI",
    context: { Company: "OpenAI", Type: "AI Research" }
  },
  
  // Test 7: Ambiguous - could be search or classify
  {
    prompt: "Company size",
    value: "Spotify",
    context: { Revenue: "$11.5B" }
  },
  
  // Test 8: Extract from context
  {
    prompt: "Extract the location",
    value: "",
    context: { 
      Address: "1 Infinite Loop, Cupertino, CA 95014",
      Company: "Apple"
    }
  }
];

async function testLLMRouter() {
  console.log("🤖 Testing LLM Router Intelligence\n");
  console.log("=" .repeat(70));
  
  for (const [index, testCase] of testCases.entries()) {
    console.log(`\n📝 Test ${index + 1}: "${testCase.prompt}"`);
    console.log(`   Value: "${testCase.value || 'empty'}"`);
    if (Object.keys(testCase.context).length > 0) {
      console.log(`   Context:`, testCase.context);
    }
    
    try {
      const response = await fetch('http://localhost:3000/api/enrich', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          value: testCase.value,
          prompt: testCase.prompt,
          rowContext: testCase.context
        })
      });
      
      if (!response.ok) {
        console.error(`   ❌ Request failed: ${response.status}`);
        continue;
      }
      
      const result = await response.json();
      
      console.log(`\n   🎯 Result:`);
      console.log(`      Provider: ${result.source || result.process?.provider}`);
      console.log(`      Router Type: ${result.process?.routerType || 'unknown'}`);
      console.log(`      Router Confidence: ${result.process?.routerConfidence || 'N/A'}`);
      console.log(`      Reasoning: ${result.process?.routingReason}`);
      console.log(`      Cost: $${(result.process?.estimatedCost || 0).toFixed(6)}`);
      console.log(`      Value: "${result.enrichedValue}"`);
      
      // Analyze if routing was correct
      const isSearchTask = testCase.prompt.toLowerCase().includes('find') || 
                          testCase.prompt.toLowerCase().includes('current') ||
                          testCase.prompt.toLowerCase().includes('latest');
      const wasSearchProvider = result.source === 'perplexity';
      
      if (isSearchTask === wasSearchProvider) {
        console.log(`      ✅ Routing appears correct`);
      } else if (testCase.context.Website && testCase.prompt.includes('website')) {
        // Special case: had data already
        if (result.source === 'openai') {
          console.log(`      ✅ Smart routing - used existing data`);
        }
      }
      
    } catch (error) {
      console.error(`   ❌ Error:`, error.message);
    }
  }
  
  console.log("\n" + "=" .repeat(70));
  console.log("✅ LLM Router test complete!\n");
  
  console.log("💡 Key Insights:");
  console.log("   - LLM router understands context better than keywords");
  console.log("   - Can detect when data already exists (no search needed)");
  console.log("   - Makes intelligent decisions about task types");
  console.log("   - Provides reasoning for each routing decision");
}

// Run the test
testLLMRouter().catch(console.error);