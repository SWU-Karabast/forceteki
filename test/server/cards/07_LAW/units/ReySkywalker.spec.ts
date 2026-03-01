describe('Rey, Skywalker', function () {
    integration(function (contextRef) {
        describe('Rey\'s ability', function () {
            it('cannot be defeated by opponent\'s event that says defeat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fell-the-dragon'],
                    },
                    player2: {
                        groundArena: ['rey#skywalker'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.fellTheDragon);
                context.player1.clickCard(context.rey);
                expect(context.rey).toBeInZone('groundArena');
            });

            it('cannot be defeated by opponent\'s unit that says defeat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['devastating-gunship'],
                    },
                    player2: {
                        groundArena: [{ card: 'rey#skywalker', damage: 7 }],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.devastatingGunship);
                expect(context.player1).toBeAbleToSelectExactly([context.rey]);
                context.player1.clickCard(context.rey);
                expect(context.rey).toBeInZone('groundArena');
            });

            it('can be defeated by state based effects', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['make-an-opening'],
                    },
                    player2: {
                        groundArena: [{ card: 'rey#skywalker', damage: 7 }],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.makeAnOpening);
                context.player1.clickCard(context.rey);
                expect(context.rey).toBeInZone('discard');
            });

            it('can be defeated by your own event', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        groundArena: ['rey#skywalker'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.rey);
                expect(context.rey).toBeInZone('discard');
            });

            it('can be defeated by your own unit that says defeat', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['count-dooku#darth-tyranus'],
                        groundArena: [{ card: 'rey#skywalker', damage: 7 }],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.countDooku);
                context.player1.clickPrompt('Defeat a unit with 4 or less remaining HP');
                context.player1.clickCard(context.rey);
                expect(context.rey).toBeInZone('discard');
            });

            it('cannot be defeated by opponent event even if you pick', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['power-of-the-dark-side'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'rey#skywalker'],
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.powerOfTheDarkSide);
                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.rey]);
                context.player2.clickCard(context.rey);
                expect(context.rey).toBeInZone('groundArena');
            });

            it('cannot be taken control of by opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                    },
                    player2: {
                        groundArena: ['rey#skywalker', 'battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.changeOfHeart);
                expect(context.player1).toBeAbleToSelectExactly([context.rey, context.battlefieldMarine]);

                context.player1.clickCard(context.rey);
                expect(context.rey).toBeInZone('groundArena', context.player2);
                expect(context.getChatLog()).toEqual(
                    'player1 uses Rey to cancel the effects of Change of Heart'
                );
            });

            it('cannot be given control of to an opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['impropriety-among-thieves'],
                        groundArena: ['rey#skywalker', 'wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.improprietyAmongThieves);
                expect(context.player1).toBeAbleToSelectExactly([context.rey, context.wampa]);
                context.player1.clickCard(context.rey);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.rey).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);

                context.moveToRegroupPhase();

                expect(context.rey).toBeInZone('groundArena', context.player1);
                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player2);
            });
        });
    });
});
