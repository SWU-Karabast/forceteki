describe('Chirrut Imwe, I Don\'t Need Luck', function() {
    integration(function(contextRef) {
        describe('Chirrut Imwe\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        hand: ['one-way-out', 'bravado'],
                        groundArena: [{ card: 'chirrut-imwe#i-dont-need-luck', damage: 2 }, { card: 'atst', damage: 5 }],
                    },
                    player2: {
                        groundArena: ['atat-suppressor', 'battlefield-marine'],
                    }
                });
            });

            it('should heal 4 damage from another unit if he dealt combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.atatSuppressor, context.battlefieldMarine]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
            });

            it('should heal 4 damage from another unit if he dealt combat damage to a base via Overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.oneWayOut);
                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.atatSuppressor]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
            });

            it('should not trigger if he did not deal combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if he dealt combat damage to a base on a previous attack', function () {
                const { context } = contextRef;

                // first attack - damage a base
                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.atatSuppressor, context.battlefieldMarine]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);

                // re-ready Chirrut
                context.player2.passAction();
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.chirrutImwe);

                // second attack - no base damage
                context.player2.passAction();
                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger even if he is defeated during the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.oneWayOut);
                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.atatSuppressor);

                expect(context.atatSuppressor).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(1);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.battlefieldMarine]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
            });

            it('should not trigger if another friendly unit deals combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Chirrut Imwe\'s on attack ability should heal 4 damage from another unit if he dealt combat damage to a base via "direct" Overwhelm', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    hand: ['one-way-out'],
                    groundArena: [{ card: 'chirrut-imwe#i-dont-need-luck', damage: 2, upgrades: ['vambrace-flamethrower'] }, { card: 'atst', damage: 5 }],
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.oneWayOut);
            context.player1.clickCard(context.chirrutImwe);
            context.player1.clickCard(context.battlefieldMarine);

            // need to click the Flamethrower trigger because Saboteur is in the same window
            context.player1.clickPrompt('Deal 3 damage divided as you choose among enemy ground units');

            // trigger flamethrower to defeat Battlefield Marine and at "on attack" step
            context.player1.setDistributeDamagePromptState(new Map([
                [context.battlefieldMarine, 3],
            ]));

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(1);
        });
    });
});
