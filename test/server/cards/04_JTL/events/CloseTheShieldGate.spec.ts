describe('Close the Shield Gate', function () {
    integration(function (contextRef) {
        describe('Close the Shield Gate\'s ability', function () {
            it('should prevent the next combat damage dealt to chosen base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['close-the-shield-gate'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.closeTheShieldGate);
                context.player1.clickCard(context.p1Base);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(0);
            });

            it('should not prevent the next combat damage dealt to a non-chosen base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['close-the-shield-gate'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.closeTheShieldGate);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(4);
            });

            it('should prevent the next card ability damage dealt to chosen base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['close-the-shield-gate'],
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.closeTheShieldGate);
                context.player1.clickCard(context.p1Base);

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(0);
            });

            it('should not prevent the next card ability damage dealt to a non-chosen base', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['close-the-shield-gate'],
                    },
                    player2: {
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.closeTheShieldGate);
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(2);
            });

            it('should not prevent more than one instance of damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['close-the-shield-gate'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.closeTheShieldGate);
                context.player1.clickCard(context.p1Base);

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(0);

                context.player1.passAction();
                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(4);
            });

            it('should not prevent indirect damage', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['close-the-shield-gate'],
                    },
                    player2: {
                        hand: ['torpedo-barrage']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.closeTheShieldGate);
                context.player1.clickCard(context.p1Base);

                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);
            });

            it('indirect damage should consume the protection', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['close-the-shield-gate'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['torpedo-barrage']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.closeTheShieldGate);
                context.player1.clickCard(context.p1Base);

                context.player2.clickCard(context.torpedoBarrage);
                context.player2.clickPrompt('Deal indirect damage to opponent');

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(9);
            });
        });

        it('should prevent Blast counter damage to a base in FauxSuns format', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    // Luke provides the Vigilance aspect needed to play Close the Shield Gate
                    leader: 'luke-skywalker#faithful-friend',
                    secondLeader: 'saw-gerrera#bring-down-the-empire',
                    base: 'kestro-city',
                    hand: ['close-the-shield-gate'],
                    resources: ['wampa'],
                },
                player2: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'administrators-tower',
                    hand: [],
                    deck: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            // Player1 plays Close the Shield Gate on their own base as a card action.
            // Claiming a token would be a permanent exit, so player1 uses a card action to set up
            // the shield before player2 claims Blast (which deals 1 damage to player1's base).
            context.player1.clickCard(context.closeTheShieldGate);
            context.player1.clickCard(context.p1Base);

            // Player2 is now active — claims Blast, which would deal 1 damage to player1's base
            context.player2.clickPrompt('Claim Blast');

            // Close the Shield Gate prevented the Blast damage
            expect(context.p1Base.damage).toBe(0);
        });
    });
});