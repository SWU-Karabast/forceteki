describe('Enterprising Lackeys', function() {
    integration(function(contextRef) {
        describe('Enterprising Lackeys\'s when defeated ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['enterprising-lackeys'],
                        resources: ['wampa', 'battlefield-marine', 'wild-rancor', 'protector', 'devotion', 'restored-arc170']
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true,
                    }
                });
            });

            it('should defeat a resource and put this card as resource', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);

                // select a resource to defeat
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.wampa);

                // wampa should be defeated and lackeys should be in resource
                expect(context.wampa).toBeInZone('discard');
                expect(context.enterprisingLackeys).toBeInZone('resource');
                expect(context.player1).toBeActivePlayer();
            });

            it('should not put this card as resource if we do not defeat a resource', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);

                // select a resource to defeat
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickPrompt('Pass ability');

                // as we pass nothing happen
                expect(context.enterprisingLackeys).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
