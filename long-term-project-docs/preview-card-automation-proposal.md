# Preview card automation

**Status:** draft for lead review · **Date:** 2026-11-13 · **Repos:** forceteki, forceteki-client, forceteki-infra

## Summary

During preview season the Unimplemented page goes stale. It also lists only cards that are not implemented, so players can't tell "already implemented" apart from "not on the server yet". We propose:

1. **A scheduled GitHub Actions workflow, hosted in forceteki-infra.**
   - Every six hours, an update run first asks swudb whether any set has new cards. That is one request, and the run stops there unless something changed. When something did, it processes just the new cards.
   - Once a day at 4 AM US Eastern, a full run re-checks every image in each preview set and picks up localized images.
   - Both kinds of run upload our image variants to S3 with a few labels on each file, and keep a small index of each set up to date.

   Named people can also start a run by hand from GitHub.
2. **A card-status endpoint on the game server.** It reads each set's index when the page asks for it, checks the index before using it, and joins it with the server's card data. The page then shows every revealed card in a preview set as implemented or not implemented, with no deploy needed for new reveals.
3. **One image pipeline, in TypeScript.** `images-scripts/process_cards.py` (client repo) is ported into forceteki as a command-line tool that the workflow runs. Developers can still run it locally for manual corrections. The port is validated against the Python output, first against a local S3 and then in a second S3 bucket alongside production. Only then is the Python script retired.
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

- Newly revealed preview cards appear on the page within about six hours, without a deploy.
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
  - The tool lives in `scripts/cardImages/`, run with ts-node like `validate-cards`. It takes the Python script's options: `--set`, `--locales`, `--from` / `--to`, `--dry-run`, `--bucket`, `--tokens`, `--ffg-en-fallback`, `--strict-locales`, `--overwrite-downloads` and the tuning flags. A new S3 endpoint option lets it target a local S3 for testing (section 11).
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

**Keeping the index current.** Every run that writes images does this: an update run that found changes, a full run, or a local run. An update run that finds nothing new stops before it touches the index.

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

The workflow has two kinds of run.

**1. Update run: new cards only.** It runs every six hours, as two jobs. The first is a check that needs no AWS credentials, no forceteki checkout and no package install; a few lines of `curl` and `jq` do it. The second, the update job, runs only if the check finds a change.

The check:

1. Read the per-set counts saved by the last successful run from GitHub Actions' cache, a small file GitHub stores for the workflow. No S3 is involved.
2. Make one request to swudb's `getAllSets`, and compare each set's `previewedCount` with the saved value.
3. If nothing changed, stop. That costs one request to swudb, none to our bucket, and a few seconds of runner time.
4. If a count changed, or there are no saved counts, start the update job for the sets that changed.

The update job:

1. Load the index and catch it up (section 6).
2. Call `getSetInfo` to list the revealed cards, and compare the list with the index. If the response fails validation, probe numbers 1 to the scan limit instead.
3. Download and process only the new cards: four variants per language, English copies for languages without an FFG image, uploaded with labels, main file last. Existing images are not re-checked.
4. Catch up the index again, and save it if anything changed.
5. Save the new count only after every new card has been processed. If the job fails, or a card is listed before its image is up, the old count stays and the next update run retries.

The saved counts aren't a source of truth. If they're lost or wrong, the next check starts an update, or the next full run does the work and saves them again. The worst case is a reveal waiting until the next full run. GitHub only lets runs on `main` write the cache that scheduled runs read.

A count also rises when swudb adds a variant or a promo printing to any set. That starts an update job that finds nothing to do and just saves the new count.

**2. Full run.** It runs once a day, and for manual runs. For each preview set:

1. Load the index and catch it up (section 6).
2. Call `getSetInfo` to list the revealed cards, with the same fallback.
3. Re-check each revealed card's images with conditional GETs, using the versions recorded in the index. An unchanged image costs a 304; a new or changed one is downloaded. Pinned cards are skipped.
4. Process the changed cards, as in an update run.
5. Fetch the FFG index for each locale (a few paginated requests) and pick up newly published localized images.
6. Catch up the index again, save it if anything changed, and save the current counts for the update runs' checks.

Full runs don't depend on the saved counts, so they also catch what the checks can't see: an image swapped for a better one, a localized image from FFG, or a corrected name.

**Every run that writes** posts a summary of new, changed, failed and pinned cards to the run's page. It also posts failures to the existing Discord error channel, with the webhook stored as an environment secret.

**Manual runs** use `workflow_dispatch`. Its inputs are a fixed list of choices and booleans: sets, dry run, re-check all images, rebuild the index, restore. They are passed to the tool through environment variables, never pasted into shell commands, which guards against script injection.

**Schedule.**

- **Update runs** every six hours, at 00:37, 06:37, 12:37 and 18:37 UTC. In Eastern Standard Time that is 7:37 PM, 1:37 AM, 7:37 AM and 1:37 PM.
- **The full run** once a day at 09:07 UTC, which is 4:07 AM Eastern Standard Time.
- **Daylight saving.** GitHub's schedules are UTC-only and ignore daylight saving, so from March to November every run lands an hour later in Eastern time.
- **Delays.** GitHub can delay scheduled runs, and drop some under load, especially at the start of every hour; hence the odd minutes. A late or dropped run is caught up by the next one.
- **Keepalive.** In a public repository, GitHub switches scheduled workflows off after 60 days without repository activity, and forceteki-infra changes rarely. The workflow therefore includes a step that keeps itself enabled through GitHub's API. The spike confirms this works.

**Request budget.**

- A quiet day costs swudb four small API calls from the update runs' checks, plus the full run.
- The full run makes two or three API calls plus one conditional request per revealed card image, about 200 for a full set.
- An update job adds one API call plus the new images, and only when something was revealed.
- All requests go out at low concurrency, with a User-Agent that names Karabast.
- Our bucket is touched only by update jobs, full runs and local runs.

**One write at a time.** Update jobs and full runs share one concurrency group with `cancel-in-progress: false`. At most one runs and one waits, and a newer queued run replaces the waiting one. An update cancelled this way is retried by the next update run, because its count was never saved. The check writes nothing, so it stays outside the group.

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
   - Scheduled update and full runs use `card-images-scheduled`, and manual runs use `card-images-manual`. The workflow picks one by event type. The update runs' check needs no credentials and uses neither.
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

Testing moves through three places, in order: a local S3 in Docker, a second S3 bucket in our AWS account, then production. The tool's bucket and S3 endpoint options let the same code target any of them. The port replaces the Python script only after every check below passes.

**Stage 1: local S3 in Docker.** All development and automated tests run against a local S3 container. The client repo already runs Adobe's S3Mock this way on port 9090 for cosmetics work, and `scripts/syncS3.ts` already talks to it; forceteki's `docker-compose.yml` gets the same service. If the mock lacks an S3 feature the tool relies on, such as versioning for `restore` or conditional writes for the optional lock, that part is tested in stage 2 instead.

1. **Behavior inventory.** Every Python behavior in section 5 becomes a named unit or integration test: per-set special cases, file naming, FFG filtering and face swap, fallback rules, the upload check, retries, token mode and the strict-locales exit codes.
2. **Side-by-side comparison.** Run both pipelines on the same downloaded inputs for TWI, IBH, TS26, HMW and the current preview set, in every locale. Require:
   - the same output paths,
   - the same image dimensions,
   - visual similarity above an agreed threshold (for example SSIM of at least 0.99), plus side-by-side sheets for a human pass.
3. **Discovery parity.** For the same sets, the swudb API and image probing must find the same cards and faces.
4. **Index parity.** After a scripted sequence of runs (new cards, updated images, pins, a run stopped partway, two overlapping runs), the index each run maintains must equal a full rebuild from the images.

**Stage 2: a second bucket in our AWS account,** for example `karabast-data-staging`. It is set up like production: public-read, with versioning on. The Python script keeps owning production throughout.

1. **Full upload.** Upload every set into the second bucket with the new tool, as the cutover will.
2. **Bucket against bucket.** Compare the second bucket with production file by file:
   - every production key exists in the second bucket,
   - it has the same dimensions and passes the similarity check,
   - every file carries its labels.

   Side-by-side sheets go to a human pass.
3. **The workflow on its real schedule.** Point the workflow at the second bucket for a few days. Update runs, the full run, pins, `verify` and `restore` all run for real.
4. **The site against the second bucket.** A dev server and a dev build of the client read the indexes and images from the second bucket. This needs the client's image base URL to become configurable; today it is hardcoded in `s3Utils.ts`.

**Stage 3: production.**

1. **Dry run against production.** Run `--to check-exists` against the live bucket for every set. The plan should contain only re-encoded images: no new or missing keys and no header changes. That shows the key layout and header logic match.
2. **Cutover.**
   - Turn on versioning, then re-upload every set with the new tool. Every file is re-encoded anyway, and this gives every file its labels.
   - Build the indexes for the current preview sets.
   - Point the workflow at production, in dry-run mode for a few days, then let it write.
   - The re-encoded images look the same, so no cache bust is needed.

After cutover we suggest keeping the second bucket for testing future pipeline changes. It holds copies of public images, a couple of gigabytes, so it costs little.

On the server side, the index fetching, the checks and the endpoint are tested with the existing harness: virtual clock, `FakeHttpClient` in place of S3, and the fake DB.

## 12. Server and client changes

**The server reads indexes on demand.** It keeps its copy of each index in memory. When the page asks for card status and that copy is more than an hour old, it re-fetches each preview set's index from its public URL with `If-None-Match`. The page is therefore at most an hour behind the latest run.

- An unchanged index costs a 304 of a few hundred bytes.
- When nobody opens the page, there is no traffic at all.
- No polling, and no AWS credentials on the server.
- The index location is configurable, so a dev server can read the second test bucket (section 11).

**Before using an index, the server checks it:**

- the format matches,
- the set code matches,
- card numbers are unique and in range,
- it lists no fewer cards than the last good copy, since the pipeline never deletes images, unless the run that built it was explicitly told to allow removals.

A valid index replaces the server's copy. An invalid one is ignored: the server keeps its last good copy and posts one Discord alert per bad version to the existing error channel.

Fargate keeps nothing across restarts. If the index is bad when the server starts, the page shows only the cards the server has data for until it's fixed. If we want the last good copy to survive restarts, the server could keep it in DynamoDB, as the only writer, storing only checked data. We suggest starting without that.

**The new public endpoint** (name to be agreed) sends only what the page uses. Every set is a group. A preview set lists all its revealed cards; a released set lists only its unimplemented cards.

```
GET /api/card-status
{
  "sets": [
    { "set": "IC27", "preview": true, "cardCount": 194, "cards": [
        { "number": 22, "name": "Moff Gideon, Cold Calling" },
        { "number": 38, "name": "Admiral Holdo, We Are The Spark", "implemented": true },
        { "number": 25, "name": "…", "implemented": true, "landscape": true }
    ] },
    { "set": "SOR", "cards": [ { "number": 12, "name": "…" } ] }
  ]
}
```

The values above are illustrative.

| Field | What the page uses it for |
|---|---|
| `set` (per set) | Image URLs and the set filter |
| `preview` (per set) | Which sets show a full grid; sent only when true |
| `cardCount` (per set) | The "of 194" in the progress line; left out when swudb doesn't publish it, as for HMW |
| `number` | Image URLs and sorting; set plus number also identifies each card in the rendered list |
| `name` | Name search: the server's title and subtitle, or swudb's title for cards the server has no data for |
| `implemented` | The status marker and the implemented / not-implemented filter; sent only when true |
| `landscape` | Shows bases as landscape tiles, in the grid and the hover preview; sent only when true |

- **Size.** About 55–60 bytes per card, or roughly 12 KB for a 200-card set. The game server doesn't compress HTTP responses, so that is what goes over the wire. A repeat visit with unchanged data gets a 304, because Express adds an ETag by default.
- **Counts** such as "150 implemented" are computed by the client from the list.
- **The join.** Index entry, then `_setCodeMap.json` (`SET_NNN` to card id), then the card data in `DeckValidator`. This already handles reprints and duplicate numbers within a set. A mock card without an image yet is still listed.
- **Image-only cards never enter card data,** so deck validation and the engine are unaffected.
- **Why not have the client read the indexes itself?** The join needs the server's card data anyway, and one endpoint keeps the client simple.
- **The old endpoint.** `GET /api/get-unimplemented` stays until the client has switched. Each new route gets a `RouteAuthManifest` row.

**Client:**

- The Unimplemented page shows each preview set as a full grid of revealed cards with an implemented / not-implemented marker, and progress such as "194 of 194 revealed, 150 implemented".
- A filter shows all cards, only implemented cards, or only unimplemented cards.
- Name search covers every card. Cards known only from swudb are searchable by title.
- Unimplemented cards from released sets keep their own section.
- The card image base URL, hardcoded in `s3Utils.ts` today, becomes configurable, so a dev build can show the second test bucket.
- `images-scripts/` is deleted once the port is signed off.

## 13. Alternative considered: the game node

The first version of this proposal ran the job on the game node, as a separate low-priority child process. We dropped it because Cloudflare already throttles some of the game node's swudb deck-list requests, and scanning from the same IP would make that worse. It would also have needed:

- a native image library in the server image, plus a Dockerfile change, because the image is built from a developer machine's `node_modules`,
- write access to the image bucket for the game node,
- CPU and memory safeguards on a 2 vCPU / 4 GiB task.

Its advantages were a "run now" button on our own site and no wait for the server to notice a change. Neither matters much with update runs every six hours and GitHub's run button.

## 14. Infra and repo setup

- **forceteki-infra:**
  - the workflow,
  - in CDK, the GitHub OIDC provider (if the account doesn't have one yet) and the role from section 7,
  - in the repo settings (admins), the two environments (only `main` may deploy to them, admin bypass off) and the Discord webhook secret.
- **The `karabast-data` bucket:** turn on versioning, and add a lifecycle rule that deletes old versions after about 90 days.
- **A second bucket** for stage 2 testing (section 11), set up like production: public-read, with versioning on. While testing, the workflow's role gets the same permissions on it as on `karabast-data`.
- **forceteki:** add the S3 mock service to `docker-compose.yml`, and exclude sharp's packages (`node_modules/sharp`, `node_modules/@img`) in `.dockerignore`, so the server image doesn't carry an unused native library. The server needs no new permissions.
- **Both repos:** confirm that `main` requires a reviewed PR. The workflow file lives in forceteki-infra, and the code it runs comes from forceteki.

## 15. Rollout

1. **Spike in forceteki-infra.** A throwaway workflow on a GitHub runner that:
   - calls `getAllSets` and `getSetInfo`,
   - requests a few images,
   - reports status codes and Cloudflare headers,
   - prints the OIDC subject GitHub issues,
   - saves and restores a value in the Actions cache,
   - re-enables itself through GitHub's API.

   It confirms that the runners aren't challenged and pins down the trust-policy strings. It also checks the two things the update runs' check and the keepalive depend on.
2. **Port, tested against local S3** (section 5, and section 11 stage 1).
3. **Second bucket** (section 11, stage 2). Create the bucket, set up the AWS role, environments and workflow against it, then run the comparison and a few days on the real schedule. The endpoint and new page can be built against it at the same time.
4. **Production cutover** (section 11, stage 3). Turn on versioning, re-upload with labels, build the indexes, and point the workflow at production, dry-run first. The Python script is retired after sign-off.
5. **Switch the client** to the new page, then remove `get-unimplemented`.

## 16. Risks

| Risk | Mitigation |
|---|---|
| Cloudflare challenges or throttles GitHub's runners | Spike first. Update runs start with one small API call and stop there unless something changed; the only full re-check is the daily full run. If blocked, run the tool by hand as today; the indexes and the new page still work |
| swudb changes or removes its API | Strict response validation; fall back to image probing; the run summary and Discord show it |
| swudb changes its image URLs | The run fails visibly; the tool is fixed and re-run |
| Someone runs the workflow without permission | Section 8: workflow in forceteki-infra, `main`-only environments, AWS trust pinned to them, named allowlist, optional second-admin sign-off |
| GitHub delays or drops a scheduled run | The next run catches up; runs are idempotent |
| GitHub switches the schedule off after 60 days without activity in forceteki-infra | The workflow keeps itself enabled through GitHub's API; the spike confirms this |
| An update run's check misses a change: a swapped image, a new translation, or lost saved counts | The daily full run doesn't depend on the check |
| A scheduled run overwrites a hand correction | Pinned cards are skipped |
| An index is wrong or corrupted | The server rejects it and keeps its last good copy; the next run rebuilds it; versioning can restore it |
| Two runs mix one card's files | `verify` finds it and a re-run fixes it; an optional lock can prevent it |
| The port changes image output | A local side-by-side comparison, a full trial in a second bucket, and a dry run against production before cutover |

## 17. Decisions for the leads

1. Who goes on the manual-run allowlist?
2. Second-admin sign-off: turn it on now, or leave it available but off (suggested)?
3. Turn on S3 versioning for `karabast-data`? It can be suspended later but never fully removed.
4. Use swudb's undocumented API for discovery and names, with image probing as the fallback, or probe images only?
5. Rename the page, for example to "Card status"?
