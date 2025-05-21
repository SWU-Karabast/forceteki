describe('Grand Inquisitor, Stories Travel Quickly', function() {
    integration(function(contextRef) {
        describe('Grand Inquisitor\'s undeployed ability', function() {
            it('should use the Force and give -2/-0 to the defender this attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: 'grand-inquisitor#stories-travel-quickly',
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickPrompt('Attack with a unit. The defender gets -2/-0 for this attack');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.grandInquisitor.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.wampa.damage).toBe(3);
                expect(context.wampa.getPower()).toBe(4);
            });

            it('should give -2/-0 to all defenders when attacking multiple units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['darth-maul#revenge-at-last'],
                        leader: 'grand-inquisitor#stories-travel-quickly',
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['ephant-mon#head-of-security', 'lom-pyke#dealer-in-truths'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickPrompt('Attack with a unit. The defender gets -2/-0 for this attack');
                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.ephantMon);
                context.player1.clickCard(context.lomPyke);
                context.player1.clickPrompt('Done');

                expect(context.grandInquisitor.exhausted).toBeTrue();
                expect(context.player1.hasTheForce).toBeFalse();
                expect(context.darthMaul.damage).toBe(4);
                expect(context.ephantMon.damage).toBe(5);
                expect(context.ephantMon.getPower()).toBe(4);
                expect(context.lomPyke.damage).toBe(5);
                expect(context.lomPyke.getPower()).toBe(4);
            });

            it('cannot be used wihtout the Force', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: 'grand-inquisitor#stories-travel-quickly',
                        hasForceToken: false,
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCardNonChecking(context.grandInquisitor);
                expect(context.grandInquisitor).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('cannot be used if exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'grand-inquisitor#stories-travel-quickly', exhausted: true },
                        hasForceToken: true,
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCardNonChecking(context.grandInquisitor);
                expect(context.grandInquisitor).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });
        });

        describe('Grand Inquisitor\'s deployed ability', function() {
            it('should give -2/-0 to the defender', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'grand-inquisitor#stories-travel-quickly', deployed: true },
                        hasForceToken: true,
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.grandInquisitor);
                context.player1.clickCard(context.wampa);

                expect(context.player1.hasTheForce).toBeTrue();
                expect(context.grandInquisitor.damage).toBe(2);
                expect(context.wampa.damage).toBe(3);
                expect(context.wampa.getPower()).toBe(4);
            });
        });
    });
});
