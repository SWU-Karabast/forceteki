
describe('Qui-Gon Jinn, Student of the Living Force', function() {
    integration(function (contextRef) {
        describe('Qui-Gon Jinn\'s Leader side ability', function () {
            it('should only spend the force if you control no units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'qui-gon-jinn#student-of-the-living-force',
                        base: 'shadowed-undercity',
                        hasForceToken: true
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force'],
                    }
                });

                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(true);

                context.player1.clickCard(context.quiGonJinn);
                expect(context.player2).toBeActivePlayer();
                expect(context.quiGonJinn.exhausted).toBe(true);
                expect(context.player1.hasTheForce).toBe(false);
            });
        });

        // describe('Darth Maul\'s Unit side ability', function () {
        //     it('on attack, deals 1 damage to a unit and 1 damage to a different unit', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //                 leader: { card: 'darth-maul#sith-revealed', deployed: true },
        //             },
        //             player2: {
        //                 groundArena: ['battlefield-marine', 'consular-security-force'],
        //             }
        //         });

        //         const { context } = contextRef;

        //         // Attack with Darth Maul
        //         context.player1.clickCard(context.darthMaul);
        //         context.player1.clickCard(context.p2Base);

        //         // Darth Maul's ability should trigger
        //         expect(context.player1).toHavePrompt('Choose units to deal 1 damage to');
        //         expect(context.player1).toBeAbleToSelectExactly([
        //             context.battlefieldMarine,
        //             context.consularSecurityForce,
        //             context.darthMaul
        //         ]);

        //         context.player1.clickCard(context.battlefieldMarine);
        //         context.player1.clickCard(context.consularSecurityForce);

        //         expect(context.player1).toHaveEnabledPromptButton('Done');
        //         context.player1.clickPrompt('Done');

        //         // Check that the damage was dealt correctly
        //         expect(context.battlefieldMarine.damage).toBe(1);
        //         expect(context.consularSecurityForce.damage).toBe(1);
        //         expect(context.darthMaul.damage).toBe(0);
        //     });

        //     it('must damage himself if there are no other units in play', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //                 leader: { card: 'darth-maul#sith-revealed', deployed: true },
        //             }
        //         });

        //         const { context } = contextRef;

        //         // Attack with Darth Maul
        //         context.player1.clickCard(context.darthMaul);
        //         context.player1.clickCard(context.p2Base);

        //         // Darth Maul's ability should trigger
        //         expect(context.player1).toHavePrompt('Choose units to deal 1 damage to');
        //         expect(context.player1).toBeAbleToSelectExactly([
        //             context.darthMaul
        //         ]);

        //         context.player1.clickCard(context.darthMaul);

        //         // Ability is resolved immediately in this case
        //         expect(context.darthMaul.damage).toBe(1);
        //     });
        // });
    });
});
