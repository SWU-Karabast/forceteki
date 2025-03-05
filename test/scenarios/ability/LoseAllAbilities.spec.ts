// From Comprehensive Rules v4.0, 8.15.2:
//     If an ability causes a card to "lose all abilities," the card ceases to have any
//     abilities, including abilities given to it by other cards, for the duration of the
//     "lose" effect. The card cannot gain abilities for the duration of the effect.
describe('Effects that cause a unit to "Lose All Abilities"', function() {
    integration(function(contextRef) {
        describe('For a specific duration', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        hand: [
                            'protector',
                            'vambrace-grappleshot',
                            'squad-support'
                        ],
                        groundArena: [
                            'academy-defense-walker',
                            'contracted-hunter',
                            'grogu#irresistible',
                            'battlefield-marine',
                            '97th-legion#keeping-the-peace-on-sullust'
                        ],
                        spaceArena: [
                            'strafing-gunship'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force'
                        ]
                    }
                });
            });

            // it('loses keyword abilities until the effect expires', function() {
            //     const { context } = contextRef;

            //     // Use Kazuda's ability on Academy Defense Walker
            //     context.player1.clickCard(context.kazudaXiono);
            //     context.player1.clickPrompt('Select a friendly unit');
            //     context.player1.clickCard(context.academyDefenseWalker);
            //     context.player1.passAction();

            //     // Academy Defense Walker no longer has Sentinel
            //     context.player2.clickCard(context.consularSecurityForce);
            //     expect(context.player2).toBeAbleToSelect(context.p1Base);
            //     context.player2.clickCard(context.p1Base);

            //     // Effect expires
            //     context.moveToNextActionPhase();
            //     context.player1.passAction();

            //     // Academy Defense Walker has Sentinel back
            //     context.player2.clickCard(context.consularSecurityForce);
            //     expect(context.player2).toBeAbleToSelectExactly([context.academyDefenseWalker]);
            //     context.player2.clickCard(context.academyDefenseWalker);
            // });

            // it('loses triggered abilities until the effect expires', function() {
            //     const { context } = contextRef;

            //     // Use Kazuda's ability on Contracted Hunter
            //     context.player1.clickCard(context.kazudaXiono);
            //     context.player1.clickPrompt('Select a friendly unit');
            //     context.player1.clickCard(context.contractedHunter);

            //     context.moveToNextActionPhase();

            //     // Contracted Hunter is still in play because his triggered ability was removed
            //     expect(context.contractedHunter).toBeInZone('groundArena');

            //     // Effect expires
            //     context.moveToNextActionPhase();

            //     // Contracted Hunter is defeated because his triggered ability is back
            //     expect(context.contractedHunter).toBeInZone('discard');
            // });

            // it('loses constant abilities until the effect expires', function() {
            //     const { context } = contextRef;

            //     // Use Kazuda's ability on Strafing Gunship
            //     context.player1.clickCard(context.kazudaXiono);
            //     context.player1.clickPrompt('Select a friendly unit');
            //     context.player1.clickCard(context.strafingGunship);

            //     // Attack with Strafing Gunship, it can only attack the base
            //     context.player1.clickCard(context.strafingGunship);
            //     expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            //     context.player1.clickCard(context.p2Base);

            //     // Effect expires
            //     context.moveToNextActionPhase();

            //     // Strafing Gunship can attack ground units again
            //     context.player1.clickCard(context.strafingGunship);
            //     expect(context.player1).toBeAbleToSelectExactly([
            //         context.p2Base,
            //         context.consularSecurityForce
            //     ]);
            //     context.player1.clickCard(context.consularSecurityForce);
            // });

            // it('loses action abilities until the effect expires', function() {
            //     const { context } = contextRef;

            //     // Use Kazuda's ability on Grogu
            //     context.player1.clickCard(context.kazudaXiono);
            //     context.player1.clickPrompt('Select a friendly unit');
            //     context.player1.clickCard(context.grogu);

            //     // Grogu no longer has an action ability
            //     context.player1.clickCard(context.grogu);

            //     expect(context.player1).not.toHaveEnabledPromptButton('Exhaust an enemy unit');
            //     expect(context.player1).toBeAbleToSelect(context.consularSecurityForce);

            //     context.player1.clickCard(context.consularSecurityForce);
            //     expect(context.consularSecurityForce.exhausted).toBeFalse();

            //     // Effect expires
            //     context.moveToNextActionPhase();

            //     // Grogu has his action ability back
            //     context.player1.clickCard(context.grogu);
            //     expect(context.player1).toHaveEnabledPromptButton('Exhaust an enemy unit');
            //     context.player1.clickPrompt('Exhaust an enemy unit');
            //     context.player1.clickCard(context.consularSecurityForce);
            //     expect(context.consularSecurityForce.exhausted).toBeTrue();
            // });

            // it('cannot gain new keyword abilities while the effect is active', function() {
            //     const { context } = contextRef;

            //     // Use Kazuda's ability on Academy Defense Walker
            //     context.player1.clickCard(context.kazudaXiono);
            //     context.player1.clickPrompt('Select a friendly unit');
            //     context.player1.clickCard(context.academyDefenseWalker);

            //     // Play Protector on Academy Defense Walker to attempt to give it Sentinel again
            //     context.player1.clickCard(context.protector);
            //     context.player1.clickCard(context.academyDefenseWalker);

            //     // Academy Defense Walker does not have Sentinel
            //     context.player2.clickCard(context.consularSecurityForce);
            //     expect(context.player2).toBeAbleToSelect(context.p1Base);
            //     context.player2.clickCard(context.p1Base);
            // });

            // it('cannot gain new triggered abilities while the effect is active', function() {
            //     const { context } = contextRef;

            //     // Use Kazuda's ability on Grogu
            //     context.player1.clickCard(context.kazudaXiono);
            //     context.player1.clickPrompt('Select a friendly unit');
            //     context.player1.clickCard(context.grogu);

            //     // Play Vambrace Grappleshot on Grogu to attempt to give it a triggered ability
            //     context.player1.clickCard(context.vambraceGrappleshot);
            //     context.player1.clickCard(context.grogu);

            //     context.player2.passAction();

            //     // Academy Defense Walker does not have the On Attack ability
            //     context.player1.clickCard(context.grogu);
            //     context.player1.clickCard(context.consularSecurityForce);

            //     expect(context.consularSecurityForce.exhausted).toBeFalse();
            // });

            it('cannot gain new constant abilities while the effect is active', function() {
                const { context } = contextRef;

                // Use Kazuda's ability on Grogu
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickPrompt('Select a friendly unit');
                context.player1.clickCard(context.grogu);

                // Play Squad Support on Grogu to attempt to give it a constant ability
                context.player1.clickCard(context.squadSupport);
                context.player1.clickCard(context.grogu);

                // Grogu does not have a power or HP boost
                expect(context.grogu.getPower()).toBe(0);
                expect(context.grogu.getHp()).toBe(5);

                // Effect expires
                context.moveToNextActionPhase();

                // Grogu has his power and HP boost
                expect(context.grogu.getPower()).toBe(2);
                expect(context.grogu.getHp()).toBe(7);
            });

            // it('cannot gain new action abilities while the effect is active', async function() {
            // });
        });
    });
});