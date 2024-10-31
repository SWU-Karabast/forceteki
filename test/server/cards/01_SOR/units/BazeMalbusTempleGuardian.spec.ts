describe('Baze Malbus, Temple Guardian', function() {
    integration(function (contextRef) {
        describe('Baze Malbus\'s ability', function() {
            describe('when the player does not have initiative', function () {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            groundArena: ['baze-malbus#temple-guardian'],
                        },
                        player2: {
                            groundArena: ['wampa', 'battlefield-marine'],
                            hasInitiative: true
                        }
                    });
                });

                // Checks both that sentinel is not active initially, and then activates after player claims initiative.
                it('should not have sentinel until the player claims initiative', function () {
                    const { context } = contextRef;

                    // CASE 1: Sentinel is inactive when starting the phase without initiative
                    expect(context.player2).toBeActivePlayer();
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toBe(4);
                    expect(context.player1).toHaveClaimInitiativeAbilityButton();
                    context.player1.claimInitiative();

                    // CASE 2: Sentinel is now active after player 1 claims the initiative
                    expect(context.player2).toBeActivePlayer();
                    context.player2.clickCard(context.battlefieldMarine);

                    // Baze Malbus automatically selected due to sentinel
                    expect(context.battlefieldMarine.damage).toBe(2);
                    expect(context.bazeMalbus.damage).toBe(3);
                });
            });

            describe('when the player has initiative', function () {
                beforeEach(function () {
                    contextRef.setupTest({
                        phase: 'action',
                        player1: {
                            groundArena: ['baze-malbus#temple-guardian'],
                            hasInitiative: true
                        },
                        player2: {
                            groundArena: ['wampa', 'battlefield-marine'],
                        }
                    });
                });

                // Checks that sentinel works initially, and then after it is claimed sentinel is no longer active.
                it('has sentinel until initiative is claimed by opposing player', function () {
                    const { context } = contextRef;

                    expect(context.player1).toBeActivePlayer();
                    context.player1.passAction();

                    // CASE 1: Sentinel is active when starting the phase with initiative
                    context.player2.clickCard(context.battlefieldMarine);

                    // Baze Malbus automatically selected due to sentinel
                    expect(context.battlefieldMarine.damage).toBe(2);
                    expect(context.bazeMalbus.damage).toBe(3);

                    context.player1.clickCard(context.bazeMalbus);
                    context.player1.clickCard(context.p2Base);

                    // CASE 2: Sentinel is disabled when the next phase starts and the player does not have sentinel
                    expect(context.player2).toHaveClaimInitiativeAbilityButton();
                    context.player2.claimInitiative();
                    context.moveToNextActionPhase();

                    expect(context.player2).toBeActivePlayer();
                    context.player2.clickCard(context.wampa);
                    context.player2.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toBe(4);
                });
            });
        });
    });
});
