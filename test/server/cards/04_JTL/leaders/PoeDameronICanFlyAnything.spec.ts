describe('Poe Dameron, I Can Fly Anything', function() {
    integration(function(contextRef) {
        describe('Poe Dameron\'s undeployed ability', function() {
            it('flips him and attach him to a friendly Vehicle without a Pilot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['r2d2#artooooooooo'] }, 'tie-bomber'],
                        groundArena: ['reinforcement-walker']
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');

                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).toBeAbleToSelectExactly([context.reinforcementWalker, context.tieBomber]);

                context.player1.clickCard(context.reinforcementWalker);

                expect(context.reinforcementWalker).toHaveExactUpgradeNames(['poe-dameron#i-can-fly-anything']);
            });

            it('does nothing if there are is not a friendly Vehicle without a Pilot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: [{ card: 'cartel-spacer', upgrades: ['r2d2#artooooooooo'] }],
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');

                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if leader is exhausted', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'poe-dameron#i-can-fly-anything', exhausted: true },
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['battlefield-marine'],
                        resources: 2,
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCardNonChecking(context.poeDameron);

                expect(context.player1).not.toBeAbleToSelect([context.poeDameron]);
            });

            it('does nothing if resource cost cannot be paid', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['battlefield-marine'],
                        resources: 2,
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.exhaustResources(context.player1.readyResourceCount);
                context.player1.clickCardNonChecking(context.poeDameron);

                expect(context.player1).not.toBeAbleToSelect([context.poeDameron]);
            });

            it('does not count as playing an upgrade on a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['dengar#the-demolisher'],
                    },
                    player2: {
                        groundArena: ['atst'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Poe Dameron\'s deployed ability', function() {
            it('has no ability when deployed as a unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: ['cartel-spacer'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Deploy Poe Dameron');

                expect(context.poeDameron).toBeInZone('groundArena');

                context.player2.passAction();

                context.player1.clickCard(context.poeDameron);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
            });

            it('allows Poe Dameron to attach to a friendly Vehicle without a Pilot, once per round', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'poe-dameron#i-can-fly-anything',
                        spaceArena: [{ card: 'tie-bomber', upgrades: ['r2d2#artooooooooo'] }, 'cartel-spacer'],
                        groundArena: ['atst', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickPrompt('Flip Poe Dameron and attach him as an upgrade to a friendly Vehicle unit without a Pilot on it');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.cartelSpacer]);

                context.player1.clickCard(context.atst);
                expect(context.atst).toHaveExactUpgradeNames(['poe-dameron#i-can-fly-anything']);

                context.player2.passAction();

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                context.player1.clickCard(context.poeDameron);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);

                context.player1.clickCard(context.cartelSpacer);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.cartelSpacer).toHaveExactUpgradeNames(['poe-dameron#i-can-fly-anything']);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCardNonChecking(context.poeDameron);
                expect(context.player1).not.toBeAbleToSelect([context.poeDameron]);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.poeDameron);
                expect(context.player1).toBeAbleToSelectExactly([context.atst]);

                context.player1.clickCard(context.atst);
                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames(['poe-dameron#i-can-fly-anything']);

                context.player2.passAction();

                context.player1.clickCardNonChecking(context.poeDameron);
                expect(context.player1).not.toBeAbleToSelect([context.poeDameron]);
            });
        });
    });
});