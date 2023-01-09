import { fileURLToPath, URL } from 'node:url'

import viteCompression from 'vite-plugin-compression';
import { visualizer } from "rollup-plugin-visualizer"

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

import { VitePWA } from 'vite-plugin-pwa'

import pwaConfig from './pwa.config';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), VitePWA(pwaConfig), visualizer(), viteCompression()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
