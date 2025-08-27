#!/usr/bin/env node

/**
 * Import N8N workflows from the n8n-workflows directory
 * This script reads all JSON workflow files and imports them to the N8N instance
 */

const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const N8N_HOST = process.env.N8N_HOST || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const N8N_BASIC_AUTH_USER = process.env.N8N_BASIC_AUTH_USER;
const N8N_BASIC_AUTH_PASSWORD = process.env.N8N_BASIC_AUTH_PASSWORD;

const WORKFLOWS_DIR = path.join(__dirname, '../../n8n-workflows');

class N8NWorkflowImporter {
  constructor() {
    this.client = axios.create({
      baseURL: N8N_HOST,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Setup authentication
    if (N8N_API_KEY) {
      this.client.defaults.headers['X-N8N-API-KEY'] = N8N_API_KEY;
    } else if (N8N_BASIC_AUTH_USER && N8N_BASIC_AUTH_PASSWORD) {
      this.client.defaults.auth = {
        username: N8N_BASIC_AUTH_USER,
        password: N8N_BASIC_AUTH_PASSWORD,
      };
    }
  }

  async checkN8NHealth() {
    try {
      const response = await this.client.get('/healthz');
      console.log('✅ N8N is healthy and accessible');
      return true;
    } catch (error) {
      console.error('❌ N8N health check failed:', error.message);
      return false;
    }
  }

  async getExistingWorkflows() {
    try {
      const response = await this.client.get('/api/v1/workflows');
      return response.data.data || [];
    } catch (error) {
      console.error('❌ Failed to fetch existing workflows:', error.message);
      return [];
    }
  }

  async findWorkflowFiles() {
    const workflowFiles = [];
    
    async function scanDirectory(dir) {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          await scanDirectory(fullPath);
        } else if (entry.name.endsWith('.json')) {
          workflowFiles.push(fullPath);
        }
      }
    }

    try {
      await scanDirectory(WORKFLOWS_DIR);
      console.log(`📂 Found ${workflowFiles.length} workflow files`);
      return workflowFiles;
    } catch (error) {
      console.error('❌ Failed to scan workflows directory:', error.message);
      return [];
    }
  }

  async importWorkflow(filePath) {
    try {
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const workflow = JSON.parse(fileContent);
      
      console.log(`📥 Importing workflow: ${workflow.name}`);

      // Check if workflow already exists
      const existingWorkflows = await this.getExistingWorkflows();
      const existingWorkflow = existingWorkflows.find(w => w.name === workflow.name);

      if (existingWorkflow) {
        console.log(`⚠️  Workflow "${workflow.name}" already exists. Updating...`);
        
        // Update existing workflow
        const response = await this.client.put(`/api/v1/workflows/${existingWorkflow.id}`, {
          ...workflow,
          id: existingWorkflow.id,
        });
        
        console.log(`✅ Updated workflow: ${workflow.name}`);
        return { action: 'updated', workflow: response.data };
      } else {
        // Create new workflow
        const response = await this.client.post('/api/v1/workflows', workflow);
        console.log(`✅ Created workflow: ${workflow.name}`);
        return { action: 'created', workflow: response.data };
      }
    } catch (error) {
      console.error(`❌ Failed to import workflow from ${filePath}:`, error.message);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      return { action: 'failed', error: error.message };
    }
  }

  async importAllWorkflows() {
    console.log('🚀 Starting N8N workflow import process...\n');

    // Check N8N accessibility
    const isHealthy = await this.checkN8NHealth();
    if (!isHealthy) {
      console.log('💡 Make sure N8N is running and accessible at:', N8N_HOST);
      process.exit(1);
    }

    // Find all workflow files
    const workflowFiles = await this.findWorkflowFiles();
    
    if (workflowFiles.length === 0) {
      console.log('⚠️  No workflow files found in', WORKFLOWS_DIR);
      return;
    }

    // Import each workflow
    const results = {
      created: 0,
      updated: 0,
      failed: 0,
      total: workflowFiles.length,
    };

    for (const filePath of workflowFiles) {
      const relativePath = path.relative(WORKFLOWS_DIR, filePath);
      console.log(`\n📋 Processing: ${relativePath}`);
      
      const result = await this.importWorkflow(filePath);
      
      if (result.action === 'created') {
        results.created++;
      } else if (result.action === 'updated') {
        results.updated++;
      } else if (result.action === 'failed') {
        results.failed++;
      }
    }

    // Print summary
    console.log('\n📊 Import Summary:');
    console.log(`   Total workflows processed: ${results.total}`);
    console.log(`   ✅ Created: ${results.created}`);
    console.log(`   🔄 Updated: ${results.updated}`);
    console.log(`   ❌ Failed: ${results.failed}`);

    if (results.failed > 0) {
      console.log('\n⚠️  Some workflows failed to import. Check the logs above for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All workflows imported successfully!');
      
      if (results.created > 0 || results.updated > 0) {
        console.log('\n💡 Next steps:');
        console.log('   1. Review imported workflows in N8N UI');
        console.log('   2. Configure credentials for external services');
        console.log('   3. Test workflows with sample data');
        console.log('   4. Enable automatic executions');
      }
    }
  }

  async activateWorkflow(workflowId) {
    try {
      await this.client.post(`/api/v1/workflows/${workflowId}/activate`);
      console.log(`🟢 Activated workflow: ${workflowId}`);
    } catch (error) {
      console.error(`❌ Failed to activate workflow ${workflowId}:`, error.message);
    }
  }

  async activateAllWorkflows() {
    console.log('🔄 Activating all imported workflows...\n');
    
    const workflows = await this.getExistingWorkflows();
    
    for (const workflow of workflows) {
      if (!workflow.active) {
        await this.activateWorkflow(workflow.id);
      }
    }
    
    console.log('\n✅ All workflows activated!');
  }
}

// Main execution
async function main() {
  const importer = new N8NWorkflowImporter();
  
  try {
    await importer.importAllWorkflows();
    
    // Ask if user wants to activate workflows
    const args = process.argv.slice(2);
    if (args.includes('--activate')) {
      console.log('\n');
      await importer.activateAllWorkflows();
    } else {
      console.log('\n💡 To activate workflows automatically, run: npm run n8n:import -- --activate');
    }
  } catch (error) {
    console.error('\n💥 Import process failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { N8NWorkflowImporter };