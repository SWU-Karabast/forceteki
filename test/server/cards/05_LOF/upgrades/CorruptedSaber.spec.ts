describe('Corrupted Saber', () => {
    integration(function (contextRef) {
        describe('Corrupted Saber\'s constant ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'corrupted-saber',
                        ],
                        groundArena: [
                            'kylo-ren#i-know-your-story',
                            'darth-maul#revenge-at-last',
                            'hylobon-enforcer'
                        ],
                        spaceArena: ['inferno-four#unforgetting'],
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine',
                            'consular-security-force',
                        ]
                    }
                });
            });

            it('if attached unit is a Force unit, on attack, the defender gets -2/-0 for the attack', function () {
                const { context } = contextRef;

                // Play Corrupted Saber
                context.player1.clickCard(context.corruptedSaber);

                // It can only target non-Vehicle units (including enemy units)
                expect(context.player1).toBeAbleToSelectExactly([
                    context.kyloRen,
                    context.darthMaul,
                    context.hylobonEnforcer,
                    context.battlefieldMarine,
                    context.consularSecurityForce
                ]);
                context.player1.clickCard(context.kyloRen);
                context.player2.passAction();

                // Player 1 attacks Consular Security Force with Kylo Ren
                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.consularSecurityForce);

                // Consular Security Force only did 1 damage, and its power returns to 3 after the attack
                expect(context.kyloRen.damage).toBe(1);
                expect(context.consularSecurityForce.getPower()).toBe(3);
            });

            it('if attached Force unit can attack multiple units simultaneously, all defenders get -2/-0 for each attack', function () {
                const { context } = contextRef;

                // Play Corrupted Saber
                context.player1.clickCard(context.corruptedSaber);

                // It can only target non-Vehicle units (including enemy units)
                expect(context.player1).toBeAbleToSelectExactly([
                    context.kyloRen,
                    context.darthMaul,
                    context.hylobonEnforcer,
                    context.battlefieldMarine,
                    context.consularSecurityForce
                ]);
                context.player1.clickCard(context.darthMaul);
                context.player2.passAction();

                // Player 1 attacks Battlefield Marine and Consular Security Force with Darth Maul
                context.player1.clickCard(context.darthMaul);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickDone();

                // Both defenders only did 1 damage each
                expect(context.darthMaul.damage).toBe(2);
            });

            it('if attached unit is not a Force unit, it does not apply the -2/-0 effect', function () {
                const { context } = contextRef;

                // Play Corrupted Saber
                context.player1.clickCard(context.corruptedSaber);

                // It can only target non-Vehicle units (including enemy units)
                expect(context.player1).toBeAbleToSelectExactly([
                    context.kyloRen,
                    context.darthMaul,
                    context.hylobonEnforcer,
                    context.battlefieldMarine,
                    context.consularSecurityForce
                ]);
                context.player1.clickCard(context.hylobonEnforcer);
                context.player2.passAction();

                // Player 1 attacks Consular Security Force with Hylobon Enforcer
                context.player1.clickCard(context.hylobonEnforcer);
                context.player1.clickCard(context.consularSecurityForce);

                // Consular Security Force did its full 3 damage
                expect(context.hylobonEnforcer.damage).toBe(3);
            });
        });
    });
});