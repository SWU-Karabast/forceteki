# GameServer Spectator Cleanup Mitigation Plan

## Problem summary

Investigation of memory retention above `Lobby` found a server-level cleanup gap around spectators:

- `GameServer` registers spectators in `userLobbyMap` via `POST /api/spectate-game`.
- `GameServer.removeLobby()` clears `userLobbyMap` entries for players, but not spectators.
- `GameServer.removeUserMaybeCleanupLobby()` removes a spectator from `Lobby.spectators`, but only tears down the lobby when `Lobby.isEmpty()` is true.
- `Lobby.isEmpty()` currently checks `users.length === 0`, which ignores spectators.

This creates two bad outcomes:

1. Stale spectator entries can remain in `GameServer.userLobbyMap` after a lobby is removed.
2. A spectator socket can continue to hold the removed lobby through registered listener closures until the socket is otherwise cleaned up.

## Goal

Make lobby teardown symmetric for players and spectators so that removing a lobby, disconnecting a spectator, or timing out a lobby always releases:

- `GameServer.lobbies` entry
- `GameServer.userLobbyMap` entries for all participants
- spectator and player socket listeners that point back into `Lobby`
- any remaining spectator/player socket references stored by the lobby

## Non-goals

- Reworking broader game object teardown inside `Game`
- Changing matchmaking behavior
- Changing spectate product behavior beyond cleanup correctness

## Recommended mitigation

### 1. Centralize participant cleanup in `GameServer`

Add a single teardown path in `GameServer` that is responsible for cleaning both:

- players in `lobby.users`
- spectators in `lobby.spectators`

That helper should:

- delete all related `userLobbyMap` entries
- optionally notify connected sockets with an error/reason
- remove socket listeners that point into the lobby before the lobby is discarded
- call `lobby.cleanLobby()` only after external mappings are removed

Rationale: cleanup is currently split across `removeLobby()` and `removeUserMaybeCleanupLobby()`, which makes player teardown more complete than spectator teardown.

### 2. Fix lobby emptiness semantics

`Lobby.isEmpty()` is currently player-only. That is risky because `GameServer.removeUserMaybeCleanupLobby()` treats it as a full lobby lifecycle signal.

Recommended options:

- Preferred: change `Lobby.isEmpty()` to mean "no players and no spectators remain"
- Alternative: keep `isEmpty()` player-only, but introduce a clearly named method such as `hasNoParticipants()` and use that for server teardown decisions

Preferred direction: use `hasNoParticipants()` or equivalent explicit naming if there is any chance other call sites rely on the current player-only meaning.

### 3. Ensure spectator disconnect cleanup removes server mappings

When a spectator disconnects and the disconnect timeout completes, the cleanup path should:

- remove the spectator from `Lobby.spectators`
- remove the spectator from `GameServer.userLobbyMap`
- clean up the lobby if no participants remain

This should happen even when players are still present, so a disconnected spectator cannot leave behind stale server metadata.

### 4. Make full lobby removal clean up spectator sockets too

When `GameServer.removeLobby()` runs, it should treat spectators as first-class participants:

- clear their `userLobbyMap` entries
- notify and/or disconnect their sockets consistently
- remove `lobby` event listeners registered for spectator sockets

This is important for failure paths such as:

- matchmaking failure
- lobby timeout
- explicit server-side lobby removal

## Proposed file changes

### `server/gamenode/GameServer.ts`

- Refactor `removeLobby()` to clean players and spectators
- Refactor `removeUserMaybeCleanupLobby()` to remove server mappings for spectators as well as players
- Reuse a shared helper instead of duplicating cleanup loops
- Keep the disconnect-timeout logic bounded as-is unless cleanup refactoring requires minor wiring changes

### `server/gamenode/Lobby.ts`

- Clarify emptiness/participant semantics
- If needed, add a helper for full participant absence
- Keep `cleanLobby()` as the final object-level cleanup step after `GameServer` has released its outer references

## Verification plan

Add or update tests that cover the retention-prone paths:

1. Spectator registers, lobby is removed:
   - spectator entry is removed from `userLobbyMap`
   - spectator socket no longer has lobby listener references

2. Spectator disconnects from an active lobby:
   - spectator is removed from `Lobby.spectators`
   - spectator entry is removed from `userLobbyMap`
   - lobby stays alive if players remain

3. Last remaining participant is a spectator and disconnects:
   - lobby is removed from `GameServer.lobbies`
   - cleanup runs without leaving stale mappings

4. Existing player removal flows still work:
   - player disconnect/removal still removes the lobby when appropriate
   - no regression in matchmaking cleanup

If practical, add one focused regression test around the exact bug:

- register spectator
- call the lobby removal path
- assert no server mapping for that spectator remains

## Risk notes

- Changing `isEmpty()` directly may subtly affect existing call sites if any code currently relies on "no players" rather than "no participants"
- Disconnecting spectator sockets during removal may have UX implications if the frontend expects a specific terminal event; preserve existing behavior where possible and only add symmetry

## Suggested implementation order

1. Add the shared cleanup helper in `GameServer`
2. Update `removeLobby()` to use it for players and spectators
3. Update `removeUserMaybeCleanupLobby()` so spectator cleanup removes server mappings too
4. Clarify/replace `Lobby.isEmpty()` semantics
5. Add regression tests for spectator removal and lobby teardown
6. Run relevant build/test checks

## Expected outcome

After the mitigation:

- lobby removal will not leave spectator metadata behind in `GameServer`
- spectator sockets will no longer be able to retain removed lobbies through stale listeners
- teardown behavior will be consistent across players and spectators
