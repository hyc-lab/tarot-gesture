import { copyFileSync, existsSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const sourceDir = join(rootDir, 'node_modules', '@mediapipe', 'hands')
const targetDir = join(rootDir, 'public', 'mediapipe', 'hands')

const files = [
  'hands.binarypb',
  'hands_solution_packed_assets.data',
  'hands_solution_packed_assets_loader.js',
  'hands_solution_simd_wasm_bin.data',
  'hands_solution_simd_wasm_bin.js',
  'hands_solution_simd_wasm_bin.wasm',
  'hands_solution_wasm_bin.js',
  'hands_solution_wasm_bin.wasm',
  'hand_landmark_full.tflite',
  'hand_landmark_lite.tflite',
]

if (!existsSync(sourceDir)) {
  throw new Error(`MediaPipe Hands package not found: ${sourceDir}`)
}

mkdirSync(targetDir, { recursive: true })

files.forEach((file) => {
  copyFileSync(join(sourceDir, file), join(targetDir, file))
})

console.log(`Copied ${files.length} MediaPipe Hands assets to public/mediapipe/hands`)
