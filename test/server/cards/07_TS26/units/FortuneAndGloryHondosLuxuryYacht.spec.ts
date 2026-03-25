describe('Fortune and Glory, Hondo\'s Luxury Yacht', function() {
    integration(function(contextRef) {
        describe('Fortune and Glory\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['fortune-and-glory#hondos-luxury-yacht'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                    }
                });
            });

            it('', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.fortuneAndGlory);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa, context.awing]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeCapturedBy(context.fortuneAndGlory);
            });

            it('', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.fortuneAndGlory);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.greenSquadronAwing, context.wampa, context.awing]);
                expect(context.player1).not.toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine).toBeCapturedBy(context.fortuneAndGlory);
            });
        });

        describe('Fortune and Glory\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing', 'fortune-and-glory#hondos-luxury-yacht'],
                    },
                    player2: {
                        hand: ['takedown', 'no-glory-only-results'],
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        hasInitiative: true,
                    }
                });
            });

            it('', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.fortuneAndGlory);

                expect(context.player2).toHavePrompt('Collect Bounty: A friendly unit captures a non-leader unit');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.awing, context.chewbacca]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.greenSquadronAwing);

                expect(context.player1).toBeActivePlayer();
                expect(context.greenSquadronAwing).toBeCapturedBy(context.wampa);
            });

            it('', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.fortuneAndGlory);

                expect(context.player2).toHavePrompt('Collect Bounty: A friendly unit captures a non-leader unit');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.awing, context.chewbacca]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickPrompt('Pass');

                expect(context.player1).toBeActivePlayer();

                expect(context.greenSquadronAwing).toBeInZone('spaceArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');

                expect(context.awing).toBeInZone('spaceArena');
                expect(context.wampa).toBeInZone('groundArena');
            });

            it('', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.fortuneAndGlory);

                expect(context.player2).toHavePrompt('Collect Bounty: A friendly unit captures a non-leader unit');
                expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.awing, context.chewbacca]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickPrompt('Pass');

                expect(context.player1).toBeActivePlayer();

                expect(context.greenSquadronAwing).toBeInZone('spaceArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');

                expect(context.awing).toBeInZone('spaceArena');
                expect(context.wampa).toBeInZone('groundArena');
            });

            it('', function () {
                const { context } = contextRef;
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.fortuneAndGlory);

                expect(context.player1).toHavePrompt('Collect Bounty: A friendly unit captures a non-leader unit');
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine]);
                context.player1.clickCard(context.greenSquadronAwing);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.awing]);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeActivePlayer();
                expect(context.wampa).toBeCapturedBy(context.greenSquadronAwing);
            });
        });
    });
});
