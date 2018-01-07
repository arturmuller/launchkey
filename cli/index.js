#! /usr/bin/env node

const cli = require("caporal");
const pkg = require("../package");
const commands = require("./commands");

const getDefaultsFromEnv = () => {
  const lk = process.env.LAUNCHKEY;
  if (lk) {
    const [env, ...secretParts] = lk.split(":");
    return {
      env,
      secret: secretParts.join(":"),
    };
  } else {
    return { env: "local" };
  }
};

const { env, secret } = getDefaultsFromEnv();

// prettier-ignore
cli
  .version(pkg.version)
  .description(pkg.description)

  .command("encrypt", "Encrypts specified env")
  .option("-s, --secret <value>", "Specify encryption secret (defaults to random ULID)", null, secret)
  .option("-c, --config <path>", "Override default config path", null, "envs.json")
  .argument("[env]", "Name of env to encrypt", null, env)
  .action(commands.encrypt)

  .command("generate", "Generates env config")
  .option("-s, --secret <value>", "Specify encryption secret", null, secret)
  .option("-c, --config <path>", "Override default config path", null, "envs.json")
  .argument("[env]", "Name of env to generate", null, env)
  .argument("[path]", "Path to which env config should be written", null, "config.json")
  .action(commands.generate)

// .command("decrypt", "Decrypts LauchKey config file")
// .option("--key <value>", "Specify decryption key inline (falls back to reading key from --key-file)", null, process.env.LAUNCHKIT_KEY)
// .option("--key-file <path>", "Override default key file path", null, ".key")
// .option("--dest <destination>", "Relative path to where decrypted config file should be written", null, "launchkit.decrypted.yml")
// .argument("<source>", "Relative path from where ecrypted config should be read")
// .action(decrypt)
//
// .command("generate", "Writes environment config  ")
// .option("--key <value>", "Specify decryption key inline (falls back to reading key from --key-file)", null, process.env.LAUNCHKIT_KEY)
// .option("--key-file <path>", "Override default key file path", null, ".key")
// .option("--dest <destination>", "Relative path to where decrypted config file should be written", null, "launchkit.decrypted.yml")
// .argument("<source>", "Relative path from where ecrypted config should be read")
// .action(decrypt)
//
// .command("view", "Prints decrypted config (or specific env) to stdout")
// .option("-c, --config <path>", "Override default config path", null, "launchkit.yml")
// .option("--key <value>", "Specify decryption key inline (falls back to reading key from --key-file)", null, process.env.LAUNCHKIT_KEY)
// .option("--key-file <path>", "Override default key file path", null, ".key")
// .option("-d, --with-default", "Merge env with default")
// .argument("[env]", "Name of env to view")
// .action(view)
//
// .command("protect", "Indicates specfied env as protected")
// .option("-c, --config <path>", "Override default config path", null, "launchkit.yml")
// .argument("<env>", "Name of env for which to update keys")
// .action(protect)
//
// .command("update", "Updates and encrypts specified keys on config")
// .alias("add")
// .option("-c, --config <path>", "Override default config path", null, "launchkit.yml")
// .option("--key <value>", "Specify decryption key inline (falls back to reading key from --key-file)", null, process.env.LAUNCHKIT_KEY)
// .option("--key-file <path>", "Override default key file path", null, ".key")
// .argument("<env>", "Name of env for which to update keys")
// .argument("<pairs...>", "Key/value pairs to update. Supply as `path.to.key=value`")
// .action(update)
//
// .command("remove", "Removes specified keys from config")
// .option("-c, --config <path>", "Override default config path", null, "launchkit.yml")
// .argument("<env>", "Name of env from which to remove keys")
// .argument("<keys...>", "Keys to remove form env. Supply as `path.to.key`")
// .action(remove);

cli.parse(process.argv);
