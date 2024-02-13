/// <reference types="vitest" />
/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url'

import { defineProject, mergeConfig } from 'vitest/config'
import sharedVitestConfig from '../vitest.shared.js'

// const toPath = url => fileURLToPath(new URL(url, import.meta.url))

export default mergeConfig(sharedVitestConfig, defineProject({}))
