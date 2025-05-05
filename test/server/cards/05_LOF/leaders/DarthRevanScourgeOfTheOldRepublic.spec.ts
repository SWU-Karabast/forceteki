describe('Darth Revan, Scourge of the Old Republic', function () {
    integration(function (contextRef) {
        describe('Darth Revan\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-revan#scourge-of-the-old-republic',
                        groundArena: ['battlefield-marine'],
                    },
                    player2: {
                        groundArena: [
                            'warzone-lieutenant',
                            'freelance-assassin',
                            'consular-security-force',
                            'wampa'
                        ],
                    },
                });
            });

            it('should give an experience to a friendly unit that attacks and defeats an enemy unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.warzoneLieutenant);

                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Trigger');

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience']);
            });
        });
    });
});
