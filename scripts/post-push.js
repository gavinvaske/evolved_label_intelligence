#!/usr/bin/env node

const { execSync } = require('child_process');

try {
    // Get the current branch name
    const branch = execSync('git symbolic-ref --short HEAD').toString().trim();
  
    console.log(`Running acceptance tests after push to ${branch}...`);
  
    // Run the acceptance tests
    execSync('npm run acceptance', { stdio: 'inherit' });
  
    console.log('Acceptance tests passed successfully!');
} catch (error) {
    console.error('Acceptance tests failed! Please check the test results.');
    // Don't exit with error since this is post-push
    process.exit(0);
} 