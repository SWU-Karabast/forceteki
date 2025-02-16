describe('Jabba the Hutt, His High Exaltedness', function () {
    integration(function (contextRef) {
        describe('Jabba the Hutt\'s leader undeployed ability', function () {
            const bountyPrompt = 'Collect Bounty: The next unit you play this phase costs 1 resource less';

            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['seasoned-shoretrooper', 'vanguard-infantry'],
                        groundArena: ['wampa'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        resources: 4
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should add a bounty to play a unit from our hand, it costs 1 resource less', function () {
                const { context } = contextRef;

                // add a bounty to battlefield marine
                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // kill battlefield marine
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                // collect bounty
                expect(context.player1).toHavePassAbilityPrompt(bountyPrompt);
                context.player1.clickPrompt(bountyPrompt);

                context.player2.passAction();

                // seasonned shoretrooper should cost 1 resource less
                context.player1.clickCard(context.seasonedShoretrooper);
                expect(context.player1.exhaustedResourceCount).toBe(1);

                context.player2.passAction();

                // bounty expired, vanguard infantry should have his normal cost
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1.exhaustedResourceCount).toBe(2);
            });

            it('should add a bounty to play a unit from our hand but expire at the end of phase', function () {
                const { context } = contextRef;

                // add a bounty to battlefield marine
                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // kill battlefield marine
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                // collect bounty
                expect(context.player1).toHavePassAbilityPrompt(bountyPrompt);
                context.player1.clickPrompt(bountyPrompt);

                context.moveToNextActionPhase();

                // round changed, bounty is expired
                context.player1.clickCard(context.seasonedShoretrooper);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should add a bounty which expire at the end of phase', function () {
                const { context } = contextRef;

                // add a bounty to battlefield marine
                context.player1.clickCard(context.jabbaTheHutt);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.moveToNextActionPhase();

                // round changed, no more bounty on battlefield marine
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Jabba the Hutt\'s leader deployed ability', function () {
            it('should choose a friendly to capture a enemy non leader unit', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'seasoned-shoretrooper'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt('Deploy Jabba the Hutt');

                // should choose another friendly unit
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.seasonedShoretrooper]);
                context.player1.clickCard(context.seasonedShoretrooper);

                // to capture any enemy non leader unit
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeCapturedBy(context.seasonedShoretrooper);
            });
        });

        describe('Jabba the Hutt\'s leader deployed ability', function () {
            const abilityPrompt = 'Choose a unit. For this phase, it gains: "Bounty — The next unit you play this phase costs 2 resources less."';
            const bountyPrompt = 'Collect Bounty: The next unit you play this phase costs 2 resources less';

            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['seasoned-shoretrooper', 'vanguard-infantry'],
                        groundArena: ['wampa'],
                        leader: { card: 'jabba-the-hutt#his-high-exaltedness', deployed: true },
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });
            });

            it('should add a bounty to play a unit from our hand, it costs 2 resource less', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt(abilityPrompt);

                // add a bounty on battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.jabbaTheHutt, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // kill battlefield marine
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                // collect bounty
                expect(context.player1).toHavePassAbilityPrompt(bountyPrompt);
                context.player1.clickPrompt(bountyPrompt);

                context.player2.passAction();

                // seasonned shoretrooper should cost 2 resources less
                context.player1.clickCard(context.seasonedShoretrooper);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();

                // no more bounty, vanguard infantry should have his normal cost
                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should add a bounty to play a unit from our hand but expire at the end of phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt(abilityPrompt);

                // add a bounty on battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.jabbaTheHutt, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.passAction();

                // kill battlefield marine
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toHavePassAbilityPrompt(bountyPrompt);
                context.player1.clickPrompt(bountyPrompt);

                context.moveToNextActionPhase();

                // round changed, bounty is expired
                context.player1.clickCard(context.seasonedShoretrooper);
                expect(context.player1.exhaustedResourceCount).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.vanguardInfantry);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should add a bounty which expire at the end of phase', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.jabbaTheHutt);
                context.player1.clickPrompt(abilityPrompt);

                // add a bounty on battlefield marine
                expect(context.player1).toBeAbleToSelectExactly([context.jabbaTheHutt, context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                context.moveToNextActionPhase();

                // round changed, no more bounty on battlefield marine
                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
