#!/usr/bin/env node
/**
 * ESLint Configuration Validation Script
 * 
 * This script validates that all ESLint configurations are working correctly
 * and can be used to catch configuration issues early.
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../..');

const configs = [
  {
    name: 'Main Configuration',
    config: 'config/eslint/index.js',
    testFile: 'src/routes/index.tsx'
  },
  {
    name: 'Radix Configuration', 
    config: 'config/eslint/eslint.radix.config.js',
    testFile: 'src/components/ui/select.tsx'
  }
];

async function runEslint(config, testFile) {
  return new Promise((resolve, reject) => {
    const eslint = spawn('npx', ['eslint', testFile, '--config', config], {
      cwd: projectRoot,
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    eslint.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    eslint.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    eslint.on('close', (code) => {
      resolve({ code, stdout, stderr });
    });

    eslint.on('error', (error) => {
      reject(error);
    });
  });
}

async function validateConfigs() {
  console.log('🔍 Validating ESLint Configurations...\n');

  let allPassed = true;

  for (const { name, config, testFile } of configs) {
    try {
      console.log(`Testing ${name}...`);
      const result = await runEslint(config, testFile);
      
      if (result.stderr && !result.stderr.includes('warning')) {
        console.log(`❌ ${name} failed:`);
        console.log(`   Error: ${result.stderr}`);
        allPassed = false;
      } else {
        console.log(`✅ ${name} passed`);
      }
    } catch (error) {
      console.log(`❌ ${name} failed with exception:`);
      console.log(`   Error: ${error.message}`);
      allPassed = false;
    }
  }

  console.log('\n' + '='.repeat(50));
  
  if (allPassed) {
    console.log('🎉 All ESLint configurations are working correctly!');
    process.exit(0);
  } else {
    console.log('💥 Some ESLint configurations have issues. Please check the errors above.');
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  validateConfigs().catch(console.error);
}

export { validateConfigs }; 