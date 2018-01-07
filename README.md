# LaunchKey

> Manage app configs locally!

## Why?

1. Configuring apps through env vars is painful because they are all strings
2. Relying on external providers encrypted keys leads to lock-in

## What?

You manage configs for all envs in a single envs file that is checked into source control — but sensitive values are encrypted.

When needed, you generate decrypted JSON files out of it that can be simply `require`'d in your app. The important part here is that this only happens on the CI server or before deploy, meaning that even though the file is present in the repo, no one can get to the sensitive data because it is encrypted.

## How?

You start with a plain text JSON file called `envs.json`, which includes configs for all envs. For example:

```json
{
  "local": {
    "API_TOKEN": "foo-bar-baz",
    "API_ORIGIN": "http://localhost:8080"
  },
  "production": {
    "!API_TOKEN": "beep-boop-boom",
    "API_ORIGIN": "https://api.example.com"
  }
}
```

Notice how `API_TOKEN` inside the `production` config starts with `!`? This tells LaunchKey to encrypt this entry. We'll do that now.

Run: `launchkey encrypt production`. This will give you output that looks something like:

```
Success: "prod" env encrypted.
Secret key: 01C3751AYNCD6ATM0HYSCDJWXJ
(Keep your secret safe — you can't decrypt without it!)
```

Now if you open `envs.json` again, you will get something along the lines of:

```
{
  "local": {
    "API_TOKEN": "foo-bar-baz",
    "API_ORIGIN": "http://localhost:8080"
  },
  "production": {
    "!API_TOKEN": "ca3361ba49e9b46781c4e369ec4d9716f407c399d97bc61a5bec38855b3e0be985c1ddf5c19eeca6adcba2bc3618afd9mDejpNtCpPb6EqSJBKx6rKaejhtP+CD4JXqOLUgeeMY=",
    "API_ORIGIN": "https://api.example.com"
  }
}
```

The `API_TOKEN` key inside of production is now encrypted using the secret key.

Finally, once you want to generate production config to be used by your app (perhaps you do that during deploy on your CI server), you simply run: `launchkey generate production --secret 01C3751AYNCD6ATM0HYSCDJWXJ`.

This will output the following into `config.json`:

```json
{
  "API_TOKEN": "beep-boop-boom",
  "API_ORIGIN": "https://api.example.com"
}
```
