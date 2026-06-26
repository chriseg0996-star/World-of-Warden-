#!/usr/bin/env node
import { execSync } from 'node:child_process';

process.env.DESKTOP_SHELL = '1';
execSync('npm run build', { stdio: 'inherit', env: process.env });
