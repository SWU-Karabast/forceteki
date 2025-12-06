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
    });
});