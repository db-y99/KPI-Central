import * as XLSX from 'xlsx';
import { db } from './firebase';
import { collection, addDoc, updateDoc, doc, getDocs, query, where } from 'firebase/firestore';

export interface ImportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'employees' | 'kpis' | 'departments' | 'metrics' | 'rewards';
  fields: ImportField[];
  requiredFields: string[];
  sampleData: any[];
  createdAt: string;
  updatedAt: string;
}

export interface ImportField {
  name: string;
  label: string;
  type: 'string' | 'number' | 'date' | 'boolean' | 'select';
  required: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: string[];
  };
  description?: string;
}

export interface ImportResult {
  id: string;
  templateId: string;
  fileName: string;
  totalRows: number;
  successCount: number;
  errorCount: number;
  errors: ImportError[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  userId: string;
}

export interface ImportError {
  row: number;
  field: string;
  message: string;
  value: any;
}

class BulkImportService {
  private static instance: BulkImportService;

  public static getInstance(): BulkImportService {
    if (!BulkImportService.instance) {
      BulkImportService.instance = new BulkImportService();
    }
    return BulkImportService.instance;
  }

  /**
   * Get all available import templates
   */
  async getTemplates(): Promise<ImportTemplate[]> {
    try {
      const snapshot = await getDocs(collection(db, 'importTemplates'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImportTemplate));
    } catch (error) {
      console.error('Error getting templates:', error);
      return [];
    }
  }

  /**
   * Get template by ID
   */
  async getTemplate(templateId: string): Promise<ImportTemplate | null> {
    try {
      const templateDoc = await getDocs(query(
        collection(db, 'importTemplates'),
        where('id', '==', templateId)
      ));
      
      if (templateDoc.empty) return null;
      
      return {
        id: templateDoc.docs[0].id,
        ...templateDoc.docs[0].data()
      } as ImportTemplate;
    } catch (error) {
      console.error('Error getting template:', error);
      return null;
    }
  }

  /**
   * Download template as Excel file
   */
  async downloadTemplate(templateId: string): Promise<void> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) throw new Error('Template not found');

      const workbook = XLSX.utils.book_new();
      
      // Create headers row
      const headers = template.fields.map(field => field.label);
      const sampleRow = template.sampleData[0] || {};
      const sampleValues = template.fields.map(field => sampleRow[field.name] || '');
      
      const worksheetData = [
        headers,
        sampleValues
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      
      // Add validation and formatting
      template.fields.forEach((field, index) => {
        const column = XLSX.utils.encode_col(index);
        
        if (field.type === 'number') {
          worksheet[`${column}1`].t = 'n';
        } else if (field.type === 'date') {
          worksheet[`${column}1`].t = 'd';
        }
        
        // Add comments for required fields
        if (field.required) {
          worksheet[`${column}1`].c = [{
            a: 'System',
            t: `Required field: ${field.description || field.label}`
          }];
        }
      });

      XLSX.utils.book_append_sheet(workbook, worksheet, 'Data');
      
      // Add instructions sheet
      const instructionsData = [
        ['Field Name', 'Description', 'Type', 'Required', 'Validation'],
        ...template.fields.map(field => [
          field.name,
          field.description || '',
          field.type,
          field.required ? 'Yes' : 'No',
          field.validation ? JSON.stringify(field.validation) : ''
        ])
      ];
      
      const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
      XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instructions');
      
      // Download file
      XLSX.writeFile(workbook, `${template.name}_template.xlsx`);
    } catch (error) {
      console.error('Error downloading template:', error);
      throw error;
    }
  }

  /**
   * Parse Excel file and validate data
   */
  async parseFile(file: File, templateId: string): Promise<{
    data: any[];
    errors: ImportError[];
  }> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) throw new Error('Template not found');

      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      if (jsonData.length < 2) {
        throw new Error('File must contain at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      const dataRows = jsonData.slice(1) as any[][];
      
      // Map headers to field names
      const fieldMap = new Map<string, string>();
      template.fields.forEach(field => {
        const headerIndex = headers.findIndex(h => 
          h.toLowerCase().trim() === field.label.toLowerCase().trim()
        );
        if (headerIndex !== -1) {
          fieldMap.set(field.name, headers[headerIndex]);
        }
      });

      // Validate required fields
      const missingFields = template.requiredFields.filter(
        fieldName => !fieldMap.has(fieldName)
      );

      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Parse and validate data
      const parsedData: any[] = [];
      const errors: ImportError[] = [];

      dataRows.forEach((row, rowIndex) => {
        const rowData: any = {};
        let hasErrors = false;

        template.fields.forEach(field => {
          const headerName = fieldMap.get(field.name);
          if (headerName) {
            const headerIndex = headers.indexOf(headerName);
            const value = row[headerIndex];

            // Validate required fields
            if (field.required && (value === undefined || value === null || value === '')) {
              errors.push({
                row: rowIndex + 2, // +2 because Excel is 1-indexed and we skip header
                field: field.name,
                message: `${field.label} is required`,
                value
              });
              hasErrors = true;
              return;
            }

            // Type conversion and validation
            try {
              rowData[field.name] = this.convertValue(value, field);
            } catch (error) {
              errors.push({
                row: rowIndex + 2,
                field: field.name,
                message: error instanceof Error ? error.message : 'Invalid value',
                value
              });
              hasErrors = true;
            }
          }
        });

        if (!hasErrors) {
          parsedData.push(rowData);
        }
      });

      return { data: parsedData, errors };
    } catch (error) {
      console.error('Error parsing file:', error);
      throw error;
    }
  }

  /**
   * Import data to database
   */
  async importData(
    templateId: string,
    data: any[],
    userId: string,
    fileName: string
  ): Promise<ImportResult> {
    try {
      const template = await this.getTemplate(templateId);
      if (!template) throw new Error('Template not found');

      // Create import result record
      const importResult: Omit<ImportResult, 'id'> = {
        templateId,
        fileName,
        totalRows: data.length,
        successCount: 0,
        errorCount: 0,
        errors: [],
        status: 'processing',
        createdAt: new Date().toISOString(),
        userId
      };

      const resultDoc = await addDoc(collection(db, 'importResults'), importResult);
      const resultId = resultDoc.id;

      // Process data based on template type
      const errors: ImportError[] = [];
      let successCount = 0;

      for (let i = 0; i < data.length; i++) {
        try {
          await this.processDataRow(template.type, data[i]);
          successCount++;
        } catch (error) {
          errors.push({
            row: i + 2,
            field: 'general',
            message: error instanceof Error ? error.message : 'Unknown error',
            value: data[i]
          });
        }
      }

      // Update import result
      await updateDoc(doc(db, 'importResults', resultId), {
        successCount,
        errorCount: errors.length,
        errors,
        status: 'completed',
        completedAt: new Date().toISOString()
      });

      return {
        id: resultId,
        ...importResult,
        successCount,
        errorCount: errors.length,
        errors,
        status: 'completed',
        completedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error importing data:', error);
      throw error;
    }
  }

  /**
   * Process individual data row based on template type
   */
  private async processDataRow(type: string, data: any): Promise<void> {
    switch (type) {
      case 'employees':
        await this.processEmployeeRow(data);
        break;
      case 'kpis':
        await this.processKpiRow(data);
        break;
      case 'departments':
        await this.processDepartmentRow(data);
        break;
      case 'metrics':
        await this.processMetricRow(data);
        break;
      case 'rewards':
        await this.processRewardRow(data);
        break;
      default:
        throw new Error(`Unknown template type: ${type}`);
    }
  }

  private async processEmployeeRow(data: any): Promise<void> {
    // This would integrate with your employee creation logic
    // For now, just add to employees collection
    await addDoc(collection(db, 'employees'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  private async processKpiRow(data: any): Promise<void> {
    await addDoc(collection(db, 'kpis'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  private async processDepartmentRow(data: any): Promise<void> {
    await addDoc(collection(db, 'departments'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  private async processMetricRow(data: any): Promise<void> {
    await addDoc(collection(db, 'metricData'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  private async processRewardRow(data: any): Promise<void> {
    await addDoc(collection(db, 'rewardCalculations'), {
      ...data,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
  }

  /**
   * Convert value based on field type
   */
  private convertValue(value: any, field: ImportField): any {
    if (value === undefined || value === null || value === '') {
      return field.required ? undefined : null;
    }

    switch (field.type) {
      case 'string':
        return String(value).trim();
      
      case 'number':
        const num = Number(value);
        if (isNaN(num)) throw new Error('Invalid number format');
        if (field.validation?.min !== undefined && num < field.validation.min) {
          throw new Error(`Value must be at least ${field.validation.min}`);
        }
        if (field.validation?.max !== undefined && num > field.validation.max) {
          throw new Error(`Value must be at most ${field.validation.max}`);
        }
        return num;
      
      case 'date':
        const date = new Date(value);
        if (isNaN(date.getTime())) throw new Error('Invalid date format');
        return date.toISOString();
      
      case 'boolean':
        if (typeof value === 'boolean') return value;
        const str = String(value).toLowerCase();
        if (['true', '1', 'yes', 'y'].includes(str)) return true;
        if (['false', '0', 'no', 'n'].includes(str)) return false;
        throw new Error('Invalid boolean value');
      
      case 'select':
        if (!field.validation?.options?.includes(String(value))) {
          throw new Error(`Value must be one of: ${field.validation?.options?.join(', ')}`);
        }
        return String(value);
      
      default:
        return value;
    }
  }

  /**
   * Get import results for a user
   */
  async getImportResults(userId: string): Promise<ImportResult[]> {
    try {
      const q = query(
        collection(db, 'importResults'),
        where('userId', '==', userId)
      );
      const snapshot = await getDocs(q);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as ImportResult));
    } catch (error) {
      console.error('Error getting import results:', error);
      return [];
    }
  }
}

export const bulkImportService = BulkImportService.getInstance();

// Default templates
export const defaultTemplates: Omit<ImportTemplate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Employee Import',
    description: 'Import employee data from Excel file',
    type: 'employees',
    fields: [
      { name: 'name', label: 'Full Name', type: 'string', required: true },
      { name: 'email', label: 'Email', type: 'string', required: true },
      { name: 'position', label: 'Position', type: 'string', required: true },
      { name: 'departmentId', label: 'Department ID', type: 'string', required: true },
      { name: 'phone', label: 'Phone', type: 'string', required: false },
      { name: 'role', label: 'Role', type: 'select', required: true, validation: { options: ['employee', 'admin'] } }
    ],
    requiredFields: ['name', 'email', 'position', 'departmentId', 'role'],
    sampleData: [
      {
        name: 'John Doe',
        email: 'john.doe@company.com',
        position: 'Software Engineer',
        departmentId: 'dept-001',
        phone: '+1234567890',
        role: 'employee'
      }
    ]
  },
  {
    name: 'KPI Import',
    description: 'Import KPI definitions from Excel file',
    type: 'kpis',
    fields: [
      { name: 'name', label: 'KPI Name', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string', required: true },
      { name: 'department', label: 'Department', type: 'string', required: true },
      { name: 'unit', label: 'Unit', type: 'string', required: true },
      { name: 'frequency', label: 'Frequency', type: 'select', required: true, validation: { options: ['daily', 'weekly', 'monthly', 'quarterly', 'annually'] } },
      { name: 'target', label: 'Target', type: 'number', required: true },
      { name: 'weight', label: 'Weight', type: 'number', required: false, validation: { min: 1, max: 10 } }
    ],
    requiredFields: ['name', 'description', 'department', 'unit', 'frequency', 'target'],
    sampleData: [
      {
        name: 'Sales Target',
        description: 'Monthly sales target achievement',
        department: 'Sales',
        unit: 'VND',
        frequency: 'monthly',
        target: 1000000,
        weight: 5
      }
    ]
  },
  {
    name: 'Department Import',
    description: 'Import department data from Excel file',
    type: 'departments',
    fields: [
      { name: 'name', label: 'Department Name', type: 'string', required: true },
      { name: 'description', label: 'Description', type: 'string', required: true },
      { name: 'manager', label: 'Manager', type: 'string', required: false },
      { name: 'location', label: 'Location', type: 'string', required: false }
    ],
    requiredFields: ['name', 'description'],
    sampleData: [
      {
        name: 'Human Resources',
        description: 'Human Resources Department',
        manager: 'Jane Smith',
        location: 'Floor 3'
      }
    ]
  }
];
