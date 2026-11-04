import type { Board, Entity } from '@swupgn/format';
import type { Card } from '../../../server/game/core/card/Card';
import { AudienceTracker } from '../../../server/game/core/swupgn/AudienceTracker';
import { BoardProjector } from '../../../server/game/core/swupgn/BoardProjector';
import { cardIdOf } from '../../../server/game/core/swupgn/SwuPgnCardIds';
import { SwuPgnWriterState } from '../../../server/game/core/swupgn/SwuPgnWriterState';

describe('AudienceTracker', function() {
    integration(function(contextRef) {
        let state: SwuPgnWriterState;
        let tracker: AudienceTracker;

        // Call first in each test body. Under whole-suite undo the body runs again after a rollback to the snapshot
        // taken at setup, which drops a state object built after it, so each run builds its own.
        function startTracking(): void {
            state = new SwuPgnWriterState(contextRef.context.game);
            tracker = new AudienceTracker(contextRef.context.game, state);
            tracker.register();
        }

        function project(): Board {
            return new BoardProjector(contextRef.context.game, state, tracker).project();
        }

        /** The entities on the board showing this card; at most one is expected. */
        function entitiesOf(card: Card, board: Board): Entity[] {
            return Object.values(board.entities).filter((entity) => entity.card === cardIdOf(card));
        }

        function entityOf(card: Card, board: Board = project()): Entity {
            const found = entitiesOf(card, board);
            expect(found.length).withContext(`entities for ${card.internalName}`)
                .toBe(1);
            return found[0];
        }

        afterEach(function () {
            expect(tracker.errors).withContext('tracker errors')
                .toBe(0);
        });

        describe('a reveal from hand', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['waylay']
                    },
                    player2: {
                        hand: ['lieutenant-childsen#death-star-prison-warden', 'pyke-sentinel']
                    }
                });
            });

            it('makes the opponent\'s revealed card known to all, and it stays known after it is played and bounced back to hand', function () {
                const { context } = contextRef;
                startTracking();
                expect(entityOf(context.pykeSentinel).to).toEqual([2]);

                context.player1.passAction();
                context.player2.clickCard(context.lieutenantChildsen);
                context.player2.clickCard(context.pykeSentinel);
                context.player2.clickDone();
                context.player1.clickDone();

                const revealed = entityOf(context.pykeSentinel);
                expect(revealed.zone).toBe('hand');
                expect(revealed.to).toBe('all');

                context.player1.passAction();
                context.player2.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('groundArena');
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.pykeSentinel);
                expect(context.pykeSentinel).toBeInZone('hand');

                const bounced = entityOf(context.pykeSentinel);
                expect(bounced.zone).toBe('hand');
                expect(bounced.to).toBe('all');
            });
        });

        describe('a private look at the opponent\'s hand', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['viper-probe-droid', 'battlefield-marine']
                    },
                    player2: {
                        hand: ['wampa', 'atst']
                    }
                });
            });

            it('widens only the looker, and an audience holding both seats is all', function () {
                const { context } = contextRef;
                startTracking();

                context.player1.clickCard(context.viperProbeDroid);
                context.player1.clickDone();

                for (const card of [context.wampa, context.atst]) {
                    expect(state.audienceOf(state.cardKey(card))).withContext(card.internalName)
                        .toEqual([1]);
                    expect(entityOf(card).to).withContext(card.internalName)
                        .toBe('all');
                }

                // the looker's own hand is not shown to the opponent
                expect(state.audienceOf(state.cardKey(context.battlefieldMarine))).toEqual([]);
                expect(entityOf(context.battlefieldMarine).to).toEqual([1]);
            });
        });

        describe('a deck search', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['mon-mothma#voice-of-the-rebellion'],
                        deck: ['cell-block-guard', 'pyke-sentinel', 'volunteer-soldier', 'cartel-spacer', 'battlefield-marine', 'wampa', 'viper-probe-droid', 'snowtrooper-lieutenant'],
                    }
                });
            });

            it('shows the viewed deck cards to the searcher until the looks end, then only the chosen card, now in hand', function () {
                const { context } = contextRef;
                startTracking();
                const unchosen = [context.cellBlockGuard, context.pykeSentinel, context.volunteerSoldier, context.cartelSpacer];

                expect(entitiesOf(context.battlefieldMarine, project())).toEqual([]);

                context.player1.clickCard(context.monMothma);

                // the search prompt is open: the top 5 are temporary deck entities only the searcher knows
                const searching = project();
                for (const card of [...unchosen, context.battlefieldMarine]) {
                    const entity = entityOf(card, searching);
                    expect(entity.zone).withContext(card.internalName)
                        .toBe('deck');
                    expect(entity.owner).withContext(card.internalName)
                        .toBe(1);
                    expect(entity.to).withContext(card.internalName)
                        .toEqual([1]);
                }
                expect(entitiesOf(context.wampa, searching)).toEqual([]);

                context.player1.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                context.player2.clickDone();
                expect(context.battlefieldMarine).toBeInZone('hand');

                // the search resolved inside one click: the looked-at cards stay until the looks end
                const resolved = project();
                expect(entityOf(context.battlefieldMarine, resolved).zone).toBe('hand');
                for (const card of unchosen) {
                    expect(entityOf(card, resolved).zone).withContext(card.internalName)
                        .toBe('deck');
                }

                tracker.endLooks();
                expect(tracker.viewedDeckCards()).toEqual([]);

                const after = project();
                for (const card of unchosen) {
                    expect(entitiesOf(card, after)).withContext(card.internalName)
                        .toEqual([]);
                }
                const chosen = entityOf(context.battlefieldMarine, after);
                expect(chosen.zone).toBe('hand');
                expect(chosen.to).toBe('all'); // Mon Mothma reveals the card she draws
            });
        });

        describe('a look at the top of a deck to put the cards on the top or the bottom', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['inferno-four#unforgetting'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer', 'wampa'],
                    }
                });
            });

            it('shows the looked-at cards to the looker while the prompt is open', function () {
                const { context } = contextRef;
                startTracking();

                context.player1.clickCard(context.infernoFour);
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.foundling, context.pykeSentinel]);

                const board = project();
                for (const card of [context.foundling, context.pykeSentinel]) {
                    const entity = entityOf(card, board);
                    expect(entity.zone).withContext(card.internalName)
                        .toBe('deck');
                    expect(entity.to).withContext(card.internalName)
                        .toEqual([1]);
                }
                expect(entitiesOf(context.atst, board)).toEqual([]);

                context.player1.clickDisplayCardPromptButton(context.foundling.uuid, 'bottom');
                context.player1.clickDisplayCardPromptButton(context.pykeSentinel.uuid, 'top');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('resources and new generations', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa', 'isb-agent', 'resupply'],
                        groundArena: ['atst'],
                        deck: ['cartel-spacer', 'battlefield-marine', 'volunteer-soldier', 'cell-block-guard']
                    },
                    player2: {
                        resources: ['alliance-xwing', 'tie-advanced']
                    }
                });
            });

            it('never widens a card to the opponent by its being resourced', function () {
                const { context } = contextRef;
                startTracking();

                context.moveToRegroupPhase();
                context.player1.clickCard(context.wampa);
                context.player1.clickDone();
                context.player2.clickDone();
                expect(context.wampa).toBeInZone('resource');

                const resource = entityOf(context.wampa);
                expect(resource.zone).toBe('resource');
                expect(resource.to).toEqual([1]);
                for (const card of context.player2.resources) {
                    expect(entityOf(card).to).withContext(card.internalName)
                        .toEqual([2]);
                }
            });

            it('starts a card that went into the deck and came back unknown again', function () {
                const { context } = contextRef;
                startTracking();

                // ISB Agent reveals an event from hand
                context.player1.clickCard(context.isbAgent);
                context.player1.clickCard(context.resupply);
                context.player2.clickDone();
                context.player1.clickCard(context.atst);
                expect(context.player2).toBeActivePlayer();
                expect(entityOf(context.resupply).to).toBe('all');

                context.player1.moveCard(context.resupply, 'deck');
                state.bumpGeneration(context.resupply);
                context.player1.moveCard(context.resupply, 'hand');

                expect(entityOf(context.resupply).to).toEqual([1]);
            });
        });
    });
});
