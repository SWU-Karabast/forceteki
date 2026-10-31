import { StateWatcherName, SwuGameFormat } from '../../../../server/game/core/Constants';
import { save } from '../../../../server/game/core/stateSerialization/MatchSerializer';
import { loadAsync } from '../../../../server/game/core/stateSerialization/MatchLoader';
import { MatchLoadError } from '../../../../server/game/core/stateSerialization/MatchLoadError';
import { SaveIntegrityError } from '../../../../server/game/core/stateSerialization/SavedMatchInterfaces';
import type { ISavedMatch, ISavedStateWatcherSection } from '../../../../server/game/core/stateSerialization/SavedMatchInterfaces';
import { buildLoadConfig } from '../../../helpers/MatchLoaderHarness';
import { saveLoadSaveAsync } from '../../../helpers/SaveLoadHarness';

function leftPlayEntries(document: ISavedMatch) {
    const section = document.stateWatchers.find((watcher) => watcher.watcher === StateWatcherName.CardsLeftPlayThisPhase) as Extract<ISavedStateWatcherSection, { watcher: StateWatcherName.CardsLeftPlayThisPhase }>;
    return section?.entries ?? [];
}

/**
 * What the `v1` format does with the game shapes and watcher fields that arrived after it was written: the
 * game's format is recorded, a game the format cannot hold is refused by name, and the upgrades a
 * left-play entry records survive a save and load.
 */
describe('Save format representability', function() {
    integration(function(contextRef) {
        it('records the game format in settings', async function() {
            await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
            const { context } = contextRef;

            expect(save(context.game).settings.format).toBe(SwuGameFormat.Premier);
        });

        it('refuses a Faux Suns game, whose Plan and Blast counters have no saved position', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: { leader: 'luke-skywalker#faithful-friend', secondLeader: 'saw-gerrera#bring-down-the-empire' },
                player2: { leader: 'darth-vader#dark-lord-of-the-sith', secondLeader: 'director-krennic#aspiring-to-authority' },
            });
            const { context } = contextRef;

            expect(() => save(context.game)).toThrowMatching((error) => error instanceof SaveIntegrityError && (/fauxSuns/).test(error.message));
        });

        it('rejects a document whose settings.format is not a representable format', async function() {
            await contextRef.setupTestAsync({ phase: 'action', player1: {}, player2: {} });
            const { context } = contextRef;

            for (const format of ['notAFormat', SwuGameFormat.FauxSuns]) {
                const document = save(context.game);
                (document.settings as { format: string }).format = format;

                await expectAsync(loadAsync(document, buildLoadConfig(context))).toBeRejectedWithError(MatchLoadError, /settings\.format/);
            }
        });

        it('round-trips the upgrades a left-play entry recorded', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['entrenched'] }],
                },
                player2: {
                    hand: ['vanquish'],
                    resources: 10,
                },
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.wampa);
            expect(context.entrenched).toBeInZone('discard');

            const { before, engineOnlyFacts, saveAgain } = await saveLoadSaveAsync(context);
            expect(engineOnlyFacts).toEqual([]);

            const saved = leftPlayEntries(before).find((entry) => entry.card?.card === 'wampa');
            expect(saved.lastKnownInformation.upgrades).toEqual([jasmine.objectContaining({ card: 'entrenched', zone: 'discard' })]);

            const reSaved = leftPlayEntries(saveAgain()).find((entry) => entry.card?.card === 'wampa');
            expect(reSaved.lastKnownInformation.upgrades).toEqual(saved.lastKnownInformation.upgrades);
        });

        it('records a token upgrade at its outside-the-game position', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                },
                player2: {
                    hand: ['vanquish'],
                    resources: 10,
                },
            });
            const { context } = contextRef;

            context.player1.passAction();
            context.player2.clickCard(context.vanquish);
            context.player2.clickCard(context.wampa);

            const document = save(context.game);

            const saved = leftPlayEntries(document).find((entry) => entry.card?.card === 'wampa');
            expect(saved.lastKnownInformation.upgrades).toEqual([jasmine.objectContaining({ card: 'shield', zone: 'outsideTheGame' })]);
            expect(document.engineOnlyFacts).toEqual([]);
        });
    });
});
