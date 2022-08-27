/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
const config = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.jsx', '.tsx', '.ts'],
};

export default config;
