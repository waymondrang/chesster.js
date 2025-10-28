const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
const config = {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
};

module.exports = config;
