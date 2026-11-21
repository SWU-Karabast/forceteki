import type { ISerializedDeckEndsState } from '../../server/game/Interfaces';

describe('Bug report game state serialization', function () {
    integration(function (contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    discard: ['battlefield-marine', 'wampa', 'pyke-sentinel'],
                    deck: ['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper', 'viper-probe-droid']
                },
                player2: {
                    discard: ['frontier-atrt']
                }
            });
        });

        it('should serialize the discard pile top card first, matching the setup format', function () {
            const { context } = contextRef;

            // the zone stores the top card last, the setup format lists it first
            expect(context.player1.discard[context.player1.discard.length - 1]).toBe(context.battlefieldMarine);

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.discard).toEqual(['battlefield-marine', 'wampa', 'pyke-sentinel']);
            expect(state.player2.discard).toEqual(['frontier-atrt']);
        });

        it('should serialize a newly discarded card at the top of the discard pile', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.discard).toEqual(['daring-raid', 'battlefield-marine', 'wampa', 'pyke-sentinel']);
        });

        it('should serialize a short deck completely, in setup order', function () {
            const { context } = contextRef;

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.deck).toEqual(['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper', 'viper-probe-droid']);
        });

        it('should serialize the reporting player as player1', function () {
            const { context } = contextRef;

            const state = context.game.captureGameState(context.player2.id);

            expect(state.player1.discard).toEqual(['frontier-atrt']);
            expect(state.player2.discard).toEqual(['battlefield-marine', 'wampa', 'pyke-sentinel']);
        });
    });

    integration(function (contextRef) {
        describe('with a long deck', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [
                            'atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper', 'viper-probe-droid',
                            'wampa', 'pyke-sentinel', 'battlefield-marine', 'frontier-atrt', 'consular-security-force', 'snowspeeder'
                        ]
                    }
                });
            });

            it('should serialize the top five and the bottom five cards as topCards and bottomCards', function () {
                const { context } = contextRef;

                const state = context.game.captureGameState(context.player1.id);

                expect(state.player1.deck).toEqual({
                    topCards: ['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper'],
                    bottomCards: ['pyke-sentinel', 'battlefield-marine', 'frontier-atrt', 'consular-security-force', 'snowspeeder']
                });
            });
        });
    });

    integration(function (contextRef) {
        describe('with a deck of exactly ten cards', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: [
                            'atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper',
                            'viper-probe-droid', 'wampa', 'pyke-sentinel', 'battlefield-marine', 'frontier-atrt'
                        ]
                    }
                });
            });

            it('should still serialize the whole deck as a list', function () {
                const { context } = contextRef;

                const state = context.game.captureGameState(context.player1.id);

                expect(state.player1.deck).toEqual([
                    'atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper',
                    'viper-probe-droid', 'wampa', 'pyke-sentinel', 'battlefield-marine', 'frontier-atrt'
                ]);
            });
        });
    });

    integration(function (contextRef) {
        describe('with a deck given by its top and bottom cards', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: {
                            topCards: ['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper', 'viper-probe-droid'],
                            bottomCards: ['pyke-sentinel', 'battlefield-marine', 'frontier-atrt', 'consular-security-force', 'snowspeeder']
                        }
                    }
                });
            });

            it('should place the bottomCards below the topCards, last card at the very bottom', function () {
                const { context } = contextRef;

                expect(context.player1.deck.length).toBe(11);
                expect(context.player1.deck[0]).toBe(context.atst);
                expect(context.player1.deck[5]).toBe(context.viperProbeDroid);
                expect(context.player1.deck[6]).toBe(context.pykeSentinel);
                expect(context.player1.deck[10]).toBe(context.snowspeeder);
            });

            it('should serialize back into the same top and bottom cards', function () {
                const { context } = contextRef;

                const state = context.game.captureGameState(context.player1.id);

                expect(state.player1.deck).toEqual({
                    topCards: ['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper'],
                    bottomCards: ['pyke-sentinel', 'battlefield-marine', 'frontier-atrt', 'consular-security-force', 'snowspeeder']
                });
            });
        });
    });

    integration(function (contextRef) {
        describe('with only topCards in the setup', function () {
            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: { topCards: ['atst', 'cartel-spacer'] }
                    }
                });
            });

            it('should build the deck from the top cards alone', function () {
                const { context } = contextRef;

                expect(context.player1.deck).toEqual([context.atst, context.cartelSpacer]);
            });
        });
    });

    integration(function (contextRef) {
        describe('when the players of a captured state are loaded back as a test setup', function () {
            // a captured state as a bug report carries it: a long deck by its two ends, a short deck completely
            const capturedPlayer1 = {
                hand: ['daring-raid'],
                groundArena: ['wampa'],
                resources: ['battlefield-marine', 'battlefield-marine', 'battlefield-marine'],
                deck: {
                    topCards: ['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper'],
                    bottomCards: ['pyke-sentinel', 'frontier-atrt', 'consular-security-force', 'snowspeeder', 'viper-probe-droid']
                }
            };
            const capturedPlayer2 = {
                discard: ['tieln-fighter'],
                deck: ['seasoned-shoretrooper', 'superlaser-technician']
            };

            beforeEach(async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: capturedPlayer1,
                    player2: capturedPlayer2
                });
            });

            it('should put the captured cards on the top and the bottom of the deck', function () {
                const { context } = contextRef;

                expect(context.player1.deck.map((card) => card.internalName)).toEqual([
                    'atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper',
                    'pyke-sentinel', 'frontier-atrt', 'consular-security-force', 'snowspeeder', 'viper-probe-droid'
                ]);
                expect(context.player2.deck.map((card) => card.internalName)).toEqual(['seasoned-shoretrooper', 'superlaser-technician']);
            });

            it('should capture the rebuilt decks in the same order', function () {
                const { context } = contextRef;

                const state = context.game.captureGameState(context.player1.id);

                // the rebuilt long deck holds only the ten captured cards, which is short enough to be captured completely
                expect(state.player1.deck).toEqual([
                    'atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper',
                    'pyke-sentinel', 'frontier-atrt', 'consular-security-force', 'snowspeeder', 'viper-probe-droid'
                ]);
                expect(state.player2.deck).toEqual(['seasoned-shoretrooper', 'superlaser-technician']);
            });
        });
    });

    integration(function (contextRef) {
        describe('with an invalid deck object in the setup', function () {
            // a test game setup file is plain JSON, so the builder sees decks the setup type would not allow
            const untypedDeck = (deck: unknown) => deck as ISerializedDeckEndsState;

            it('should refuse a deck object without topCards', async function () {
                await expectAsync(contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { deck: untypedDeck({ bottomCards: ['wampa'] }) }
                })).toBeRejectedWithError('Test deck object must have a topCards array');
            });

            it('should refuse unknown properties in the deck object', async function () {
                await expectAsync(contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { deck: untypedDeck({ topCards: ['wampa'], middleCards: ['atst'] }) }
                })).toBeRejectedWithError('Test deck object has unknown properties: middleCards. Allowed are topCards (required) and bottomCards');
            });

            it('should refuse bottomCards that are not an array', async function () {
                await expectAsync(contextRef.setupTestAsync({
                    phase: 'action',
                    player1: { deck: untypedDeck({ topCards: ['wampa'], bottomCards: 'atst' }) }
                })).toBeRejectedWithError('Test deck bottomCards must be an array');
            });
        });
    });
});
