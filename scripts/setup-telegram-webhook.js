#!/usr/bin/env node

/**
 * Script to set up Telegram webhook for Heritage100 CRM Bot
 * Run this after deploying your application to set the webhook URL
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '8252693097:AAFofhTLZnpXYIFm3MUfeUv-CCJ1pKkrkH';
const WEBHOOK_URL = process.env.TELEGRAM_WEBHOOK_URL || 'https://your-domain.com/api/telegram/webhook';

async function setupWebhook() {
  try {
    console.log('🤖 Setting up Telegram webhook...');
    console.log(`Bot Token: ${TELEGRAM_BOT_TOKEN.substring(0, 10)}...`);
    console.log(`Webhook URL: ${WEBHOOK_URL}`);
    
    // Set webhook
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: WEBHOOK_URL,
        allowed_updates: ['message', 'callback_query'],
        drop_pending_updates: true,
      }),
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook set successfully!');
      console.log('Description:', result.description);
      
      // Get webhook info to verify
      const infoResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getWebhookInfo`);
      const info = await infoResponse.json();
      
      if (info.ok) {
        console.log('\n📋 Webhook Info:');
        console.log('URL:', info.result.url);
        console.log('Has custom certificate:', info.result.has_custom_certificate);
        console.log('Pending update count:', info.result.pending_update_count);
        console.log('Last error date:', info.result.last_error_date || 'None');
        console.log('Last error message:', info.result.last_error_message || 'None');
        console.log('Max connections:', info.result.max_connections);
        console.log('Allowed updates:', info.result.allowed_updates);
      }
      
      // Get bot info
      const botResponse = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
      const botInfo = await botResponse.json();
      
      if (botInfo.ok) {
        console.log('\n🤖 Bot Info:');
        console.log('Name:', botInfo.result.first_name);
        console.log('Username:', `@${botInfo.result.username}`);
        console.log('ID:', botInfo.result.id);
        console.log('Can join groups:', botInfo.result.can_join_groups);
        console.log('Can read all group messages:', botInfo.result.can_read_all_group_messages);
        console.log('Supports inline queries:', botInfo.result.supports_inline_queries);
      }
      
    } else {
      console.error('❌ Failed to set webhook:', result.description);
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error setting up webhook:', error.message);
    process.exit(1);
  }
}

async function deleteWebhook() {
  try {
    console.log('🗑️ Deleting Telegram webhook...');
    
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        drop_pending_updates: true,
      }),
    });
    
    const result = await response.json();
    
    if (result.ok) {
      console.log('✅ Webhook deleted successfully!');
    } else {
      console.error('❌ Failed to delete webhook:', result.description);
    }
    
  } catch (error) {
    console.error('❌ Error deleting webhook:', error.message);
  }
}

async function testBot() {
  try {
    console.log('🧪 Testing bot...');
    
    // Send a test message to yourself (you need to start a chat with the bot first)
    const testMessage = '🧪 Test message from Heritage100 CRM Bot setup script!';
    
    console.log('To test the bot:');
    console.log('1. Open Telegram');
    console.log('2. Search for your bot username');
    console.log('3. Start a chat with /start');
    console.log('4. Try commands like /help, /properties, /clients');
    console.log('5. Try natural language: "Show me all active clients"');
    console.log('6. Try voice messages for audio processing');
    
  } catch (error) {
    console.error('❌ Error testing bot:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'setup':
    setupWebhook();
    break;
  case 'delete':
    deleteWebhook();
    break;
  case 'test':
    testBot();
    break;
  default:
    console.log('Heritage100 Telegram Bot Setup');
    console.log('');
    console.log('Usage:');
    console.log('  node scripts/setup-telegram-webhook.js setup   - Set up webhook');
    console.log('  node scripts/setup-telegram-webhook.js delete  - Delete webhook');
    console.log('  node scripts/setup-telegram-webhook.js test    - Test bot');
    console.log('');
    console.log('Environment Variables:');
    console.log('  TELEGRAM_BOT_TOKEN     - Your bot token from @BotFather');
    console.log('  TELEGRAM_WEBHOOK_URL   - Your webhook URL (https://your-domain.com/api/telegram/webhook)');
    console.log('');
    console.log('Example:');
    console.log('  TELEGRAM_WEBHOOK_URL=https://myapp.vercel.app/api/telegram/webhook node scripts/setup-telegram-webhook.js setup');
}
