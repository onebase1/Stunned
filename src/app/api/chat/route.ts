import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { createClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase
const supabase = createClient<Database>(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Database schema information for AI context
const DATABASE_SCHEMA = `
DATABASE SCHEMA:
- clients: id, first_name, last_name, email, phone, budget_min, budget_max, preferred_bedrooms, preferred_location, current_stage, assigned_agent, status
- properties: id, property_name, property_type, bedrooms, bathrooms, price, location, construction_status, completion_percentage, available
- contracts: id, client_id, property_id, contract_status, total_amount, signing_date, completion_date
- payments: id, contract_id, amount, due_date, payment_status, payment_date, payment_method
- interactions: id, client_id, interaction_type, subject, notes, interaction_date, agent_name
- client_stages: id, client_id, stage_name, entered_date, status
- construction_updates: id, property_id, update_type, description, completion_percentage, update_date
- notifications: id, client_id, notification_type, title, message, status, scheduled_date

CLIENT STAGES: LEAD → QUALIFIED → PROPERTY_MATCHED → VIEWING → NEGOTIATION → CONTRACT → PAYMENT_SETUP → CONSTRUCTION → HANDOVER
`;

export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Analyze the user's intent using OpenAI
    const intentAnalysis = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an AI assistant for a real estate CRM system. Analyze user queries and determine:
1. INTENT: 'query' (read data), 'insert' (add new data), 'update' (modify existing data)
2. TABLE: which database table is involved
3. ACTION: specific action to take
4. FIELDS: what fields are needed

${DATABASE_SCHEMA}

Respond with JSON only: {"intent": "query|insert|update", "table": "table_name", "action": "description", "fields": ["field1", "field2"], "sql_hint": "suggested query approach"}`
        },
        {
          role: 'user',
          content: message
        }
      ],
      temperature: 0.1,
    });

    const intentResult = JSON.parse(intentAnalysis.choices[0].message.content || '{}');

    let result;
    let answer = '';

    // Handle different intents
    switch (intentResult.intent) {
      case 'query':
        result = await handleQuery(intentResult, message);
        answer = await generateAnswer(message, result.data, result.query);
        break;
      
      case 'insert':
        result = await handleInsert(intentResult, message);
        answer = result.success ? 
          `Successfully added new ${intentResult.table} record. ${result.message}` :
          `Failed to add record: ${result.error}`;
        break;
      
      case 'update':
        result = await handleUpdate(intentResult, message);
        answer = result.success ? 
          `Successfully updated ${intentResult.table} record(s). ${result.message}` :
          `Failed to update record: ${result.error}`;
        break;
      
      default:
        answer = "I can help you query data, add new records, or update existing ones. What would you like to do?";
    }

    return NextResponse.json({ 
      answer,
      intent: intentResult.intent,
      table: intentResult.table,
      data: result?.data || null
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' }, 
      { status: 500 }
    );
  }
}

async function handleQuery(intent: any, message: string) {
  const { table, sql_hint } = intent;
  
  try {
    let query = supabase.from(table).select('*');
    
    // Apply basic filters based on common patterns
    if (message.toLowerCase().includes('active')) {
      query = query.eq('status', 'active');
    }
    if (message.toLowerCase().includes('recent')) {
      query = query.order('created_at', { ascending: false }).limit(10);
    }
    if (message.toLowerCase().includes('pending')) {
      query = query.eq('status', 'pending');
    }
    
    const { data, error } = await query.limit(50);
    
    if (error) throw error;
    
    return { data, query: `SELECT * FROM ${table}` };
  } catch (error) {
    throw new Error(`Query failed: ${error}`);
  }
}

async function handleInsert(intent: any, message: string) {
  const { table } = intent;
  
  // Extract data from message using OpenAI
  const dataExtraction = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Extract data for inserting into ${table} table. ${DATABASE_SCHEMA}
        
Return JSON with the fields to insert. Ask for missing required fields if needed.
For clients: first_name, last_name, email are required.
For properties: property_name, price, location are required.
For contracts: client_id, property_id, total_amount are required.

If missing required data, return: {"missing": ["field1", "field2"], "message": "Please provide..."}`
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.1,
  });

  const extractedData = JSON.parse(dataExtraction.choices[0].message.content || '{}');
  
  if (extractedData.missing) {
    return { success: false, error: extractedData.message };
  }

  try {
    const { data, error } = await supabase
      .from(table)
      .insert(extractedData)
      .select();

    if (error) throw error;

    return { 
      success: true, 
      data, 
      message: `Added new ${table} record with ID: ${data[0]?.id}` 
    };
  } catch (error) {
    return { success: false, error: `Insert failed: ${error}` };
  }
}

async function handleUpdate(intent: any, message: string) {
  const { table } = intent;
  
  // Extract update data and conditions using OpenAI
  const updateExtraction = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `Extract update data and conditions for ${table} table. ${DATABASE_SCHEMA}
        
Return JSON: {"conditions": {"field": "value"}, "updates": {"field": "new_value"}}
If unclear, return: {"error": "Please specify which record to update and what to change"}`
      },
      {
        role: 'user',
        content: message
      }
    ],
    temperature: 0.1,
  });

  const updateData = JSON.parse(updateExtraction.choices[0].message.content || '{}');
  
  if (updateData.error) {
    return { success: false, error: updateData.error };
  }

  try {
    let query = supabase.from(table).update(updateData.updates);
    
    // Apply conditions
    Object.entries(updateData.conditions).forEach(([key, value]) => {
      query = query.eq(key, value as string);
    });

    const { data, error } = await query.select();

    if (error) throw error;

    return { 
      success: true, 
      data, 
      message: `Updated ${data.length} record(s)` 
    };
  } catch (error) {
    return { success: false, error: `Update failed: ${error}` };
  }
}

async function generateAnswer(question: string, data: any, query: string) {
  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: `You are a helpful real estate CRM assistant. Answer the user's question based on the provided data.
        
Be conversational and helpful. If showing data, format it nicely. Include relevant insights.
Keep responses concise but informative.`
      },
      {
        role: 'user',
        content: `Question: ${question}
        
Data: ${JSON.stringify(data, null, 2)}
        
Query used: ${query}`
      }
    ],
    temperature: 0.7,
  });

  return response.choices[0].message.content || 'I found the data but had trouble formatting the response.';
}
