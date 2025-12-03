describe('Enterprising Lackeys', function() {
    integration(function(contextRef) {
        describe('Enterprising Lackeys\'s when defeated ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['enterprising-lackeys'],
                        resources: ['superlaser-technician', 'battlefield-marine', 'wild-rancor', 'protector', 'devotion', 'restored-arc170']
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true,
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
            });

            it('should defeat a resource and put this card as resource', function () {
                const { context } = contextRef;

                context.exhaustCard(context.battlefieldMarine);
                context.player2.clickCard(context.vanquish);

                // select a resource to defeat
                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickCard(context.superlaserTechnician);

                // superlaser technician should be defeated and lackeys should be in resource
                expect(context.superlaserTechnician).toBeInZone('discard');
                expect(context.enterprisingLackeys).toBeInZone('resource');
                expect(context.enterprisingLackeys.exhausted).toBe(true);

                // battlefield marine should not be exhausted because we defeat a non-exhausted resource
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.player1.readyResourceCount).toBe(5);

                expect(context.player1).toBeActivePlayer();
            });

            it('should not put this card as resource if we do not defeat a resource', function () {
                const { context } = contextRef;

                context.player2.clickCard(context.vanquish);

                // select a resource to defeat
                expect(context.player1).toBeAbleToSelectExactly([context.superlaserTechnician, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).not.toHaveChooseNothingButton();

                context.player1.clickPrompt('Pass');

                // as we pass nothing happen
                expect(context.enterprisingLackeys).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Enterprising Lackeys\' ability should fizzle if moved to resources by Arquitens', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['swoop-down'],
                    spaceArena: ['arquitens-assault-cruiser'],
                },
                player2: {
                    groundArena: ['enterprising-lackeys'],
                    resources: ['superlaser-technician', 'battlefield-marine', 'wild-rancor', 'protector', 'devotion', 'restored-arc170']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.swoopDown);
            context.player1.clickCard(context.arquitensAssaultCruiser);
            context.player1.clickCard(context.enterprisingLackeys);

            expect(context.player1).toHaveExactPromptButtons(['You', 'Opponent']);
            context.player1.clickPrompt('You');

            // Lackeys defeat still happens but the "if you do" part fizzles
            expect(context.player2).toBeAbleToSelectExactly([context.superlaserTechnician, context.battlefieldMarine, context.wildRancor, context.protector, context.devotion, context.restoredArc170]);
            context.player2.clickCard(context.superlaserTechnician);

            expect(context.player2).toBeActivePlayer();
            expect(context.player2.resources.length).toBe(5);
            expect(context.superlaserTechnician).toBeInZone('discard');
            expect(context.enterprisingLackeys).toBeInZone('resource', context.player1);
        });
    });
});
