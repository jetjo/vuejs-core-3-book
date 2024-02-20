/// <reference types="vitest" />
/// <reference types="vitest/config" />
// @ts-ignore
import { fileURLToPath, URL } from 'node:url'

import { defineProject, mergeConfig } from 'vitest/config'

import sharedVitestConfig from '../vitest.shared.js'

export default mergeConfig(sharedVitestConfig, defineProject({}))
