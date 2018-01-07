const fs = require("fs");
const path = require("path");
const chalk = require("chalk");
const { ulid } = require("ulid");
const createEncryptor = require("simple-encryptor");

const assert = (value, message) => {
  if (!value) {
    console.error(chalk.red(message));
    process.exit(1);
  }
};

const readConfig = path => {
  return JSON.parse(fs.readFileSync(path, "utf8"));
};

const getEnv = (envName, config) => {
  const env = config[envName];
  assert(env, `No env called "${envName}" found. Aborting...`);
  return env;
};

const processFlaggedEntries = (originalObject, valueFn, keyFn = key => key) => {
  const newObject = {};

  for (const key in originalObject) {
    if (key.startsWith("!")) {
      newObject[keyFn(key)] = valueFn(originalObject[key], key);
    } else {
      newObject[key] = originalObject[key];
    }
  }

  return newObject;
};

const encryptEnv = (originalEnv, secret) => {
  const encryptValue = value => {
    assert(
      secret.length > 15,
      `Your encryption secret key is too short. Minimum secret key length is 16 characters.`,
    );

    const encryptor = createEncryptor(secret);
    return encryptor.encrypt(value);
  };

  return processFlaggedEntries(originalEnv, encryptValue);
};

const decryptEnv = (originalEnv, secret) => {
  const decryptValue = (value, key) => {
    assert(
      secret,
      `Couldn't decrypt the "${key}" key. Secret key was not provided. Make sure you provide a secret key when running this command with an env that contains encrypted values.`,
    );
    assert(
      secret.length > 15,
      `Your decyption secret key is too short (meaning is's probably the wrong key). Minimum secret key length is 16 characters.`,
    );
    const encryptor = createEncryptor(secret);
    const decryptedValue = encryptor.decrypt(value);
    assert(
      decryptedValue !== null,
      `Couldn't decrypt value for the "${key}" key. Your decryption secret key is probably incorrect.`,
    );

    return decryptedValue;
  };

  const stripFlag = key => key.slice(1);

  return processFlaggedEntries(originalEnv, decryptValue, stripFlag);
};

const updateConfig = (envName, env, config) => {
  return Object.assign({}, config, { [envName]: env });
};

const writeObject = (path, object) => {
  fs.writeFileSync(path, JSON.stringify(object, null, 2));
};

const encryptEnvCommand = (args, options, logger) => {
  const { env: envName } = args;
  const { secret: secretKey = ulid(), config: configPath } = options;

  const absoluteConfigPath = path.resolve(configPath);

  // Read LK config
  const config = readConfig(absoluteConfigPath);

  // Extract specified env
  const env = getEnv(envName, config);

  // Encrypt every key that starts with !
  const encryptedEnv = encryptEnv(env, secretKey);

  // Update config
  const updatedConfig = updateConfig(envName, encryptedEnv, config);

  // Write config
  writeObject(absoluteConfigPath, updatedConfig);

  // Inform of success
  logger.info(chalk.green(`Success: "${envName}" env encrypted.`));
  logger.info(`Secret key: ${chalk.cyan(secretKey)}`);
  logger.info(`(Keep your secret safe — you can't decrypt without it!)\n`);
};

const generateEnvCommand = (args, options, logger) => {
  const { env: envName, path: destPath } = args;
  const { secret: secretKey, config: configPath } = options;

  const absoluteConfigPath = path.resolve(configPath);

  // Read LK config
  const config = readConfig(absoluteConfigPath);

  // Extract specified env
  const env = getEnv(envName, config);

  // Encrypt every key that starts with !
  const decryptedEnv = decryptEnv(env, secretKey);

  const absoluteDestPath = path.resolve(destPath);

  // Write config
  writeObject(absoluteDestPath, decryptedEnv);

  // Inform of success
  logger.info(chalk.green(`Success: "${envName}" env written to "${destPath}".`));
};

module.exports = {
  encrypt: encryptEnvCommand,
  generate: generateEnvCommand,
};
