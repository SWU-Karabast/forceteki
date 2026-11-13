---
name: setup-aws-sso
description: >
  Set up the AWS CLI v2 and an IAM Identity Center (SSO) profile for the Karabast AWS account, so the user can
  run read-only AWS commands such as the search-prod-logs skill. Assumes the user already has access to the
  account. TRIGGER when: the user asks to set up or fix AWS CLI / SSO / AWS credentials for Karabast, or agrees
  to set it up after another skill (such as search-prod-logs) finds no SSO profile.
---

Walk the user through installing the AWS CLI v2 and adding an SSO profile for the Karabast account to their AWS
config. This skill contains no account details: ask the user for each value and tell them where to find it.
These values belong only in the user's own AWS config file. Never write them into the repository.

The user signs in through their browser. Never ask for a password, MFA code or access keys, and tell the user
not to paste them into chat. If the user doesn't have access to the account yet, or gets stuck on anything
below, they should reach out to the dev admins.

## 1. Check what is already there

Run these. None of them contact AWS:

```bash
aws --version
aws configure list-profiles
```

- **`aws` not found, or a version starting with `aws-cli/1.`:** install v2 (step 2). Version 1 doesn't support
  the `sso-session` config used here.
- **Profiles exist:** check whether the config file already has an SSO profile: a line starting with
  `sso_session` or `sso_start_url` in `~/.aws/config` (`%USERPROFILE%\.aws\config` on Windows). Don't print the
  file. If there is one, ask whether it is for the Karabast account. If it is, skip to step 5 to test it. If the
  user wants it replaced, change it only with their agreement and after taking a backup.

## 2. Install the AWS CLI v2

Ask before installing anything. Then use the official installer for their platform:

- **Windows:** `winget install --id Amazon.AWSCLI -e`, or the MSI from https://awscli.amazonaws.com/AWSCLIV2.msi.
- **macOS:** the package from https://awscli.amazonaws.com/AWSCLIV2.pkg (or `brew install awscli`).
- **Linux:** follow https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html. It needs
  `sudo`, so the user may have to run that step themselves.

A new terminal may be needed before `aws` is on the PATH. Confirm with `aws --version` (it should print
`aws-cli/2.`).

## 3. Collect the values

Ask for these one or two at a time, saying where to find each. The user can see all of them after signing in to
the **AWS access portal**, the IAM Identity Center page that lists the accounts they can use.

| Config field | What it is | Where the user finds it |
| --- | --- | --- |
| `sso_start_url` | AWS access portal URL | The link in their IAM Identity Center invitation email, or the address of the portal page they sign in to. Users with Identity Center console access can also find it under IAM Identity Center → Dashboard → Settings summary → "AWS access portal URL". It looks like `https://ssoins-<id>.portal.<region>.app.aws` or `https://d-<id>.awsapps.com/start`. |
| `sso_region` | Region of the Identity Center instance | `us-east-1` for Karabast. Only ask if the portal URL names a different region. |
| `sso_account_id` | 12-digit AWS account ID | In the access portal, under the Karabast account's name in the account list. |
| `sso_role_name` | Permission set to sign in with | In the access portal, click the Karabast account. The names listed (for example `AdministratorAccess`) are the permission sets they've been given. Enter the name exactly as shown. If they have several, use the one that covers what they need (the least powerful that works). |

Fixed values (don't ask): profile `region = us-east-1` (where the backend and its logs are), `output = json`,
`sso_registration_scopes = sso:account:access`. Use `karabast` as the SSO session name.

Check each answer before going on. The account ID is exactly 12 digits. The portal URL starts with `https://`
and has no path after `/start`, or no path at all for the `portal.<region>.app.aws` form. The role name has no
spaces. If something looks wrong, say so and ask again rather than guessing.

## 4. Write the config

`aws configure set` can't write `[sso-session]` sections. `aws configure sso` is interactive and can't run in
your shell, though the user can run it themselves in a terminal if they prefer. So write the block yourself.

Choose the profile header:
- **No `[default]` profile yet:** use `[default]`, so AWS commands and the search-prod-logs skill work without
  setting anything.
- **`[default]` already exists for something else:** use `[profile karabast]` and tell the user to set
  `AWS_PROFILE=karabast` (or pass `--profile karabast`) for Karabast commands. Never overwrite their existing
  default.

Show the user the block with their values, and write it once they agree. If the file exists, copy it to
`config.bak` in the same folder first, then append the block. If it doesn't exist, create the folder and the
file. Don't touch other sections. Below, swap `[default]` for `[profile karabast]` if that's the header you chose.

```ini
[default]
sso_session = karabast
sso_account_id = <12-digit account ID>
sso_role_name = <permission set name>
region = us-east-1
output = json

[sso-session karabast]
sso_start_url = <AWS access portal URL>
sso_region = us-east-1
sso_registration_scopes = sso:account:access
```

If an `[sso-session karabast]` section already exists, don't add a second one: reuse it if its URL matches, or
ask the user.

## 5. Sign in and test

1. Run `aws sso login` (add `--profile karabast` if you used a named profile) in the background. It waits
   for the browser sign-in. Read the authorize URL it prints and give it to the user in case the browser didn't
   open. On a machine without a browser, use `aws sso login --use-device-code` and give the user the URL and
   code it prints.
2. When it finishes, run `aws sts get-caller-identity --query Arn --output text` (with the profile if needed).
   The ARN should name the permission set they chose.
3. Check read access to the prod logs:
   `aws logs describe-log-groups --log-group-name-prefix KarabastMainStack --region us-east-1 --query 'length(logGroups)'`.
   A number above 0 means search-prod-logs will work.

Everything in this step is read-only. Don't run anything that changes AWS resources while setting up or
testing.

## Troubleshooting

- **`Token has expired and refresh failed` / `Error loading SSO Token`:** the sign-in has expired or never
  happened. Run `aws sso login` again. This is normal; sessions last hours, not days.
- **`ForbiddenException` / `No access` after signing in:** the account ID or role name doesn't match an
  assignment. Compare them with the access portal, character for character.
- **`AccessDeniedException` on `describe-log-groups`:** sign-in works, but this permission set can't read the
  logs. The user needs a different permission set; ask the dev admins.
- **`The config profile (karabast) could not be found`:** `AWS_PROFILE` or `--profile` doesn't match the header.
  The header is `[profile karabast]`, but the name you pass is just `karabast`.
- **The browser opens the wrong account or sign-in page:** the portal URL is wrong, or a different Identity
  Center session is signed in. Check `sso_start_url`.

## Finish

Tell the user:
- which profile was set up, and whether they need `AWS_PROFILE`,
- that `aws sso login` is the one command to run whenever it expires,
- that a backup of their old config is at `config.bak`, if you made one.
