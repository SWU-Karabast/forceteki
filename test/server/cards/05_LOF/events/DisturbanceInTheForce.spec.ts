describe('Disturbance in the Force', function() {
    integration(function(contextRef) {
        describe('Disturbance in the Force\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['disturbance-in-the-force', 'droid-deployment'],
                        groundArena: ['wampa', 'atst'],
                        hasForceToken: false,
                    },
                    player2: {
                        hand: ['takedown', 'no-glory-only-results'],
                        groundArena: ['battlefield-marine', 'kiadimundi#composed-and-confident']
                    }
                });
            });

            it('should not create the Force and allow giving a Shield token when no friendly unit left play this phase', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                context.player1.clickCard(context.disturbanceInTheForce);
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
            });

            it('should not create a Force token and allow giving a Shield token when a friendly unit left play previous phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.wampa);

                context.moveToNextActionPhase();

                context.player1.clickCard(context.disturbanceInTheForce);
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
            });

            it('should not create a Force token and allow giving a Shield token when a friendly unit left play this phase with No Glory Only Results', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.disturbanceInTheForce);
                expect(context.player1).toHaveExactPromptButtons(['Play anyway', 'Cancel']);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.hasTheForce).toBeFalse();
            });

            it('should create a Force token and allow giving a Shield token when a friendly unit left play this phase', function () {
                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.wampa);

                context.player1.clickCard(context.disturbanceInTheForce);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.kiadimundi]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.kiadimundi).toHaveExactUpgradeNames([]);
                expect(context.player1.hasTheForce).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should create a Force token and allow giving a Shield token when a friendly token unit left play this phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.droidDeployment);

                const droids = context.player1.findCardsByName('battle-droid');

                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(droids[0]);

                context.player1.clickCard(context.disturbanceInTheForce);

                expect(context.player1).toBeAbleToSelectExactly([droids[1], context.wampa, context.atst, context.battlefieldMarine, context.kiadimundi]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.atst);

                expect(context.atst).toHaveExactUpgradeNames(['shield']);
                expect(context.player1.hasTheForce).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow to not giving a Shield token when a friendly unit left play this phase (player has already the Force)', function () {
                const { context } = contextRef;

                context.player1.setHasTheForce(true);

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.kiadimundi);

                context.player2.passAction();

                context.player1.clickCard(context.disturbanceInTheForce);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine, context.kiadimundi]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickPrompt('Choose nothing');

                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.kiadimundi).toHaveExactUpgradeNames([]);
                expect(context.player1.hasTheForce).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should create a Force token and allow giving a Shield token when a friendly leader unit left play this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['disturbance-in-the-force'],
                    groundArena: ['wampa'],
                    leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    hasForceToken: false
                },
                player2: {
                    hand: ['takedown'],
                    hasInitiative: true
                }
            });
            const { context } = contextRef;
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.sabineWren);

            context.player1.clickCard(context.disturbanceInTheForce);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            expect(context.player1).toHaveChooseNothingButton();
            context.player1.clickCard(context.wampa);

            expect(context.wampa).toHaveExactUpgradeNames(['shield']);
            expect(context.player1.hasTheForce).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });
    });
});
