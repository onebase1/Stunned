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

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const update = await request.json();
    
    // Handle different types of updates
    if (update.message) {
      await handleMessage(update.message);
    } else if (update.callback_query) {
      await handleCallbackQuery(update.callback_query);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleMessage(message: any) {
  const chatId = message.chat.id;
  const text = message.text || '';
  const userName = message.from.first_name || 'User';
  
  // Handle voice messages
  if (message.voice) {
    await handleVoiceMessage(message, chatId);
    return;
  }
  
  // Handle commands
  if (text.startsWith('/')) {
    await handleCommand(text, chatId, userName);
  } else {
    // Handle natural language queries
    await handleNaturalLanguage(text, chatId, userName);
  }
}

async function handleCommand(text: string, chatId: number, userName: string) {
  const [command, ...params] = text.split(' ');
  const paramString = params.join(' ');
  
  switch (command.toLowerCase()) {
    case '/start':
      await sendMessage(chatId, getWelcomeMessage(userName));
      break;
      
    case '/help':
      await sendMessage(chatId, getHelpMessage());
      break;
      
    case '/properties':
      await handlePropertiesCommand(chatId, paramString);
      break;
      
    case '/clients':
      await handleClientsCommand(chatId, paramString);
      break;
      
    case '/contracts':
      await handleContractsCommand(chatId, paramString);
      break;
      
    case '/summary':
      await handleSummaryCommand(chatId);
      break;
      
    case '/add':
      await handleAddCommand(chatId, paramString);
      break;
      
    case '/update':
      await handleUpdateCommand(chatId, paramString);
      break;
      
    case '/search':
      await handleSearchCommand(chatId, paramString);
      break;
      
    case '/email':
      await handleEmailCommand(chatId, paramString);
      break;
      
    default:
      await sendMessage(chatId, `Unknown command: ${command}. Type /help for available commands.`);
  }
}

async function handleNaturalLanguage(text: string, chatId: number, userName: string) {
  try {
    // Use the same AI chat API we created
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text }),
    });
    
    const result = await response.json();
    await sendMessage(chatId, result.answer || 'Sorry, I could not process your request.');
  } catch (error) {
    await sendMessage(chatId, 'Sorry, I encountered an error processing your request.');
  }
}

async function handleVoiceMessage(message: any, chatId: number) {
  try {
    // Send processing message
    await sendMessage(chatId, '🎤 Processing your voice message...');

    // Get file info from Telegram
    const fileResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getFile?file_id=${message.voice.file_id}`);
    const fileData = await fileResponse.json();

    if (fileData.ok) {
      // Download the voice file
      const fileUrl = `https://api.telegram.org/file/bot${TELEGRAM_BOT_TOKEN}/${fileData.result.file_path}`;
      const audioResponse = await fetch(fileUrl);
      const audioBuffer = await audioResponse.arrayBuffer();

      // Determine file extension from Telegram file path
      const filePath = fileData.result.file_path;
      const fileExtension = filePath.split('.').pop() || 'ogg';
      const mimeType = fileExtension === 'oga' ? 'audio/ogg' : `audio/${fileExtension}`;

      // Convert to text using OpenAI Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: new File([audioBuffer], `voice.${fileExtension}`, { type: mimeType }),
        model: 'whisper-1',
        language: 'en', // Force English language detection
        prompt: 'This is a business conversation in English about real estate, property management, and Heritage100 CRM operations. The speaker is asking questions about business analytics, revenue, clients, properties, or performance metrics.', // Provide detailed context
        response_format: 'text', // Get plain text response
      });

      const transcribedText = transcription.trim();

      if (transcribedText && transcribedText.length > 0) {
        await sendMessage(chatId, `🎤 I heard: "${transcribedText}"`);

        // Process the transcribed text
        await handleNaturalLanguage(transcribedText, chatId, 'User');
      } else {
        await sendMessage(chatId, '🎤 I couldn\'t understand the audio. Please try speaking more clearly or use text instead.');
      }
    } else {
      await sendMessage(chatId, 'Sorry, I couldn\'t download your voice message. Please try again.');
    }
  } catch (error) {
    console.error('Voice transcription error:', error);
    await sendMessage(chatId, 'Sorry, I could not process your voice message. Please try speaking in English or use text instead.');
  }
}

async function handlePropertiesCommand(chatId: number, params: string) {
  try {
    let query = supabase.from('properties').select('*');
    
    if (params.includes('available')) {
      query = query.eq('available', true);
    }
    if (params.includes('construction')) {
      query = query.neq('construction_status', 'completed');
    }
    
    const { data: properties, error } = await query.limit(10);
    
    if (error) throw error;
    
    const message = formatProperties(properties || []);
    await sendMessage(chatId, message);
  } catch (error) {
    await sendMessage(chatId, '❌ Error fetching properties');
  }
}

async function handleClientsCommand(chatId: number, params: string) {
  try {
    let query = supabase.from('clients').select('*');
    
    if (params.includes('active')) {
      query = query.eq('status', 'active');
    }
    if (params.includes('lead')) {
      query = query.eq('current_stage', 'LEAD');
    }
    
    const { data: clients, error } = await query.limit(10);
    
    if (error) throw error;
    
    const message = formatClients(clients || []);
    await sendMessage(chatId, message);
  } catch (error) {
    await sendMessage(chatId, '❌ Error fetching clients');
  }
}

async function handleContractsCommand(chatId: number, params: string) {
  try {
    let query = supabase.from('contracts').select('*');
    
    if (params.includes('signed')) {
      query = query.eq('contract_status', 'signed');
    }
    
    const { data: contracts, error } = await query.limit(10);
    
    if (error) throw error;
    
    const message = formatContracts(contracts || []);
    await sendMessage(chatId, message);
  } catch (error) {
    await sendMessage(chatId, '❌ Error fetching contracts');
  }
}

async function handleSummaryCommand(chatId: number) {
  try {
    const [clientsCount, propertiesCount, contractsCount] = await Promise.all([
      supabase.from('clients').select('*', { count: 'exact', head: true }),
      supabase.from('properties').select('*', { count: 'exact', head: true }),
      supabase.from('contracts').select('*', { count: 'exact', head: true }),
    ]);
    
    const message = `📊 **Heritage100 Dashboard Summary**\n\n` +
                   `👥 Total Clients: ${clientsCount.count || 0}\n` +
                   `🏠 Total Properties: ${propertiesCount.count || 0}\n` +
                   `📄 Total Contracts: ${contractsCount.count || 0}\n\n` +
                   `Last updated: ${new Date().toLocaleString()}`;
    
    await sendMessage(chatId, message);
  } catch (error) {
    await sendMessage(chatId, '❌ Error fetching summary');
  }
}

async function handleAddCommand(chatId: number, params: string) {
  await sendMessage(chatId, `🔧 Add functionality: ${params}\n\nThis will be processed by AI to extract data and add to database.`);
  // Process with AI to extract structured data and add to database
  await handleNaturalLanguage(`Add ${params}`, chatId, 'User');
}

async function handleUpdateCommand(chatId: number, params: string) {
  await sendMessage(chatId, `🔧 Update functionality: ${params}\n\nThis will be processed by AI to update database records.`);
  // Process with AI to extract update data
  await handleNaturalLanguage(`Update ${params}`, chatId, 'User');
}

async function handleSearchCommand(chatId: number, params: string) {
  await handleNaturalLanguage(`Search for ${params}`, chatId, 'User');
}

async function handleEmailCommand(chatId: number, params: string) {
  await sendMessage(chatId, `📧 Email functionality: ${params}\n\nEmail sending will be implemented here.`);
}

async function sendMessage(chatId: number, text: string) {
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown',
      }),
    });
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

function getWelcomeMessage(userName: string): string {
  return `🏠 **Welcome to Heritage100 CRM Bot!**\n\nHi ${userName}! I'm your AI assistant for managing real estate data.\n\n📋 **Available Commands:**\n/help - Show all commands\n/properties - List properties\n/clients - List clients\n/contracts - Show contracts\n/summary - Get dashboard summary\n/add [type] [data] - Add new record\n/update [type] [id] [data] - Update record\n/search [query] - Search database\n/email [to] [subject] [message] - Send email\n\n💬 **You can also just chat with me naturally!**\nAsk questions like:\n• "Show me all active clients"\n• "Add a new property in Miami"\n• "What's our revenue this month?"\n• "Send email to john@example.com"\n\n🎤 **Voice Support:** Send voice messages for hands-free interaction!\n\nLet's get started! 🚀`;
}

function getHelpMessage(): string {
  return `🤖 **Heritage100 CRM Bot Help**\n\n📊 **Data Commands:**\n/properties - List all properties\n/clients - Show client list\n/contracts - Display contracts\n/summary - Dashboard overview\n\n✏️ **CRUD Operations:**\n/add client John Doe john@email.com 555-1234\n/add property "Sunset Villa" 3bed $500k Miami\n/update client john@email.com stage QUALIFIED\n/search properties under construction\n\n📧 **Communication:**\n/email john@email.com "Meeting" "Let's schedule a viewing"\n\n🎤 **Audio Support:**\nSend voice messages for hands-free interaction!\n\n💬 **Natural Language:**\nJust talk to me naturally:\n• "How many active clients do we have?"\n• "Show me properties in Miami"\n• "What's our total revenue?"\n• "Add a new client named Sarah"\n\n🔍 **Advanced Features:**\n• Real-time database queries\n• Email notifications\n• Voice message processing\n• Smart data extraction\n• Automated workflows\n\nNeed specific help? Just ask! 😊`;
}

function formatProperties(properties: any[]): string {
  if (properties.length === 0) {
    return '🏠 No properties found.';
  }
  
  let text = `🏠 **Properties (${properties.length})**\n\n`;
  
  properties.slice(0, 10).forEach((prop, i) => {
    text += `${i + 1}. **${prop.property_name}**\n`;
    text += `   💰 $${(prop.price / 1000).toFixed(0)}K`;
    text += ` | 🛏️ ${prop.bedrooms}bed`;
    text += ` | 📍 ${prop.location}\n`;
    text += `   🏗️ ${prop.construction_status} (${prop.completion_percentage}%)\n\n`;
  });
  
  if (properties.length > 10) {
    text += `... and ${properties.length - 10} more properties`;
  }
  
  return text;
}

function formatClients(clients: any[]): string {
  if (clients.length === 0) {
    return '👥 No clients found.';
  }
  
  let text = `👥 **Clients (${clients.length})**\n\n`;
  
  clients.slice(0, 10).forEach((client, i) => {
    text += `${i + 1}. **${client.first_name} ${client.last_name}**\n`;
    text += `   📧 ${client.email}`;
    text += ` | 📱 ${client.phone || 'N/A'}\n`;
    text += `   🎯 ${client.current_stage}`;
    if (client.budget_min && client.budget_max) {
      text += ` | 💰 $${(client.budget_min / 1000).toFixed(0)}K-$${(client.budget_max / 1000).toFixed(0)}K`;
    }
    text += `\n\n`;
  });
  
  if (clients.length > 10) {
    text += `... and ${clients.length - 10} more clients`;
  }
  
  return text;
}

function formatContracts(contracts: any[]): string {
  if (contracts.length === 0) {
    return '📄 No contracts found.';
  }
  
  let text = `📄 **Contracts (${contracts.length})**\n\n`;
  
  contracts.slice(0, 10).forEach((contract, i) => {
    text += `${i + 1}. **Contract #${contract.id.slice(-8)}**\n`;
    text += `   💰 $${(contract.total_amount / 1000).toFixed(0)}K`;
    text += ` | 📊 ${contract.contract_status}\n`;
    if (contract.signing_date) {
      text += `   📅 ${new Date(contract.signing_date).toLocaleDateString()}\n`;
    }
    text += `\n`;
  });
  
  if (contracts.length > 10) {
    text += `... and ${contracts.length - 10} more contracts`;
  }
  
  return text;
}

async function handleCallbackQuery(callbackQuery: any) {
  // Handle inline keyboard callbacks
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;
  
  await sendMessage(chatId, `Callback received: ${data}`);
}
