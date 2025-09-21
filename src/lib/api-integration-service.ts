import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where, orderBy } from 'firebase/firestore';

export interface ApiIntegration {
  id: string;
  name: string;
  description: string;
  type: 'webhook' | 'rest_api' | 'graphql' | 'sftp' | 'email' | 'sms';
  endpoint: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers: Record<string, string>;
  authentication: {
    type: 'none' | 'bearer' | 'basic' | 'api_key' | 'oauth2';
    credentials: Record<string, string>;
  };
  payload: {
    template: string;
    fields: string[];
  };
  triggers: {
    events: string[];
    conditions: Record<string, any>;
  };
  isActive: boolean;
  lastExecuted?: string;
  executionCount: number;
  successCount: number;
  errorCount: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ApiExecution {
  id: string;
  integrationId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  requestData: any;
  responseData?: any;
  error?: string;
  startedAt: string;
  completedAt?: string;
  duration?: number;
  retryCount: number;
}

export interface ApiTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  endpoint: string;
  method: string;
  headers: Record<string, string>;
  payloadTemplate: string;
  isDefault: boolean;
}

class ApiIntegrationService {
  private static instance: ApiIntegrationService;
  private executionQueue: ApiExecution[] = [];
  private isProcessing = false;

  public static getInstance(): ApiIntegrationService {
    if (!ApiIntegrationService.instance) {
      ApiIntegrationService.instance = new ApiIntegrationService();
    }
    return ApiIntegrationService.instance;
  }

  /**
   * Create a new API integration
   */
  async createApiIntegration(integration: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successCount' | 'errorCount'>): Promise<string> {
    try {
      const apiIntegration: Omit<ApiIntegration, 'id'> = {
        ...integration,
        executionCount: 0,
        successCount: 0,
        errorCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, 'apiIntegrations'), apiIntegration);
      return docRef.id;
    } catch (error) {
      console.error('Error creating API integration:', error);
      throw error;
    }
  }

  /**
   * Update an API integration
   */
  async updateApiIntegration(integrationId: string, updates: Partial<ApiIntegration>): Promise<void> {
    try {
      const integrationRef = doc(db, 'apiIntegrations', integrationId);
      await updateDoc(integrationRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error updating API integration:', error);
      throw error;
    }
  }

  /**
   * Get all API integrations
   */
  async getApiIntegrations(): Promise<ApiIntegration[]> {
    try {
      const snapshot = await getDocs(collection(db, 'apiIntegrations'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ApiIntegration));
    } catch (error) {
      console.error('Error getting API integrations:', error);
      return [];
    }
  }

  /**
   * Get API integration by ID
   */
  async getApiIntegration(integrationId: string): Promise<ApiIntegration | null> {
    try {
      const integrationDoc = await getDocs(query(
        collection(db, 'apiIntegrations'),
        where('id', '==', integrationId)
      ));
      
      if (integrationDoc.empty) return null;
      
      return {
        id: integrationDoc.docs[0].id,
        ...integrationDoc.docs[0].data()
      } as ApiIntegration;
    } catch (error) {
      console.error('Error getting API integration:', error);
      return null;
    }
  }

  /**
   * Execute an API integration
   */
  async executeApiIntegration(integrationId: string, data: any): Promise<ApiExecution> {
    try {
      const integration = await this.getApiIntegration(integrationId);
      if (!integration) throw new Error('Integration not found');

      const execution: Omit<ApiExecution, 'id'> = {
        integrationId,
        status: 'running',
        requestData: data,
        startedAt: new Date().toISOString(),
        retryCount: 0
      };

      const docRef = await addDoc(collection(db, 'apiExecutions'), execution);
      const executionId = docRef.id;

      // Execute the API call
      const result = await this.makeApiCall(integration, data);
      
      // Update execution status
      await updateDoc(doc(db, 'apiExecutions', executionId), {
        status: result.success ? 'completed' : 'failed',
        completedAt: new Date().toISOString(),
        duration: result.duration,
        responseData: result.responseData,
        error: result.error
      });

      // Update integration statistics
      await updateDoc(doc(db, 'apiIntegrations', integrationId), {
        lastExecuted: new Date().toISOString(),
        executionCount: integration.executionCount + 1,
        successCount: integration.successCount + (result.success ? 1 : 0),
        errorCount: integration.errorCount + (result.success ? 0 : 1)
      });

      return {
        id: executionId,
        ...execution,
        status: result.success ? 'completed' : 'failed',
        completedAt: new Date().toISOString(),
        duration: result.duration,
        responseData: result.responseData,
        error: result.error
      };
    } catch (error) {
      console.error('Error executing API integration:', error);
      throw error;
    }
  }

  /**
   * Make API call
   */
  private async makeApiCall(integration: ApiIntegration, data: any): Promise<{
    success: boolean;
    responseData?: any;
    error?: string;
    duration: number;
  }> {
    const startTime = Date.now();
    
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...integration.headers
      };

      // Add authentication
      if (integration.authentication.type !== 'none') {
        this.addAuthentication(headers, integration.authentication);
      }

      // Prepare payload
      const payload = this.preparePayload(integration.payload, data);

      // Make the API call
      const response = await fetch(integration.endpoint, {
        method: integration.method,
        headers,
        body: integration.method !== 'GET' ? JSON.stringify(payload) : undefined
      });

      const responseData = await response.json();
      const duration = Date.now() - startTime;

      if (response.ok) {
        return {
          success: true,
          responseData,
          duration
        };
      } else {
        return {
          success: false,
          error: `HTTP ${response.status}: ${responseData.message || 'Unknown error'}`,
          duration
        };
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration
      };
    }
  }

  /**
   * Add authentication to headers
   */
  private addAuthentication(headers: Record<string, string>, auth: ApiIntegration['authentication']): void {
    switch (auth.type) {
      case 'bearer':
        headers['Authorization'] = `Bearer ${auth.credentials.token}`;
        break;
      case 'basic':
        const credentials = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
        headers['Authorization'] = `Basic ${credentials}`;
        break;
      case 'api_key':
        headers[auth.credentials.headerName || 'X-API-Key'] = auth.credentials.apiKey;
        break;
      case 'oauth2':
        headers['Authorization'] = `Bearer ${auth.credentials.accessToken}`;
        break;
    }
  }

  /**
   * Prepare payload from template
   */
  private preparePayload(payloadConfig: ApiIntegration['payload'], data: any): any {
    if (!payloadConfig.template) return data;

    // Simple template replacement
    let payload = payloadConfig.template;
    payloadConfig.fields.forEach(field => {
      const value = this.getNestedValue(data, field);
      payload = payload.replace(`{{${field}}}`, value || '');
    });

    try {
      return JSON.parse(payload);
    } catch {
      return payload;
    }
  }

  /**
   * Get nested value from object
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  /**
   * Test API integration
   */
  async testApiIntegration(integrationId: string, testData: any): Promise<{
    success: boolean;
    responseData?: any;
    error?: string;
    duration: number;
  }> {
    try {
      const integration = await this.getApiIntegration(integrationId);
      if (!integration) throw new Error('Integration not found');

      return await this.makeApiCall(integration, testData);
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: 0
      };
    }
  }

  /**
   * Get API executions
   */
  async getApiExecutions(integrationId?: string): Promise<ApiExecution[]> {
    try {
      let q = query(collection(db, 'apiExecutions'), orderBy('startedAt', 'desc'));
      
      if (integrationId) {
        q = query(q, where('integrationId', '==', integrationId));
      }

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ApiExecution));
    } catch (error) {
      console.error('Error getting API executions:', error);
      return [];
    }
  }

  /**
   * Get API templates
   */
  async getApiTemplates(): Promise<ApiTemplate[]> {
    try {
      const snapshot = await getDocs(collection(db, 'apiTemplates'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ApiTemplate));
    } catch (error) {
      console.error('Error getting API templates:', error);
      return [];
    }
  }

  /**
   * Create integration from template
   */
  async createIntegrationFromTemplate(templateId: string, customizations: Partial<ApiIntegration>): Promise<string> {
    try {
      const template = await this.getApiTemplate(templateId);
      if (!template) throw new Error('Template not found');

      const integration: Omit<ApiIntegration, 'id' | 'createdAt' | 'updatedAt' | 'executionCount' | 'successCount' | 'errorCount'> = {
        name: template.name,
        description: template.description,
        type: template.type as any,
        endpoint: template.endpoint,
        method: template.method as any,
        headers: template.headers,
        authentication: { type: 'none', credentials: {} },
        payload: { template: template.payloadTemplate, fields: [] },
        triggers: { events: [], conditions: {} },
        isActive: true,
        createdBy: 'current-user-id', // This would come from auth context
        ...customizations
      };

      return this.createApiIntegration(integration);
    } catch (error) {
      console.error('Error creating integration from template:', error);
      throw error;
    }
  }

  /**
   * Get API template by ID
   */
  private async getApiTemplate(templateId: string): Promise<ApiTemplate | null> {
    try {
      const templateDoc = await getDocs(query(
        collection(db, 'apiTemplates'),
        where('id', '==', templateId)
      ));
      
      if (templateDoc.empty) return null;
      
      return {
        id: templateDoc.docs[0].id,
        ...templateDoc.docs[0].data()
      } as ApiTemplate;
    } catch (error) {
      console.error('Error getting API template:', error);
      return null;
    }
  }

  /**
   * Trigger integration by event
   */
  async triggerIntegrationByEvent(event: string, data: any): Promise<void> {
    try {
      const integrations = await this.getApiIntegrations();
      const activeIntegrations = integrations.filter(integration => 
        integration.isActive && 
        integration.triggers.events.includes(event)
      );

      for (const integration of activeIntegrations) {
        // Check conditions
        if (this.evaluateConditions(integration.triggers.conditions, data)) {
          await this.executeApiIntegration(integration.id, data);
        }
      }
    } catch (error) {
      console.error('Error triggering integration by event:', error);
    }
  }

  /**
   * Evaluate trigger conditions
   */
  private evaluateConditions(conditions: Record<string, any>, data: any): boolean {
    // Simple condition evaluation
    // In a real implementation, this would be more sophisticated
    return true;
  }
}

export const apiIntegrationService = ApiIntegrationService.getInstance();

// Default API templates
export const defaultApiTemplates: Omit<ApiTemplate, 'id'>[] = [
  {
    name: 'Slack Webhook',
    description: 'Send notifications to Slack channel',
    type: 'webhook',
    endpoint: 'https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payloadTemplate: JSON.stringify({
      text: '{{message}}',
      channel: '{{channel}}',
      username: 'KPI Central'
    }),
    isDefault: true
  },
  {
    name: 'Microsoft Teams Webhook',
    description: 'Send notifications to Microsoft Teams channel',
    type: 'webhook',
    endpoint: 'https://outlook.office.com/webhook/YOUR/TEAMS/WEBHOOK',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payloadTemplate: JSON.stringify({
      text: '{{message}}',
      title: '{{title}}'
    }),
    isDefault: true
  },
  {
    name: 'Email API',
    description: 'Send emails via email service API',
    type: 'rest_api',
    endpoint: 'https://api.emailservice.com/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{apiKey}}'
    },
    payloadTemplate: JSON.stringify({
      to: '{{email}}',
      subject: '{{subject}}',
      body: '{{message}}'
    }),
    isDefault: true
  },
  {
    name: 'SMS API',
    description: 'Send SMS messages via SMS service API',
    type: 'rest_api',
    endpoint: 'https://api.smsservice.com/send',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{apiKey}}'
    },
    payloadTemplate: JSON.stringify({
      to: '{{phone}}',
      message: '{{message}}'
    }),
    isDefault: true
  },
  {
    name: 'Custom REST API',
    description: 'Generic REST API integration',
    type: 'rest_api',
    endpoint: 'https://api.example.com/endpoint',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    payloadTemplate: JSON.stringify({
      data: '{{data}}',
      timestamp: '{{timestamp}}'
    }),
    isDefault: true
  }
];
