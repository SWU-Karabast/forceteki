# @swupgn/format

SWU-PGN is a plain-text format for recording one game of Star Wars: Unlimited. A file holds a
header, both decks, a card index, and an ordered stream of JSON records that create, change and
remove the things on the board. A reader rebuilds the board at any step by applying the records,
with no rules engine and no card database.

One game can be written three ways: a `full` file (everything), a perspective file per seat
(only what that seat could know), and a `public` file (only what was shown to everyone). This
package holds the specification ([SPEC.md](SPEC.md)), the JSON schema, the registries, the
conformance vectors and a TypeScript SDK.

This is version 0.1 and it is experimental: any 0.x release may change anything. The format
freezes at 2.0, not 1.0 (see [SPEC.md, Status](SPEC.md#status-of-this-document)).

## Install

```sh
npm install @swupgn/format
```

The package ships ESM and CommonJS builds with types.

## Entry points

| Import | Exports | Notes |
|---|---|---|
| `@swupgn/format` | `parse`, `serialize`, `apply`, `applyRecord`, `emptyBoard`, `boardAt`, `cloneBoard`, `render`, the registries (`ATTRIBUTES`, `ZONES`, `RELATIONS`, `BLOCK_KINDS`, `ERROR_CODES`, `attributeClass`), `SwuPgnError`, types | Browser-safe: no Node built-ins, no `ajv`. |
| `@swupgn/format/writer` | `serialize`, `diff`, `redact` (and the `View` type) | What a platform that writes files needs. |
| `@swupgn/format/validate` | `validate` | The only entry that loads `ajv`. |

The data files are exported too: `@swupgn/format/schema/swupgn.schema.json`,
`@swupgn/format/registry/<name>.json` and `@swupgn/format/vectors/<file>` (for example
`vectors/manifest.json`).

## Reading a file

```ts
import { parse, boardAt, render } from '@swupgn/format';

const file = parse(text);              // throws SwuPgnError on a fatal problem
const board = boardAt(file, 12);       // the board after step 12
console.log(board.entities['p1']);     // players, the game, and every card/token by id
console.log(render(file));             // a readable story of the game
```

A board maps entity ids to entities, each with a zone, owner, attributes and so on
([SPEC §7](SPEC.md#7-entities-and-the-board), [§9](SPEC.md#9-applying)). To check a file before
trusting it, use `validate(text)` from `@swupgn/format/validate`; it returns a level
(`malformed`, `well-formed`, `valid`) and a list of issues
([§21](SPEC.md#21-error-model)).

## Writing a file

1. Keep a full `Board` for every decision your game takes (`emptyBoard()` and `cloneBoard()` help).
2. `diff(prev, next)` gives the `create`, `set` and `remove` records between two boards.
3. Add the `step` records and blocks, build a `SwuPgnFile`, and write it with `serialize`.
4. Run `redact(file, 1)`, `redact(file, 2)` and `redact(file, 'public')` on the `full` file to get
   the other three, and serialize each.

Three rules writers get wrong:

- **Record transient entities yourself.** `diff` compares decision boards, so it cannot see an
  entity created and removed inside one step (a drawn-then-discarded card, a token created and
  defeated in one action). The writer must still write that `create` and `remove`
  ([W-37](SPEC.md#82-order-and-steps)).
- **Blocks follow their kind's contract and are complete.** Each block kind has a field contract
  ([§13](SPEC.md#13-narrative-blocks-and-story), `registry/blockKinds.json`). A writer that
  writes any blocks must write one for every occurrence of every registered kind
  ([W-65](SPEC.md#132-block-kinds)), or may write none.
- **Hosts serve players only their own perspective file.** Never serve a player the `full` file
  or the other seat's file during a game. The host rules are H-01, H-02, H-03 and H-05 in
  [§10.1](SPEC.md#101-the-visibility-header) and H-04 (keyed player ids) in
  [§16.1](SPEC.md#161-identifying-data). Redaction is why serving perspective files is safe; see
  [§11](SPEC.md#11-redaction) and [§16](SPEC.md#16-privacy-considerations).

`redact` throws `not-full` if given a file that is not `full`.

## Conformance

`vectors/` is the conformance suite and `vectors/manifest.json` lists it
([SPEC §19](SPEC.md#19-conformance-suite)). Each positive vector has a file per profile
(`N.full.swupgn`, `N.p1.swupgn`, `N.p2.swupgn`, `N.public.swupgn`) and a `board.json` for each.
Negative vectors under `vectors/negative/` name the code and line they must produce.

Your writer passes when:

- `validate` says `valid` for every file it writes, and
- `redact` of your `full` file reproduces your perspective files byte for byte.

Your reader or implementation of the SDK surface passes when every positive file parses, the
board at its last step equals its `board.json`, and every negative file reports its code at its
line.

A platform may contribute a real game as a vector, with no identifying data
([SPEC §16](SPEC.md#16-privacy-considerations)).

## Versioning

The `Game` tag carries `SWU-PGN/<major>.<minor>`. While the major is 0 a minor release may
change anything, and a reader reports `newer-minor` for a file newer than itself. The freeze
is 2.0. Files of the earlier 1.0 pilot format are not readable as 0.1
([SPEC Appendix C](SPEC.md#appendix-c-legacy-10-pilot-files-informative)).

## Proposing a registry entry

Attributes, zones, relations, block kinds and set codes live in `registry/*.json`, and the tables
in SPEC.md are generated from them (`npm run generate`). A new row needs no new version. Open a
pull request that adds the row to the registry file, regenerates the tables, and says which
rules text (CR) it records ([SPEC §22](SPEC.md#22-registries)). Use an `x_` prefix for private
extensions until a row is accepted ([§17.2](SPEC.md#172-extensions)). An extension may hold
anything in a `full` file, but `redact` drops every extension header tag and unregistered
attribute, so it never reaches a perspective or `public` file
([W-67](SPEC.md#172-extensions)). A value a perspective file needs has to be registered.

## License

MIT
