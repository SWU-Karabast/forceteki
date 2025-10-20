describe('Oppression Breeds Rebellion', function () {
    integration(function (contextRef) {
        it('Oppression Breeds Rebellion\'s ability should draw 3 cards if a friendly unit died while attacking this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion', 'battlefield-marine'],
                    groundArena: [
                        'rebel-pathfinder',
                        'pyke-sentinel'
                    ],
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.oppressionBreedsRebellion);
            expect(context.player1.handSize).toBe(4);
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.vigilance).toBeInZone('hand');
            expect(context.aggression).toBeInZone('hand');
            expect(context.command).toBeInZone('hand');

            expect(context.player2).toBeActivePlayer();
        });

        it('Oppression Breeds Rebellion\'s ability should draw 3 cards if a friendly unit died while attacking this phase that was taken from Change of Heart', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion', 'change-of-heart'],
                    groundArena: [
                        'rebel-pathfinder'
                    ],
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    groundArena: ['wampa', 'pyke-sentinel']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.changeOfHeart);
            context.player1.clickCard(context.pykeSentinel);

            context.player2.passAction();

            context.player1.clickCard(context.pykeSentinel);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.oppressionBreedsRebellion);
            expect(context.player1.handSize).toBe(3);
            expect(context.vigilance).toBeInZone('hand');
            expect(context.aggression).toBeInZone('hand');
            expect(context.command).toBeInZone('hand');

            expect(context.player2).toBeActivePlayer();
        });

        it('Oppression Breeds Rebellion\'s ability should draw 3 cards if a friendly leader unit died while attacking this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion', 'battlefield-marine'],
                    groundArena: [
                        'rebel-pathfinder',
                        'pyke-sentinel'
                    ],
                    leader: { card: 'third-sister#seething-with-ambition', deployed: true },
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.thirdSisterSeethingWithAmbition);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.oppressionBreedsRebellion);
            expect(context.player1.handSize).toBe(4);
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.vigilance).toBeInZone('hand');
            expect(context.aggression).toBeInZone('hand');
            expect(context.command).toBeInZone('hand');

            expect(context.player2).toBeActivePlayer();
        });

        it('Oppression Breeds Rebellion\'s ability should draw 3 cards if a friendly unit died from an On Attack while attacking this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion', 'trench-run'],
                    groundArena: [
                        'rebel-pathfinder',
                        'pyke-sentinel'
                    ],
                    spaceArena: ['cartel-spacer'],
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    groundArena: ['wampa'],
                    deck: ['superlaser-blast', 'ma-klounkee']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.trenchRun);
            context.player1.clickCard(context.cartelSpacer);
            context.player1.clickCard(context.p2Base);
            expect(context.cartelSpacer).toBeInZone('discard');

            context.player2.passAction();

            context.player1.clickCard(context.oppressionBreedsRebellion);
            expect(context.player1.handSize).toBe(3);
            expect(context.vigilance).toBeInZone('hand');
            expect(context.aggression).toBeInZone('hand');
            expect(context.command).toBeInZone('hand');

            expect(context.player2).toBeActivePlayer();
        });

        it('Oppression Breeds Rebellion\'s ability should draw 3 cards if Hondo shenanigans', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion'],
                    groundArena: [
                        'rebel-pathfinder',
                        { card: 'hondo-ohnaka#superfluous-swindler', damage: 4 }
                    ],
                    spaceArena: [{ card: 'cartel-spacer', upgrades: ['perilous-position'] }],
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    groundArena: ['wampa'],
                    deck: ['superlaser-blast', 'ma-klounkee']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.hondoOhnakaSuperfluousSwindler);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.perilousPosition);
            context.player1.clickCard(context.hondoOhnakaSuperfluousSwindler);
            expect(context.hondoOhnakaSuperfluousSwindler).toBeInZone('discard');

            context.player2.passAction();

            context.player1.clickCard(context.oppressionBreedsRebellion);
            expect(context.player1.handSize).toBe(3);
            expect(context.vigilance).toBeInZone('hand');
            expect(context.aggression).toBeInZone('hand');
            expect(context.command).toBeInZone('hand');

            expect(context.player2).toBeActivePlayer();
        });

        it('Oppression Breeds Rebellion\'s ability should not draw 3 cards if an enemy unit died while attacking this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion', 'battlefield-marine'],
                    groundArena: [
                        'rebel-pathfinder',
                        'wampa'
                    ],
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    groundArena: ['pyke-sentinel'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.pykeSentinel);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(context.oppressionBreedsRebellion);
            context.player1.clickPrompt('Play anyway');
            expect(context.player1.handSize).toBe(1);
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.vigilance).toBeInZone('deck');
            expect(context.aggression).toBeInZone('deck');
            expect(context.command).toBeInZone('deck');

            expect(context.player2).toBeActivePlayer();
        });

        it('Oppression Breeds Rebellion\'s ability should not draw 3 cards if a friendly unit died while defending this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion', 'battlefield-marine'],
                    groundArena: [
                        'rebel-pathfinder',
                        'pyke-sentinel'
                    ],
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.pykeSentinel);

            context.player1.clickCard(context.oppressionBreedsRebellion);
            context.player1.clickPrompt('Play anyway');
            expect(context.player1.handSize).toBe(1);
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.vigilance).toBeInZone('deck');
            expect(context.aggression).toBeInZone('deck');
            expect(context.command).toBeInZone('deck');

            expect(context.player2).toBeActivePlayer();
        });

        it('Oppression Breeds Rebellion\'s ability should not draw 3 cards if a friendly unit died from an evetn', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['oppression-breeds-rebellion', 'battlefield-marine'],
                    groundArena: [
                        'rebel-pathfinder',
                        'pyke-sentinel'
                    ],
                    deck: ['aggression', 'vigilance', 'command']
                },
                player2: {
                    hand: ['power-of-the-dark-side'],
                    groundArena: ['wampa'],
                    hasInitiative: true,
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.powerOfTheDarkSide);
            context.player1.clickCard(context.pykeSentinel);

            context.player1.clickCard(context.oppressionBreedsRebellion);
            context.player1.clickPrompt('Play anyway');
            expect(context.player1.handSize).toBe(1);
            expect(context.battlefieldMarine).toBeInZone('hand');
            expect(context.vigilance).toBeInZone('deck');
            expect(context.aggression).toBeInZone('deck');
            expect(context.command).toBeInZone('deck');

            expect(context.player2).toBeActivePlayer();
        });
    });
});