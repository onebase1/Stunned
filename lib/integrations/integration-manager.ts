/**
 * Integration Manager for Heritage100 CRM
 * Manages external integrations for email, WhatsApp, SMS, payments, and document signing
 */

export interface Integration {
  id: string;
  name: string;
  type: 'email' | 'messaging' | 'payment' | 'document' | 'calendar' | 'storage';
  status: 'connected' | 'disconnected' | 'error' | 'pending';
  provider: string;
  description: string;
  features: string[];
  config: Record<string, any>;
  lastSync?: string;
  error?: string;
  webhookUrl?: string;
  apiVersion?: string;
}

export interface IntegrationConfig {
  apiKey?: string;
  apiSecret?: string;
  accessToken?: string;
  refreshToken?: string;
  webhookSecret?: string;
  baseUrl?: string;
  environment?: 'sandbox' | 'production';
  [key: string]: any;
}

/**
 * Integration Manager Class
 */
export class IntegrationManager {
  private static instance: IntegrationManager;
  private integrations: Map<string, Integration> = new Map();

  static getInstance(): IntegrationManager {
    if (!IntegrationManager.instance) {
      IntegrationManager.instance = new IntegrationManager();
    }
    return IntegrationManager.instance;
  }

  constructor() {
    this.initializeDefaultIntegrations();
  }

  /**
   * Initialize default integrations
   */
  private initializeDefaultIntegrations() {
    const defaultIntegrations: Integration[] = [
      {
        id: 'gmail',
        name: 'Gmail',
        type: 'email',
        status: 'disconnected',
        provider: 'Google',
        description: 'Send and receive emails through Gmail API',
        features: ['Send emails', 'Read emails', 'Email templates', 'Auto-sync'],
        config: {},
        apiVersion: 'v1'
      },
      {
        id: 'whatsapp-business',
        name: 'WhatsApp Business',
        type: 'messaging',
        status: 'disconnected',
        provider: 'Meta',
        description: 'Send messages and manage conversations via WhatsApp Business API',
        features: ['Send messages', 'Receive messages', 'Media sharing', 'Templates'],
        config: {},
        apiVersion: 'v17.0'
      },
      {
        id: 'twilio-sms',
        name: 'Twilio SMS',
        type: 'messaging',
        status: 'disconnected',
        provider: 'Twilio',
        description: 'Send SMS notifications and alerts',
        features: ['Send SMS', 'Delivery status', 'International SMS', 'Bulk messaging'],
        config: {},
        apiVersion: '2010-04-01'
      },
      {
        id: 'stripe',
        name: 'Stripe',
        type: 'payment',
        status: 'disconnected',
        provider: 'Stripe',
        description: 'Process payments and manage subscriptions',
        features: ['Payment processing', 'Subscriptions', 'Invoicing', 'Webhooks'],
        config: {},
        apiVersion: '2023-10-16'
      },
      {
        id: 'docusign',
        name: 'DocuSign',
        type: 'document',
        status: 'disconnected',
        provider: 'DocuSign',
        description: 'Electronic signature and document management',
        features: ['E-signatures', 'Document templates', 'Audit trails', 'Bulk sending'],
        config: {},
        apiVersion: 'v2.1'
      },
      {
        id: 'google-calendar',
        name: 'Google Calendar',
        type: 'calendar',
        status: 'disconnected',
        provider: 'Google',
        description: 'Sync appointments and schedule meetings',
        features: ['Calendar sync', 'Event creation', 'Reminders', 'Availability'],
        config: {},
        apiVersion: 'v3'
      }
    ];

    defaultIntegrations.forEach(integration => {
      this.integrations.set(integration.id, integration);
    });
  }

  /**
   * Get all integrations
   */
  getAllIntegrations(): Integration[] {
    return Array.from(this.integrations.values());
  }

  /**
   * Get integration by ID
   */
  getIntegration(id: string): Integration | undefined {
    return this.integrations.get(id);
  }

  /**
   * Get integrations by type
   */
  getIntegrationsByType(type: Integration['type']): Integration[] {
    return Array.from(this.integrations.values()).filter(integration => integration.type === type);
  }

  /**
   * Get connected integrations
   */
  getConnectedIntegrations(): Integration[] {
    return Array.from(this.integrations.values()).filter(integration => integration.status === 'connected');
  }

  /**
   * Connect integration
   */
  async connectIntegration(id: string, config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    const integration = this.integrations.get(id);
    if (!integration) {
      return { success: false, error: 'Integration not found' };
    }

    try {
      // Validate configuration
      const validation = await this.validateIntegrationConfig(id, config);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      // Test connection
      const connectionTest = await this.testIntegrationConnection(id, config);
      if (!connectionTest.success) {
        return { success: false, error: connectionTest.error };
      }

      // Update integration
      const updatedIntegration: Integration = {
        ...integration,
        status: 'connected',
        config: { ...config },
        lastSync: new Date().toISOString(),
        error: undefined
      };

      this.integrations.set(id, updatedIntegration);

      // Set up webhooks if supported
      if (this.supportsWebhooks(id)) {
        await this.setupWebhook(id, config);
      }

      return { success: true };
    } catch (error) {
      const updatedIntegration: Integration = {
        ...integration,
        status: 'error',
        error: error instanceof Error ? error.message : 'Connection failed'
      };
      this.integrations.set(id, updatedIntegration);
      
      return { success: false, error: error instanceof Error ? error.message : 'Connection failed' };
    }
  }

  /**
   * Disconnect integration
   */
  async disconnectIntegration(id: string): Promise<{ success: boolean; error?: string }> {
    const integration = this.integrations.get(id);
    if (!integration) {
      return { success: false, error: 'Integration not found' };
    }

    try {
      // Clean up webhooks
      if (integration.webhookUrl) {
        await this.removeWebhook(id);
      }

      // Update integration
      const updatedIntegration: Integration = {
        ...integration,
        status: 'disconnected',
        config: {},
        lastSync: undefined,
        error: undefined,
        webhookUrl: undefined
      };

      this.integrations.set(id, updatedIntegration);
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Disconnection failed' };
    }
  }

  /**
   * Test integration connection
   */
  private async testIntegrationConnection(id: string, config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    switch (id) {
      case 'gmail':
        return this.testGmailConnection(config);
      case 'whatsapp-business':
        return this.testWhatsAppConnection(config);
      case 'twilio-sms':
        return this.testTwilioConnection(config);
      case 'stripe':
        return this.testStripeConnection(config);
      case 'docusign':
        return this.testDocuSignConnection(config);
      case 'google-calendar':
        return this.testGoogleCalendarConnection(config);
      default:
        return { success: false, error: 'Integration test not implemented' };
    }
  }

  /**
   * Validate integration configuration
   */
  private async validateIntegrationConfig(id: string, config: IntegrationConfig): Promise<{ valid: boolean; error?: string }> {
    switch (id) {
      case 'gmail':
        if (!config.accessToken) {
          return { valid: false, error: 'Access token is required' };
        }
        break;
      case 'whatsapp-business':
        if (!config.accessToken || !config.phoneNumberId) {
          return { valid: false, error: 'Access token and phone number ID are required' };
        }
        break;
      case 'twilio-sms':
        if (!config.accountSid || !config.authToken) {
          return { valid: false, error: 'Account SID and auth token are required' };
        }
        break;
      case 'stripe':
        if (!config.secretKey) {
          return { valid: false, error: 'Secret key is required' };
        }
        break;
      case 'docusign':
        if (!config.integrationKey || !config.userId) {
          return { valid: false, error: 'Integration key and user ID are required' };
        }
        break;
      case 'google-calendar':
        if (!config.accessToken) {
          return { valid: false, error: 'Access token is required' };
        }
        break;
    }
    return { valid: true };
  }

  /**
   * Test Gmail connection
   */
  private async testGmailConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock Gmail API test
      // In real implementation, this would make an actual API call
      if (config.accessToken === 'test-token') {
        return { success: false, error: 'Invalid access token' };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Gmail connection test failed' };
    }
  }

  /**
   * Test WhatsApp connection
   */
  private async testWhatsAppConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock WhatsApp API test
      return { success: true };
    } catch (error) {
      return { success: false, error: 'WhatsApp connection test failed' };
    }
  }

  /**
   * Test Twilio connection
   */
  private async testTwilioConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock Twilio API test
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Twilio connection test failed' };
    }
  }

  /**
   * Test Stripe connection
   */
  private async testStripeConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock Stripe API test
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Stripe connection test failed' };
    }
  }

  /**
   * Test DocuSign connection
   */
  private async testDocuSignConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock DocuSign API test
      return { success: true };
    } catch (error) {
      return { success: false, error: 'DocuSign connection test failed' };
    }
  }

  /**
   * Test Google Calendar connection
   */
  private async testGoogleCalendarConnection(config: IntegrationConfig): Promise<{ success: boolean; error?: string }> {
    try {
      // Mock Google Calendar API test
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Google Calendar connection test failed' };
    }
  }

  /**
   * Check if integration supports webhooks
   */
  private supportsWebhooks(id: string): boolean {
    return ['whatsapp-business', 'stripe', 'docusign'].includes(id);
  }

  /**
   * Set up webhook for integration
   */
  private async setupWebhook(id: string, config: IntegrationConfig): Promise<void> {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/${id}`;
    
    // Update integration with webhook URL
    const integration = this.integrations.get(id);
    if (integration) {
      integration.webhookUrl = webhookUrl;
      this.integrations.set(id, integration);
    }
  }

  /**
   * Remove webhook for integration
   */
  private async removeWebhook(id: string): Promise<void> {
    // Implementation would remove webhook from the service
    console.log(`Removing webhook for ${id}`);
  }

  /**
   * Sync integration data
   */
  async syncIntegration(id: string): Promise<{ success: boolean; error?: string }> {
    const integration = this.integrations.get(id);
    if (!integration || integration.status !== 'connected') {
      return { success: false, error: 'Integration not connected' };
    }

    try {
      // Update last sync time
      integration.lastSync = new Date().toISOString();
      this.integrations.set(id, integration);
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Sync failed' };
    }
  }

  /**
   * Get integration statistics
   */
  getIntegrationStats() {
    const integrations = Array.from(this.integrations.values());
    return {
      total: integrations.length,
      connected: integrations.filter(i => i.status === 'connected').length,
      disconnected: integrations.filter(i => i.status === 'disconnected').length,
      error: integrations.filter(i => i.status === 'error').length,
      byType: {
        email: integrations.filter(i => i.type === 'email').length,
        messaging: integrations.filter(i => i.type === 'messaging').length,
        payment: integrations.filter(i => i.type === 'payment').length,
        document: integrations.filter(i => i.type === 'document').length,
        calendar: integrations.filter(i => i.type === 'calendar').length,
        storage: integrations.filter(i => i.type === 'storage').length,
      }
    };
  }
}

// Export singleton instance
export const integrationManager = IntegrationManager.getInstance();
