describe('Eeth Koth, Spiritual Warrior', function () {
    integration(function (contextRef) {
        describe('Eeth Koth, Spiritual Warrior\'s ability', () => {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['eeth-koth#spiritual-warrior'],
                        hasForceToken: true
                    },
                    player2: {
                        hand: ['vanquish', 'no-glory-only-results'],
                        hasForceToken: true
                    }
                });
            });

            it('should allow the controller to use the force put it into play as a resource', function () {
                const { context } = contextRef;

                const resourcesBeforeTrigger = context.player1.resources.length;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.eethKothSpiritualWarrior);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force. If you do, put Eeth Koth into play as a resource.');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.resources.length).toBe(resourcesBeforeTrigger + 1);
                expect(context.eethKothSpiritualWarrior).toBeInZone('resource', context.player1);
                expect(context.eethKothSpiritualWarrior.exhausted).toBe(true);
                expect(context.player1).toBeActivePlayer();
            });

            it('should allow the controller to not use the force put it into play as a resource', function () {
                const { context } = contextRef;

                const resourcesBeforeTrigger = context.player1.resources.length;

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.eethKothSpiritualWarrior);

                expect(context.player1).toHavePassAbilityPrompt('Use the Force. If you do, put Eeth Koth into play as a resource.');
                context.player1.clickPrompt('Pass');

                expect(context.player1.resources.length).toBe(resourcesBeforeTrigger);
                expect(context.eethKothSpiritualWarrior).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should allow the controller to not use the force put it into play as a resource, No Glory Only Results interaction', function () {
                const { context } = contextRef;

                const resourcesBeforeTrigger = context.player2.resources.length;

                context.player1.passAction();
                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.eethKothSpiritualWarrior);

                expect(context.player2).toHavePassAbilityPrompt('Use the Force. If you do, put Eeth Koth into play as a resource.');
                context.player2.clickPrompt('Trigger');

                expect(context.player2.resources.length).toBe(resourcesBeforeTrigger + 1);
                expect(context.eethKothSpiritualWarrior).toBeInZone('resource', context.player2);
                expect(context.eethKothSpiritualWarrior.exhausted).toBe(true);
                expect(context.player1).toBeActivePlayer();
            });

            it('should allow the controller to not use the force put it into play as a resource, player doesn\'t have the Force token', function () {
                const { context } = contextRef;

                const resourcesBeforeTrigger = context.player1.resources.length;

                context.player1.setHasTheForce(false);
                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.eethKothSpiritualWarrior);

                expect(context.player1.resources.length).toBe(resourcesBeforeTrigger);
                expect(context.eethKothSpiritualWarrior).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
