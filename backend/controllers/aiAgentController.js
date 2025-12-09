const Product = require('../models/Product');
const Groq = require('groq-sdk');

// Initialize Groq (Reuse your existing API Key)
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

exports.processVoiceCommand = async (req, res) => {
  try {
    const { command } = req.body; // e.g., "I want a red t-shirt under 100 dollars"

    if (!command) return res.status(400).json({ error: "No command provided" });

    // 1. Get Categories for context
    const categories = await Product.distinct('category');
    
    // 2. Ask Groq to extract structured data
    const systemPrompt = `
      You are a smart shopping assistant. The available product categories are: [${categories.join(', ')}].
      Extract search parameters from the user's natural language request.
      Return ONLY a JSON object with these fields:
      - "keywords": (string) The main product name or keywords (e.g., "t-shirt", "laptop").
      - "color": (string or null) If a color is mentioned (e.g., "red").
      - "max_price": (number or null) If a budget is mentioned.
      - "min_price": (number or null).
      - "category": (string or null) Only if it matches one of the available categories exactly.
      
      Example User: "I want a cheap red gaming laptop under 1000"
      Example Output: { "keywords": "gaming laptop", "color": "red", "max_price": 1000, "min_price": null, "category": "Electronics" }
    `;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: command }
      ],
      model: "llama-3.1-8b-instant",
      temperature: 0,
      response_format: { type: "json_object" }
    });

    const aiParams = JSON.parse(chatCompletion.choices[0]?.message?.content);

    // 3. Build the Mongoose Query
    let query = {};

    // A. Keyword Search (Check Title AND Description)
    if (aiParams.keywords) {
      query.$or = [
        { title: { $regex: aiParams.keywords, $options: 'i' } },
        { description: { $regex: aiParams.keywords, $options: 'i' } }
      ];
    }

    // B. Color Filter (Check Title AND Description for the color name)
    // We add this to the $and array to ensure BOTH keyword AND color match
    if (aiParams.color) {
      const colorRegex = { $regex: aiParams.color, $options: 'i' };
      const colorQuery = {
        $or: [
          { title: colorRegex },
          { description: colorRegex }
        ]
      };
      
      if (!query.$and) query.$and = [];
      query.$and.push(colorQuery);
    }

    // C. Price Filter
    if (aiParams.max_price !== null || aiParams.min_price !== null) {
      query.price = {};
      if (aiParams.max_price !== null) query.price.$lte = aiParams.max_price;
      if (aiParams.min_price !== null) query.price.$gte = aiParams.min_price;
    }

    // D. Category Filter
    if (aiParams.category) {
      query.category = aiParams.category;
    }

    // 4. Execute Query
    const products = await Product.find(query).populate('sellerId', 'storeName');

    // 5. Generate a conversational response
    const count = products.length;
    let replyText = "";
    if (count === 0) {
      replyText = `I couldn't find any ${aiParams.color || ''} ${aiParams.keywords || 'products'} within that budget.`;
    } else {
      replyText = `I found ${count} ${aiParams.color || ''} ${aiParams.keywords || 'items'} for you.`;
    }

    res.json({
      success: true,
      aiReply: replyText,
      extractedParams: aiParams,
      products: products
    });

  } catch (err) {
    console.error("AI Agent Error:", err);
    res.status(500).json({ error: err.message });
  }
};