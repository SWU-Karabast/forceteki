describe('Leia Organa, Defiant Princess', function() {
    integration(function(contextRef) {
        describe('Leia Organa, Defiant Princess\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['leia-organa#defiant-princess'],
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'jyn-erso#resisting-oppression', deployed: true }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: [{ card: 'alliance-xwing', exhausted: true }]
                    }
                });
            });

            it('should be able to ready a friendly resource', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                expect(context.player1).toHaveEnabledPromptButtons(['Ready a resource', 'Exhaust a unit']);
                const exhaustedResourcesBeforeAbility = context.player1.exhaustedResourceCount;
                context.player1.clickPrompt('Ready a resource');
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResourcesBeforeAbility - 1);
            });

            it('should be able to target any unit to exhaust', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Exhaust a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.leiaOrgana, context.atst, context.cartelSpacer, context.jynErso, context.wampa, context.allianceXwing]);
                expect(context.wampa.exhausted).toBe(false);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.exhausted).toBe(true);
            });
        });

        describe('Leia Organa, Defiant Princess\'s when played ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['leia-organa#defiant-princess']
                    }
                });
            });

            it('should do nothing if the controller selects "Exhaust a unit" when no other unit is on the field', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.leiaOrgana);
                context.player1.clickPrompt('Exhaust a unit');
                expect(context.player2).toBeActivePlayer();
                expect(context.leiaOrgana).toBeInZone('groundArena');
                expect(context.leiaOrgana.exhausted).toBe(true);
            });
        });
    });
});
