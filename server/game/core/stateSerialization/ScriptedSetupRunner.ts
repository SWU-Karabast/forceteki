import type { Game } from '../Game';
import type { Player } from '../Player';
import { PhaseName } from '../Constants';
import { PromptType } from '../gameSteps/PromptInterfaces';
import { MulliganPrompt } from '../gameSteps/prompts/MulliganPrompt';
import { ResourcePrompt } from '../gameSteps/prompts/ResourcePrompt';
import { Contract } from '../utils/Contract';

/**
 * Engine-side driver for the three setup-phase prompts (initiative, mulligan, resource), answering them
 * through the same public entry points the client uses (`Game.cardClicked`, `Game.menuButton`,
 * `Game.continue`). Identifies each prompt by engine prompt type — never by `menuTitle`/`promptTitle`
 * text — so a card-text or client-copy change cannot silently break it.
 *
 * `test/helpers/GameFlowWrapper.js` delegates its setup-phase helpers to these functions; `P2-C2`'s
 * loader will call `runSetupPhase` directly against a headless game.
 */

/**
 * Identifies the initiative `HandlerMenuPrompt` by `PromptType.Initiative` — it has no dedicated prompt
 * class, unlike `MulliganPrompt`/`ResourcePrompt` below. Exactly one player is active for it
 * (`HandlerMenuPrompt.activeCondition` is `player === this.player`), so this also finds that player.
 */
function findInitiativePromptPlayer(game: Game): Player {
    const candidates = game.getPlayers().filter((player) => player.currentPrompt().promptType === PromptType.Initiative);

    Contract.assertArraySize(candidates, 1, 'Expected exactly one player to have an open initiative prompt');

    return candidates[0];
}

/**
 * Answers the initiative-choice prompt so that `desiredInitiativePlayer` ends up with initiative.
 *
 * Choice index `0` means "the prompted player takes initiative" and choice index `1` means "the
 * prompted player's opponent takes initiative" — a positional contract with `SetupPhase.chooseFirstPlayer`
 * (`choices: ['Yourself', 'Opponent']`). A reordering there would otherwise silently invert every loaded
 * game's initiative, so the post-click assertion below converts that into a loud failure instead.
 */
export function answerInitiativePrompt(game: Game, desiredInitiativePlayer: Player): void {
    Contract.assertEqual(game.currentPhase, PhaseName.Setup, 'Cannot answer the initiative prompt outside the setup phase');

    const promptedPlayer = findInitiativePromptPlayer(game);
    const prompt = game.getCurrentOpenPrompt();
    Contract.assertNotNullLike(prompt, 'Expected an open prompt while answering the initiative prompt');

    const choiceIndex = promptedPlayer === desiredInitiativePlayer ? 0 : 1;

    game.menuButton(promptedPlayer.id, choiceIndex, prompt.uuid, 'menuButton');
    game.continue();

    Contract.assertEqual(
        game.initiativePlayer,
        desiredInitiativePlayer,
        `Expected ${desiredInitiativePlayer.name} to have initiative after answering the initiative prompt, but ${game.initiativePlayer?.name ?? 'nobody'} does`
    );
}

/**
 * Answers the mulligan prompt for every player still active for it, in initiative order, with the same
 * `'mulligan'` / `'keep'` button args `MulliganPrompt` has always used.
 */
export function answerMulliganPrompts(game: Game, decision: 'mulligan' | 'keep' = 'keep'): void {
    const prompt = game.getCurrentOpenPrompt();
    if (!(prompt instanceof MulliganPrompt)) {
        return;
    }

    for (const player of game.getPlayersInInitiativeOrder()) {
        if (prompt.activeCondition(player)) {
            game.menuButton(player.id, decision, prompt.uuid, 'menuButton');
            game.continue();
        }
    }
}

/**
 * Answers the resource-selection prompt for every player still active for it, in initiative order:
 * selects `cardsPerPlayer` cards from hand via `cardClicked`, then clicks the `'done'` button.
 */
export function answerResourcePrompts(game: Game, cardsPerPlayer = 2): void {
    const prompt = game.getCurrentOpenPrompt();
    if (!(prompt instanceof ResourcePrompt)) {
        return;
    }

    for (const player of game.getPlayersInInitiativeOrder()) {
        if (!prompt.activeCondition(player)) {
            continue;
        }

        const selectableCards = player.promptState.selectableCards;
        Contract.assertTrue(
            selectableCards.length >= cardsPerPlayer,
            `Expected at least ${cardsPerPlayer} selectable cards for ${player.name}'s resource step, found ${selectableCards.length}`
        );

        for (let i = 0; i < cardsPerPlayer; i++) {
            game.cardClicked(player.id, selectableCards[i].uuid);
        }
        game.continue();

        game.menuButton(player.id, 'done', prompt.uuid, 'menuButton');
        game.continue();
    }

    // Matches the trailing `this.game.continue()` `GameFlowWrapper.resourceAnyTwo` performs once both
    // players have finished resourcing.
    game.continue();
}

export interface IRunSetupPhaseOptions {
    initiativePlayer: Player;
    cardsPerPlayer?: number;
}

/**
 * Drives the setup phase to completion: initiative, mulligan (default: keep), then resourcing.
 */
export function runSetupPhase(game: Game, options: IRunSetupPhaseOptions): void {
    Contract.assertEqual(game.currentPhase, PhaseName.Setup, 'Cannot run the setup phase driver outside the setup phase');

    const cardsPerPlayer = options.cardsPerPlayer ?? 2;

    // Captured before resourcing runs, not assumed to be `0`: a caller may have pre-loaded resources
    // (e.g. a test scenario's declared starting resource count) before invoking this driver, so the
    // post-condition below checks the *gain* from this call, not an absolute count.
    const resourceCountsBeforeResourcing = new Map(game.getPlayers().map((player) => [player, player.resourceZone.count] as const));

    answerInitiativePrompt(game, options.initiativePlayer);
    answerMulliganPrompts(game, 'keep');
    answerResourcePrompts(game, cardsPerPlayer);

    // `answerResourcePrompts` returns silently (no-op) if the open prompt is not a `ResourcePrompt`, and
    // `ResourcePrompt.menuCommand` itself returns `false` silently when a player hasn't selected enough
    // cards — the ported test helper this replaced was loud in both cases (`clickDone` threw when the
    // done button was missing or disabled). This asserts the observable result of a successful setup
    // pass instead: every player gained exactly `cardsPerPlayer` resources from this call, which only
    // holds if the resource prompt was actually found and actually completed for each of them.
    for (const player of game.getPlayers()) {
        const countBefore = resourceCountsBeforeResourcing.get(player);
        Contract.assertEqual(
            player.resourceZone.count,
            countBefore + cardsPerPlayer,
            `Expected ${player.name} to gain exactly ${cardsPerPlayer} resources during the setup phase driver, but went from ${countBefore} to ${player.resourceZone.count}. The setup phase may not have completed (e.g. the resource prompt was never found, or a player did not select enough cards).`
        );
    }
}
