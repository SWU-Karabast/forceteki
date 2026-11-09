# Preview card automation

**Status:** draft for lead review · **Date:** 2026-11-08 · **Repos:** forceteki, forceteki-client, forceteki-infra

## Summary

During preview season the Unimplemented page goes stale. It also lists only cards that are not implemented, so players can't tell "already implemented" apart from "not on the server yet". We propose:

1. **A scheduled GitHub Actions workflow, hosted in forceteki-infra.** Twice a day it:
   - asks swudb which cards are revealed in each preview set,
   - downloads new or changed images and makes our image variants,
   - uploads them to S3 with a few labels on each file,
   - updates a small index of the set.

   Named people can also start a run by hand from GitHub.
2. **A card-status endpoint on the game server.** It reads each set's index when the page asks for it, checks the index before using it, and joins it with the server's card data. The page then shows every revealed card in a preview set as implemented or not implemented, with no deploy needed for new reveals.
3. **One image pipeline, in TypeScript.** `images-scripts/process_cards.py` (client repo) is ported into forceteki as a command-line tool that the workflow runs. Developers can still run it locally for manual corrections. The port is validated against the Python output, then the Python script is retired.
4. **Nothing that can get permanently out of sync.** The images and their labels are the only source of truth. The index is a cache that any run can rebuild, the server never uses an index that fails its checks, and S3 versioning allows rollback.

**Why GitHub Actions and not the game node:** swudb's Cloudflare already throttles some of the game node's deck-list requests. Scanning from the same IP would compete with those requests, and with deck imports in general. Moving the work off the game node also keeps image processing, a native image library and image-bucket write access away from the server. Section 13 covers the game-node design we considered.

## 1. Background

**The page today.** The client calls `GET /api/get-unimplemented`, which returns every card in the server's built-in card data whose `implemented` flag is false, across all sets (`DeckValidator.getUnimplementedCards`). The client builds image URLs from `setId` alone, and uses the card type only to lay out bases as landscape tiles.

**Why it goes stale.** A preview card reaches the page only when someone adds it to `scripts/mockdata.js` and we deploy. There have been about 30 `mockdata` PRs since late August across the HMW and IC27 preview seasons. Cards revealed since the last deploy are missing, and implemented cards are never listed, so a missing card is ambiguous.

**Images today.** `process_cards.py` is run by hand. It:

- downloads English images from swudb and localized images from the FFG card API,
- makes four WebP variants per image (standard 400 px and 200 px, truncated 180 px and 100 px),
- copies the English image into any locale FFG hasn't published yet, because the client assumes every locale's image exists,
- uploads to `karabast-data/cards/{SET}/{locale}/…`, skipping files whose MD5 matches the S3 ETag.

It carries per-set special cases (TS26's non-standard swudb file numbers, IBH's leader at #53, TWI #17's two landscape faces, per-set scan limits). Its skip logic depends on a local disk cache.

## 2. Goals and non-goals

Goals:

- Newly revealed preview cards appear on the page within about 12 hours, without a deploy.
- The page shows every revealed card in a preview set with its implementation status.
- One image pipeline that behaves like the Python script and still runs locally.
- No work on the game node beyond reading a small index.
- Only named people can start a run by hand.
- No shared state that a failed write or a mistake can leave permanently inconsistent.

Non-goals:

- Generating mock card data automatically. Card data that feeds the engine stays hand-reviewed.
- Automating tokens. They need a hand-made swudb-to-FFG id mapping, so they stay a manual run of the tool.
- Changing how implementation status is computed. It still changes only when a deploy ships the implementation, which is correct.

## 3. What swudb offers

**Images** live at `swudb.com/images/cards/{SET}/{NNN}.png`, with `-portrait` / `-back` files for leaders. They sit behind Cloudflare and carry `ETag` and `Last-Modified`, so unchanged images can be re-checked with cheap 304 responses. swudb tells caches to keep a 404 for 4 hours.

**A JSON API.** swudb's own pages use an undocumented JSON API. On 2026-11-08 it answered from a home connection without logging in:

- `GET /api/card/getAllSets` lists every set with its code, release date, `previewedCount`, and `cardCount`, the printed set size. For IC27, `cardCount` is 194. HMW has no `cardCount`.
- `POST /api/card/getSetInfo`, with body `{"expansionAbbreviation": "IC27", "fullSet": false}`, returns every revealed printing in groups named Normal, Hyperspace, Showcase and Promo. Each printing has `cardName` (title only, no subtitle), `cardNumber`, `frontImagePath`, `backImagePath`, `isFrontPortrait` and `isBackPortrait`.
- For IC27 the Normal group held cards 1–194 plus the tokens T01 and T02. Variants are numbered above that: Hyperspace 195–217, Showcase 559–566.

One request per set therefore tells us every revealed card, its name, both image paths, and each face's orientation. Leaders, bases and two-landscape-face leaders are recognisable without per-set configuration. The API is undocumented and we can't coordinate with swudb, so the workflow:

- validates the response shape strictly,
- falls back to probing image URLs, the way the Python script does, if the call fails or the shape changes.

**Not yet verified:** whether Cloudflare treats GitHub's runners the way it treats a home connection. The first rollout step checks this.

## 4. Configuration

- **Which sets are in preview.** A set is in preview when its `releaseStage` in `server/utils/deck/SwuSetData.ts` is `Next` or `Future`. The tool reads that file directly, so there is one source of truth.
- **Per-set config table** in forceteki, for what the Python script hardcodes today: scan limit, extra leader numbers, landscape-double leaders, swudb number widths. With API discovery these are needed only for the probing fallback and for backfills of old sets. The fallback's scan limit is `cardCount` from swudb when it is present, and the config value otherwise.
- **Cache headers** follow the release stage, as the script's `PREVIEW_SETS` list does today: 1 week while in preview, 1 year once Released. When a set becomes Released, the next run rewrites its headers in place.
- **The index** is uploaded with `Cache-Control: no-cache`, so readers re-check it with its ETag instead of trusting a stale copy.

## 5. Image pipeline (TypeScript port)

- **Location.**
  - The tool lives in `scripts/cardImages/`, run with ts-node like `validate-cards`. It takes the Python script's options: `--set`, `--locales`, `--from` / `--to`, `--dry-run`, `--tokens`, `--ffg-en-fallback`, `--strict-locales`, `--overwrite-downloads` and the tuning flags.
  - The definitions of the index and the file labels live in `server/utils/cardImages/`, so the server can read and check the index.
  - sharp, the image library, is a devDependency imported only under `scripts/`. The server never loads it.
- **Kept exactly as today:**
  - the S3 key layout and file names, including the leader naming convention and `-base2`,
  - FFG index filtering (variants and Token-typed entries skipped) and the FFG-to-swudb leader face swap,
  - token mode, the retry policy and dry-run,
  - the upload check: new, changed, header-only or up to date, including multipart ETags.
- **Output.** Pillow and libvips never produce identical bytes, so the target is visual equivalence, checked in section 11. To stay close, the port applies Pillow's unsharp-mask formula itself on raw pixels instead of libvips' different sharpen operation.
- **One deliberate improvement.** Each locale file's label records whether it is FFG's image or an English copy. Today an English copy is never refreshed when the English image improves. With the label, copies are refreshed, and a real FFG image is still never overwritten.

## 6. Where the state lives

Only the images are a source of truth. Everything else can be rebuilt from them.

**The images and their labels.** Each card has 20 image files: 5 languages × standard/truncated × large/small. Each file carries S3 object metadata: small key-value labels stored with the file and saved in the same upload as the image, so a file and its labels always match.

- The card's **main file** is its English full-size image, `cards/{SET}/en/standard/large/{NNN}.webp`. It carries the card's facts:
  - the source (swudb, FFG's English image, or a manual correction),
  - the version of swudb's image it was made from (swudb's ETag),
  - the card name,
  - the orientation of each face,
  - whether the card is pinned after a hand correction.
- The other files carry a smaller label, such as whether a French file is FFG's image or an English copy.
- Each card's files are uploaded with the main file last. If a run stops partway, the main file still shows the old version, or doesn't exist yet, so the next run redoes the card.
- A main file without labels, for example one uploaded by hand in the AWS console, is treated as unprocessed. A locale file without labels is left alone unless it is byte-identical to the English image.

**The index.** One small file per set, `cards/{SET}/index.json`, summarizes every main file's labels, so the server reads one file instead of ~200. It is a cache: anything in it can be rebuilt from the images. For each card it also records `mainFileModified`, the time S3 last wrote the main file as of the last check. That lets a run spot an out-of-date entry without opening the file.

```
{ "set": "IC27", "cards": {
    "22": { "name": "Moff Gideon", "orientation": "portrait", "pinned": false,
            "sourceEtag": "1dd5db4560986e5", "mainFileModified": "2026-11-09T17:18:40Z" }
} }
```

**Keeping the index current.** Every run, scheduled or local, does this:

1. **Load the index** (1 request). If it's missing or fails its checks, rebuild it.
2. **Catch up.** List the set's main-file folder: 1 request per 1,000 files, returning names and timestamps but no image data.
   - For each main file that's newer than its entry, or has no entry, read that one file's labels (1 small request) and update the entry.
   - On a quiet day that's zero files. This step is how a run learns about other runs' work, including pins.
3. **Do the run's work** (section 7), uploading each changed card main file last.
4. **Catch up again, then save.** Repeat step 2, so the index includes this run's uploads and anyone else's, and write the index back only if something changed. An unchanged index keeps the server's conditional requests answering "not modified".

A **full rebuild** happens only when the index is missing, fails its checks, or someone asks for one. It reads the labels of every main file: about 200 small requests for a full set, a few seconds, and no image downloads.

**Several writers.** Anyone with access can write any set, from the workflow or from a local run.

- Overlapping runs don't lose each other's cards, because each catches up just before saving. Anything that still slips through is fixed by the next run's catch-up.
- The remaining collision: two runs processing the same card at the same moment from different sources, such as a hand correction during a scheduled run, can leave that card with a mix of both runs' files.
  - A `verify` command checks that each card's files have matching labels and lists any that don't. Re-running the card fixes it.
  - If we'd rather prevent this than detect it, a short per-set lock would do it. A run would create a lock file in S3 with a conditional write, hold it only while writing, and the lock would expire on its own if the run crashed. It limits when people can write, not who. We suggest starting without it.

## 7. The scheduled workflow

**Where it lives.** In forceteki-infra. It checks out forceteki, installs its dependencies, and runs the tool. Section 8 explains why it lives in the infra repo.

**Triggers.**

- A schedule, twice a day.
- `workflow_dispatch` for manual runs. Its inputs are a fixed list of choices and booleans: sets, dry run, re-check all images, rebuild the index, restore. They are passed to the tool through environment variables, never pasted into shell commands, which guards against script injection.

**Each run, for each preview set:**

1. Load the index and catch it up (section 6).
2. Call `getSetInfo` to list the revealed cards. If the response fails validation, probe numbers 1 to the scan limit instead.
3. Re-check each revealed card's images with conditional GETs, using the versions recorded in the index. An unchanged image costs a 304; a new or changed one is downloaded. Pinned cards are skipped.
4. Process the changed cards: four variants per language, English copies for languages without an FFG image, then upload with labels, main file last.
5. Fetch the FFG index for each locale (a few paginated requests) and pick up newly published localized images.
6. Catch up the index again and save it if anything changed. Post a summary of new, changed, failed and pinned cards to the run's page, and post failures to the existing Discord error channel (its webhook stored as an environment secret).

**Request budget.** Each run makes two or three API calls plus one conditional request per revealed card image, about 200 for a full set. The requests go out at low concurrency, with a User-Agent that names Karabast. If that proves too much, existing images can be re-checked once a day, with only new cards fetched in between.

**Schedule.** Every 12 hours, since previews mostly drop in US hours. Suggested slots are 05:17 and 17:17 UTC, roughly half past midnight and half past noon US Eastern.

- GitHub can delay scheduled runs, and drop some under load, especially at the start of every hour. Hence the odd minute.
- Cron runs in UTC and doesn't follow daylight saving.
- A late or dropped run is caught up by the next one.

**One workflow run at a time.** One concurrency group with `cancel-in-progress: false`. At most one run executes and one waits; a newer queued run replaces the waiting one.

**AWS access** goes through GitHub's OpenID Connect, so no long-lived AWS keys are stored in GitHub. The role, defined in forceteki-infra's CDK:

- trusts only tokens from forceteki-infra's two card-image environments (section 8), audience `sts.amazonaws.com`,
- may read, list and put objects under `karabast-data/cards/*`; listing also makes a missing key answer 404 instead of 403,
- may read old object versions, so it can restore them,
- has no delete permission, and its sessions last at most 1 hour.

## 8. Who can run it

**GitHub's rules** (verified against the GitHub Actions docs):

- Anyone with write access to a repo can start a `workflow_dispatch` run from the web UI, the CLI or the API.
- They can pick any branch, which runs that branch's copy of the workflow file.
- GitHub has no setting that limits manual runs to named people.

So the restriction comes from where the workflow lives and from what a run is allowed to do:

1. **The workflow lives in forceteki-infra.** Fewer people have write access there than to forceteki, and only they can start a run.
2. **Two environments, usable only from `main`.**
   - Scheduled runs use `card-images-scheduled`, and manual runs use `card-images-manual`. The workflow picks one by event type.
   - Both environments' deployment-branch rules allow only `main`.
   - Only repository admins can configure environments, and "Allow administrators to bypass configured protection rules" is turned off.
3. **AWS trusts only those two environments.** The role's trust policy matches their OIDC subjects exactly, for example `repo:SWU-Karabast/forceteki-infra:environment:card-images-manual`. A run from another branch, from a fork, or from a workflow that doesn't use the environments can't get credentials, so it can't touch our images.
4. **Named people for manual runs.** The first step fails any manual run unless `github.triggering_actor` is on an allowlist kept in the workflow file on `main`.
   - `triggering_actor` is whoever started this run or re-run, so someone off the list can't re-run a listed person's run.
   - Scheduled runs skip this check, since their actor is whoever last touched the schedule.
5. **Optional: second-admin sign-off.**
   - Required reviewers on `card-images-manual` (up to 6 people or teams), with "Prevent self-review" on, make every manual run wait for approval from a different admin.
   - Scheduled runs use the other environment, so they're unaffected, and switching sign-off on or off is a settings change, not a code change.
   - With few admins this could hold up an urgent fix, so we suggest leaving it off to start.

**What this does not stop:**

- Anyone with write access to forceteki-infra can run arbitrary code on GitHub's runners by pushing a workflow to a branch. Such a run could send requests to swudb, but it gets no AWS credentials.
- The workflow runs whatever is on forceteki's `main`. Anyone who can merge to forceteki therefore controls what it executes, and forceteki's PR review still protects the pipeline. To remove that dependency, the workflow could run a reviewed tag of forceteki instead, at the cost of bumping the tag by hand.
- Who has write access to forceteki-infra, and who can merge to forceteki, therefore remain the real boundaries.

**Options we didn't choose:**

- **Hosting the workflow in forceteki** with the same environments and allowlist. It works the same way, but more people have write access there.
- **Required reviewers on a single environment.** Protection rules apply to every job that uses the environment, so scheduled runs would also wait for approval.

**Two notes:**

- Environment protection rules are ignored if a public repo is made private on the free plan. forceteki-infra is public today.
- GitHub gives repositories created after July 15, 2026 a different default OIDC subject format. Ours are older, but the spike confirms the exact subject before the trust policy is written.

## 9. Running it locally

The tool works on a developer's machine the way the Python script does, for backfills and manual corrections.

- **Same stages and flags.** It keeps a local working directory of downloads and processed files. To correct an image, replace the downloaded file by hand and re-run from `resize`, as you would today.
- **Direct uploads, as today.** A local run writes straight to S3, adds the same labels, and keeps the index current with the same steps as the workflow (section 6).
- **Credentials.** It uses the developer's AWS SSO sign-in. It keeps the Python script's start-up check: confirm the identity, and offer `aws sso login` if the token has expired.
- **Pinning.** `--pin` marks a hand-corrected card in its labels, and scheduled runs leave pinned cards alone until someone runs `--unpin`. Every run summary lists the pinned cards, so none are forgotten.
- **New commands:**
  - `verify` checks that each card's files have matching labels,
  - `rebuild-index` rebuilds a set's index from the images,
  - `restore` copies back the last versions from before a given time, for one card or a whole set (section 10).

## 10. Recovery

**S3 versioning** is turned on for `karabast-data`, with a lifecycle rule that deletes old versions after about 90 days. Every overwritten file stays recoverable for that long. Once turned on, versioning can be suspended but never fully removed.

| What goes wrong | What happens | How to recover |
|---|---|---|
| A run stops partway | Unfinished cards still look unprocessed, and the index isn't saved | The next run redoes them |
| The index is wrong or mangled | The server rejects it, keeps its last good copy, and posts a Discord alert | The next run rebuilds it, or start one by hand; or restore the previous version |
| Wrong images are uploaded (a bad correction or an operator mistake) | Visible on the site | `restore` the card or set to its versions from before the mistake |
| Two runs mix one card's files | `verify` lists the card | Re-run that card |
| A file is uploaded by hand without labels | A main file is treated as unprocessed; a locale file is left alone | Re-run the card with the tool, using `--pin` if it's a correction |

## 11. Validating the port

The port replaces the Python script only after all of these pass:

1. **Behavior inventory.** Every Python behavior in section 5 becomes a named unit or integration test: per-set special cases, file naming, FFG filtering and face swap, fallback rules, the upload check, retries, token mode and the strict-locales exit codes.
2. **Side-by-side comparison.** Run both pipelines on the same downloaded inputs for TWI, IBH, TS26, HMW and the current preview set, in every locale. Require:
   - the same output paths,
   - the same image dimensions,
   - visual similarity above an agreed threshold (for example SSIM of at least 0.99), plus side-by-side sheets for a human pass.
3. **Discovery parity.** For the same sets, the swudb API and image probing must find the same cards and faces.
4. **Index parity.** After a scripted sequence of runs (new cards, updated images, pins, a run stopped partway, two overlapping runs), the index each run maintains must equal a full rebuild from the images.
5. **Dry run against production.** Run `--to check-exists` against the live bucket for every set. The plan should contain only re-encoded images: no new or missing keys and no header changes. That shows the key layout and header logic match.
6. **Cutover.**
   - Turn on versioning, then re-upload every set with the new tool. Every file is re-encoded anyway, and this gives every file its labels.
   - Build the indexes for the current preview sets.
   - Run the workflow in dry-run mode for a few days, then let it write.
   - The re-encoded images look the same, so no cache bust is needed.

On the server side, the index fetching, the checks and the endpoint are tested with the existing harness: virtual clock, `FakeHttpClient` in place of S3, and the fake DB.

## 12. Server and client changes

**The server reads indexes on demand.** When the page asks for card status and the server's copy is more than an hour old, it re-fetches each preview set's index from its public URL with `If-None-Match`.

- An unchanged index costs a 304 of a few hundred bytes.
- When nobody opens the page, there is no traffic at all.
- No polling, and no AWS credentials on the server.

**Before using an index, the server checks it:**

- the format matches,
- the set code matches,
- card numbers are unique and in range,
- it lists no fewer cards than the last good copy, since the pipeline never deletes images, unless the run that built it was explicitly told to allow removals.

A valid index replaces the server's copy. An invalid one is ignored: the server keeps its last good copy and posts one Discord alert per bad version to the existing error channel.

Fargate keeps nothing across restarts. If the index is bad when the server starts, the page shows only the cards the server has data for until it's fixed. If we want the last good copy to survive restarts, the server could keep it in DynamoDB, as the only writer, storing only checked data. We suggest starting without that.

The new public endpoint (name to be agreed):

```
GET /api/card-status
{
  "previewSets": [{
    "set": "IC27", "cardCount": 194, "revealed": 194, "implemented": 150,
    "cards": [{
      "setId": { "set": "IC27", "number": 22 },
      "id": "...",              // null when the server has no card data yet
      "titleAndSubtitle": "...", // swudb's title when the server has no data
      "types": "unit",          // null when unknown
      "implemented": false,
      "faces": [{ "portrait": true }]
    }]
  }],
  "unimplemented": [ /* released-set cards, same shape as get-unimplemented */ ]
}
```

- **The join.** Index entry, then `_setCodeMap.json` (`SET_NNN` to card id), then the card data in `DeckValidator`. This already handles reprints and duplicate numbers within a set. A mock card without an image yet is still listed.
- **Image-only cards never enter card data,** so deck validation and the engine are unaffected.
- **Why not have the client read the indexes itself?** The join needs the server's card data anyway, and one endpoint keeps the client simple.
- **The old endpoint.** `GET /api/get-unimplemented` stays until the client has switched. Each new route gets a `RouteAuthManifest` row.

**Client:**

- The Unimplemented page shows each preview set as a full grid of revealed cards with an implemented / not-implemented marker, a status filter, and progress such as "194 of 194 revealed, 150 implemented".
- Name search covers every card. Cards known only from swudb are searchable by title.
- Unimplemented cards from released sets keep their own section.
- `images-scripts/` is deleted once the port is signed off.

## 13. Alternative considered: the game node

The first version of this proposal ran the job on the game node, as a separate low-priority child process. We dropped it because Cloudflare already throttles some of the game node's swudb deck-list requests, and scanning from the same IP would make that worse. It would also have needed:

- a native image library in the server image, plus a Dockerfile change, because the image is built from a developer machine's `node_modules`,
- write access to the image bucket for the game node,
- CPU and memory safeguards on a 2 vCPU / 4 GiB task.

Its advantages were a "run now" button on our own site and no wait for the server to notice a change. Neither matters much with runs twice a day and GitHub's run button.

## 14. Infra and repo setup

- **forceteki-infra:**
  - the workflow,
  - in CDK, the GitHub OIDC provider (if the account doesn't have one yet) and the role from section 7,
  - in the repo settings (admins), the two environments (only `main` may deploy to them, admin bypass off) and the Discord webhook secret.
- **The `karabast-data` bucket:** turn on versioning, and add a lifecycle rule that deletes old versions after about 90 days.
- **forceteki:** exclude sharp's packages (`node_modules/sharp`, `node_modules/@img`) in `.dockerignore`, so the server image doesn't carry an unused native library. The server needs no new permissions.
- **Both repos:** confirm that `main` requires a reviewed PR. The workflow file lives in forceteki-infra, and the code it runs comes from forceteki.

## 15. Rollout

1. **Spike in forceteki-infra.** A throwaway workflow on a GitHub runner that:
   - calls `getAllSets` and `getSetInfo`,
   - requests a few images,
   - reports status codes and Cloudflare headers,
   - prints the OIDC subject GitHub issues.

   It confirms that the runners aren't challenged and pins down the trust-policy strings.
2. **Port and validation** (sections 5 and 11). The Python script is retired after sign-off.
3. **Versioning, AWS role, environments and workflow.** Turn on versioning, re-upload with labels, and build the indexes. Run the workflow in dry-run mode first.
4. **Endpoint and new page.** Switch the client over, then remove `get-unimplemented`.

## 16. Risks

| Risk | Mitigation |
|---|---|
| Cloudflare challenges or throttles GitHub's runners | Spike first; one listing call per set plus conditional image requests, twice a day; if blocked, run the tool by hand as today, with the indexes and new page still working |
| swudb changes or removes its API | Strict response validation; fall back to image probing; the run summary and Discord show it |
| swudb changes its image URLs | The run fails visibly; the tool is fixed and re-run |
| Someone runs the workflow without permission | Section 8: workflow in forceteki-infra, `main`-only environments, AWS trust pinned to them, named allowlist, optional second-admin sign-off |
| GitHub delays or drops a scheduled run | The next run catches up; runs are idempotent |
| A scheduled run overwrites a hand correction | Pinned cards are skipped |
| An index is wrong or corrupted | The server rejects it and keeps its last good copy; the next run rebuilds it; versioning can restore it |
| Two runs mix one card's files | `verify` finds it and a re-run fixes it; an optional lock can prevent it |
| The port changes image output | Side-by-side comparison and a dry run before cutover |

## 17. Decisions for the leads

1. Who goes on the manual-run allowlist?
2. Second-admin sign-off: turn it on now, or leave it available but off (suggested)?
3. Turn on S3 versioning for `karabast-data`? It can be suspended later but never fully removed.
4. Use swudb's undocumented API for discovery and names, with image probing as the fallback, or probe images only?
5. Which UTC times should the schedule use?
6. Rename the page, for example to "Card status"?
