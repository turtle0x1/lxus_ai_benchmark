#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const envPath = path.resolve(__dirname, '../.env');
const runPath = path.resolve(__dirname, './run.js');
const args = process.argv.slice(2);
const proc = spawn('node', ['--env-file', envPath, runPath, ...args], {
    stdio: 'inherit',
});

proc.on('close', (code) => {
    process.exit(code);
});
