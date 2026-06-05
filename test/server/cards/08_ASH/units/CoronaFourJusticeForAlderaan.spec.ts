describe('Corona Four, Justice for Alderaan', function() {
    integration(function(contextRef) {
        describe('On Attack ability', function() {
            it('may give a unit -2/-0 for this phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['corona-four#justice-for-alderaan']
                    },
                    player2: {
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.coronaFour);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.coronaFour, context.allianceXwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.getPower()).toBe(0);
                expect(context.allianceXwing.getHp()).toBe(3);

                context.moveToNextActionPhase();

                expect(context.allianceXwing.getPower()).toBe(2);
                expect(context.allianceXwing.getHp()).toBe(3);
            });

            it('may be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['corona-four#justice-for-alderaan']
                    },
                    player2: {
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.coronaFour);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give a unit -2/-0 for this phase');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.allianceXwing.getPower()).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When Defeated ability', function() {
            it('may defeat a non-leader unit with 0 power', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['corona-four#justice-for-alderaan']
                    },
                    player2: {
                        hand: ['takedown'],
                        spaceArena: ['alliance-xwing'],
                        groundArena: ['wampa'],
                        leader: { card: 'grogu#charming-companion', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.coronaFour);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.getPower()).toBe(0);
                expect(context.player2).toBeActivePlayer();

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.coronaFour);

                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.allianceXwing);

                expect(context.coronaFour).toBeInZone('discard');
                expect(context.allianceXwing).toBeInZone('discard');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.grogu).toBeInZone('groundArena', context.player2);
            });
        });
    });
});
