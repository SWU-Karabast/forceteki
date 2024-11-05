describe('Wanted', function() {
    integration(function(contextRef) {
        describe('Wanted\'s Bounty ability', function() {
            it('should ready 2 resources', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['wanted'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player2.exhaustResources(3);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toHavePassAbilityPrompt('Bounty: Ready two friendly resources');
                context.player2.clickPrompt('Bounty: Ready two friendly resources');
                expect(context.player2.countExhaustedResources()).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should ready 1 resource if only 1 is exhausted', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['wanted'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player2.exhaustResources(1);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toHavePassAbilityPrompt('Bounty: Ready two friendly resources');
                context.player2.clickPrompt('Bounty: Ready two friendly resources');
                expect(context.player2.countExhaustedResources()).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should skip ability prompt if there are no exhausted resources', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['wanted'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
