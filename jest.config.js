/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */

const config = {
    testEnvironment: 'jsdom',
    extensionsToTreatAsEsm: ['.jsx', '.tsx', '.ts'],
};

export default config;
