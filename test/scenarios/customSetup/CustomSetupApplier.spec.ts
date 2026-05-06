import GameStateBuilder from '../../helpers/GameStateBuilder';
import GameFlowWrapper from '../../helpers/GameFlowWrapper';
import { UndoMode } from '../../../server/game/core/snapshot/SnapshotManager';
import { CustomSetupValidationFailure } from '../../../server/game/core/customSetup/CustomSetupTypes';

const builder = new GameStateBuilder();

/**
 * Minimal router stub. Game's constructor asserts router is non-null and the
 * engine may invoke handleError on internal failures — re-throwing surfaces
 * those instead of swallowing. The other callbacks aren't reached on the
 * applier path under test, so they're no-ops.
 */
function makeRouter() {
    return {
        gameWon: () => undefined,
        playerLeft: () => undefined,
        handleError: (_game: unknown, error: Error) => {
            throw error;
        },
        handleGameEnd: () => undefined,
        handleUndoGameEnd: () => undefined,
    };
}

interface CustomSetupTestOptions {
    phase?: 'action';
    player1?: any;
    player2?: any;
}

/**
 * Builds a Game that goes through the production CustomSetupApplier path.
 *
 * The test framework's `setupTestAsync` (used by other scenarios) constructs
 * the same shape of options but applies them via `setupGameStateAsync` —
 * which manually moves cards via PlayerInteractionWrapper helpers. Here we
 * pass the options as `customSetupState` in the GameConfiguration so that
 * `Game.initialiseAsync` invokes the production applier instead.
 *
 * Both paths consume the same JSON shape, so these tests double as a
 * regression check that the production applier produces the same result.
 */
async function setupCustomGameAsync(options: CustomSetupTestOptions) {
    const optionsForBuilder: any = {
        phase: options.phase ?? 'action',
        player1: { ...(options.player1 ?? {}) },
        player2: { ...(options.player2 ?? {}) },
    };

    const player1OwnedCards = builder.deckBuilder.getOwnedCards(1, optionsForBuilder.player1, optionsForBuilder.player2);
    const player2OwnedCards = builder.deckBuilder.getOwnedCards(2, optionsForBuilder.player2, optionsForBuilder.player1);

    const [deck1] = builder.deckBuilder.customDeck(1, player1OwnedCards, optionsForBuilder.phase);
    const [deck2] = builder.deckBuilder.customDeck(2, player2OwnedCards, optionsForBuilder.phase);

    // Give the production applier the cleanest possible JSON: only the keys
    // the applier knows about. The DeckBuilder mutates its inputs (e.g. pads
    // the deck list), so we don't share that object with the applier.
    const customSetupState: any = {
        phase: options.phase ?? 'action',
        player1: { ...(options.player1 ?? {}) },
        player2: { ...(options.player2 ?? {}) },
    };

    const wrapper = new GameFlowWrapper(
        builder.cardDataGetter,
        makeRouter(),
        { id: '111', username: 'player1' },
        { id: '222', username: 'player2' },
        UndoMode.Disabled,
        customSetupState,
    );

    wrapper.player1.selectDeck(deck1);
    wrapper.player2.selectDeck(deck2);

    // Token data is already initialised by Game's constructor (it pulls from
    // cardDataGetter.tokenData), so no explicit initialiseTokens call here.

    await wrapper.startGameAsync();

    return wrapper;
}

describe('CustomSetupApplier', function () {
    it('places named cards in each player\'s hand zone', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: { hand: ['porg'] },
            player2: { hand: ['rebel-pathfinder'] },
        });

        expect(wrapper.player1.player.hand.length).toBe(1);
        expect(wrapper.player1.player.hand[0].internalName).toBe('porg');
        expect(wrapper.player2.player.hand.length).toBe(1);
        expect(wrapper.player2.player.hand[0].internalName).toBe('rebel-pathfinder');
    });

    it('places multiple copies of the same card when the deck has them', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: { hand: ['porg', 'porg'] },
            player2: {},
        });

        const handNames = wrapper.player1.player.hand.map((c: { internalName: string }) => c.internalName);
        expect(handNames).toEqual(['porg', 'porg']);
    });

    it('places units in groundArena with damage and exhausted state', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: {
                groundArena: [{ card: 'battlefield-marine', damage: 1, exhausted: true }],
            },
            player2: {},
        });

        const arena = wrapper.player1.player.getArenaCards();
        expect(arena.length).toBe(1);
        expect(arena[0].internalName).toBe('battlefield-marine');
        expect((arena[0] as unknown as { damage: number }).damage).toBe(1);
        expect((arena[0] as unknown as { exhausted: boolean }).exhausted).toBe(true);
    });

    it('places units in spaceArena', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: {
                spaceArena: ['cartel-spacer'],
            },
            player2: {},
        });

        const arena = wrapper.player1.player.getArenaCards();
        expect(arena.length).toBe(1);
        expect(arena[0].internalName).toBe('cartel-spacer');
        expect(arena[0].zoneName).toBe('spaceArena');
    });

    it('attaches a token upgrade (shield) to an arena unit', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: {
                groundArena: [{ card: 'battlefield-marine', upgrades: ['shield'] }],
            },
            player2: {},
        });

        const arenaCards = wrapper.player1.player.getArenaCards();
        const marines = arenaCards.filter((c: { internalName: string }) => c.internalName === 'battlefield-marine');
        expect(marines.length).toBe(1);

        // The shield should be an upgrade attached to the marine, not free-standing.
        const shieldsOnMarine = arenaCards.filter((c: { internalName: string; parentCard?: { internalName: string } }) =>
            c.internalName === 'shield' && c.parentCard?.internalName === 'battlefield-marine'
        );
        expect(shieldsOnMarine.length).toBe(1);
    });

    it('places cards into the discard zone', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: { discard: ['porg', 'rebel-pathfinder'] },
            player2: {},
        });

        const discardNames = wrapper.player1.player.discard.map((c: { internalName: string }) => c.internalName);
        // setDiscard reverses so the first-listed ends up on top — order in the resulting array starts with the bottom card.
        expect(discardNames.sort()).toEqual(['porg', 'rebel-pathfinder']);
    });

    it('respects hasInitiative', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: {},
            player2: { hasInitiative: true },
        });

        expect(wrapper.game.initiativePlayer).toBeTruthy();
        expect(wrapper.game.initiativePlayer.id).toBe('222');
    });

    it('skips the SetupPhase entirely and lands directly in the action phase', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: { hand: ['porg'] },
            player2: { hand: ['rebel-pathfinder'], hasInitiative: true },
        });

        expect(wrapper.game.currentPhase).toBe('action');
        // No mulligan or resource-2 prompt should be open. Both players land
        // either with an action prompt or a "waiting" prompt; neither is the
        // "Choose cards to resource" prompt that SetupPhase would have opened.
        const prompts = [wrapper.player1.player.currentPrompt(), wrapper.player2.player.currentPrompt()];
        for (const p of prompts) {
            const title = (typeof p.menuTitle === 'function' ? p.menuTitle({}) : p.menuTitle) ?? '';
            expect(title.toLowerCase()).not.toContain('keep');
            expect(title.toLowerCase()).not.toContain('resource any 2');
        }
    });

    it('throws CustomSetupValidationFailure when the applier is given a card not in the deck', async function () {
        const deck1Options: any = { hand: ['porg'] };
        const deck2Options: any = {};

        const player1OwnedCards = builder.deckBuilder.getOwnedCards(1, deck1Options, deck2Options);
        const player2OwnedCards = builder.deckBuilder.getOwnedCards(2, deck2Options, deck1Options);
        const [deck1] = builder.deckBuilder.customDeck(1, player1OwnedCards, 'action');
        const [deck2] = builder.deckBuilder.customDeck(2, player2OwnedCards, 'action');

        const wrapper = new GameFlowWrapper(
            builder.cardDataGetter,
            makeRouter(),
            { id: '111', username: 'player1' },
            { id: '222', username: 'player2' },
            UndoMode.Disabled,
            // Reference a card the deck doesn't contain.
            { phase: 'action', player1: { hand: ['rebel-pathfinder'] }, player2: {} },
        );

        wrapper.player1.selectDeck(deck1);
        wrapper.player2.selectDeck(deck2);

        let caught: unknown = null;
        try {
            await wrapper.startGameAsync();
        } catch (err) {
            caught = err;
        }
        expect(caught).toBeInstanceOf(CustomSetupValidationFailure);
        if (caught instanceof CustomSetupValidationFailure) {
            expect(caught.errors.length).toBeGreaterThan(0);
            expect(caught.errors[0].path).toContain('player1.hand');
        }
    });

    it('respects credits', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: { credits: 3 },
            player2: {},
        });

        expect(wrapper.player1.player.creditTokenCount).toBe(3);
    });

    it('grants the Force token when hasForceToken is true', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: { hasForceToken: true },
            player2: {},
        });

        expect(wrapper.player1.player.hasTheForce).toBe(true);
        expect(wrapper.player2.player.hasTheForce).toBe(false);
    });

    it('lets the active player play a card immediately after setup', async function () {
        const wrapper = await setupCustomGameAsync({
            player1: { hand: ['porg'], hasInitiative: true },
            player2: {},
        });

        // Player1 starts with initiative. Click porg to play it.
        wrapper.player1.clickCard(wrapper.player1.findCardByName('porg'));
        // After playing, porg moves to ground arena.
        const arenaNames = wrapper.player1.player.getArenaCards().map((c: { internalName: string }) => c.internalName);
        expect(arenaNames).toContain('porg');
    });
});
