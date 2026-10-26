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

        it('Enterprising Lackeys\' ability should defeat a resource of the player who controlled it and put it into that player\'s resources when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['enterprising-lackeys'],
                    resources: ['atst', 'cartel-spacer', 'pyke-sentinel', 'wampa']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    resources: ['superlaser-technician', 'battlefield-marine', 'wild-rancor', 'protector', 'devotion', 'restored-arc170', 'consular-security-force', 'alliance-xwing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.enterprisingLackeys);

            // player2 controlled Lackeys when they were defeated, so only player2's resources can be chosen
            expect(context.player2).toBeAbleToSelectExactly([
                context.superlaserTechnician,
                context.battlefieldMarine,
                context.wildRancor,
                context.protector,
                context.devotion,
                context.restoredArc170,
                context.consularSecurityForce,
                context.allianceXwing
            ]);
            expect(context.player2).toHavePassAbilityButton();
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.enterprisingLackeys).toBeInZone('resource', context.player2);
            expect(context.player2.resources.length).toBe(8);
            expect(context.player1.resources.length).toBe(4);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
