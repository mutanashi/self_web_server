// jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',  // 改為 jsdom，如果你測的是前端元件或 DOM 交互
  moduleFileExtensions: ['ts', 'tsx', 'js'],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  testMatch: ['**/*.test.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1', // 👈 這一行是關鍵：對應 tsconfig 裡的 paths
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy', // 若你 import 樣式，也建議保留這行
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'], // 若你有 jest-dom 設定
}
