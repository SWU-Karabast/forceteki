# The client contract: what captured states cover, and what's left

The game-node test suite plan (`long-term-project-docs/game-node-test-suite.md`, topic area 3, *Protocol surface*)
wants a guard on the contract between forceteki and forceteki-client. A change on one side that the other relies on
should fail CI, not production. Captured states (forceteki #3072, forceteki-client #872) already do this for the game
board. This note sets out what they cover, what they don't, and what extending them could look like, so we can decide
whether the test-suite plan builds on them rather than keeping its own list.

## What captured states cover today

- **Game states, server to client.** Render boards and control chains are exactly what `game.getState(id)` returns.
  That is what `Lobby` sends on the `gamestate` event, apart from the chat the captures leave out by design.
- **Game messages, client to server, for the prompts that have a chain.** Each step's `send` records the `game` messages
  the click produced. The client's `Attack` test checks that the board sends exactly those messages.
- **Server changes.** `capture-states --check` forces anyone who changes `getState` or a recorded message to regenerate
  the captures.
- **Client changes.** The client's `tests` job runs against the backend PR named in the description, or against
  backend `main` when no PR is named.

## The gap

| What the client relies on | Covered? | A break that gets through today |
|---|---|---|
| The 14 commands on the `lobby` socket event (`setReadyStatus`, `updateDeck`, `requestRematch`, `rematch`, `submitReport`, …) | No. Captures record only `game` messages, and the client harness records only `sendGameMessage`. | The server renames `requestRematch`. The client's rematch button then does nothing: the server drops a lobby command it doesn't know, and no test fails. |
| The other client events (`requeue`, `manualDisconnect`) | No | The server stops listening for `requeue`. "Find another match" silently stops working. |
| Game commands outside a captured prompt (`concede`, `rollbackToSnapshot`, `toggleOptionSetting`, `perCardMenuButton`, `statefulPromptResults`) and `chat` | Only once a chain exercises them. Chat is left out by design. | A rename of `toggleOptionSetting` passes both sides' CI. |
| Server events other than `gamestate`: `lobbystate`, `connection_error`, `queueHeartbeat`, `retransmitResponse`, `statsSubmitNotification`, `bugReportResult`, `playerReportResult`, `requestScreenResolution`, `matchmakingFailed` | No | A field the lobby or setup screen reads disappears from `lobbystate`, for example `connectionLink` or `winHistory`. |
| HTTP: the bodies the client sends and the responses it branches on. Sign-in first: `get-user` returning 401 with `code` `ACCOUNT_NOT_FOUND`, `EMAIL_NOT_VERIFIED` or `SIGN_IN_AGAIN`, then `create-user`. Then the lobby, queue and deck routes. | No | A renamed error `code` sends new players to the wrong screen. Both #3111/#875 and #3168/#892 changed this sequence on both sides by hand. |
| The socket handshake: the `auth.token` claims (including `emailVerified`), and `query.user`, `query.lobby` and `query.spectator` | No | The server starts requiring a claim the client doesn't put in the token. |

Even for what *is* covered, a server PR that breaks the client passes the server's CI, because the check passes after
`--update`. The break shows up only when a client run uses that backend: a paired client PR, or the next client PR
after the backend merges. #3072 says as much: "Telling the client when snapshots change is left to later checks."

## What would cover it

These follow the captured-states pattern, with the server publishing and the client testing. Roughly in order of
value:

1. **Record every client message, not just `game` ones.** Capture chains could also run through the real `Lobby`, using
   the game node's server harness (`serverIntegration` and `TestClient`, which already send every lobby command the way
   the client does).
   - A step would be any event the participant receives (`lobbystate`, `gamestate`, `queueHeartbeat`, …).
   - Its `send` would be `[event, ...args]` for every event the participant emits (`lobby`, `game`, `requeue`,
     `manualDisconnect`).
   - On the client, the harness would record `sendLobbyMessage` and `sendMessage` as well as `sendGameMessage`, and
     lobby-screen tests would run against these chains.
2. **Capture the payloads of the other server events,** like render captures. `lobbystate` matters most, then the
   queue heartbeat and the report results.
3. **Record HTTP exchanges** for the routes the client calls, starting with the sign-in sequence: each request and
   response, normalised the same way. The client would test its fetch layer against them, answering with the recorded
   response and checking that its request matches.
4. **Publish a protocol manifest** from the server, a file in the captures directory checked by `--check`. It would list:
   - the socket events the server listens for;
   - the commands each channel accepts, generated from `Lobby`'s allowlists (the test-suite plan exports these in its
     next step, so `RecordedCommands` can stop being a copy);
   - the error codes the API returns;
   - the handshake fields.

   The client's CI would then check that every name it uses is in the manifest. That needs the client to keep those
   names in one place, as constants a test can list.
5. **Catch it on the server side too.** Either:
   - a forceteki CI job that runs the client's tests against the server PR's captures (check out client `main` and use
     `npm run states -- --local`); or
   - at least a job that reports changed captures to the client repo.

   Without this, the guard catches a break only on the client side, and later.

## What the test-suite plan does meanwhile

Until captures cover these surfaces, the plan's fallback is a hand-kept list in forceteki of what the client relies
on, checked by a server spec. It's simple, but it depends on people remembering to update it. Building on captured
states instead (items 1, 2 and 4 above) would replace that list.

Questions for you:
- Would you prefer to extend captured states this way?
- Is any of it already planned?
- Should the test-suite plan wait for it, or use the hand-kept list in the meantime?
