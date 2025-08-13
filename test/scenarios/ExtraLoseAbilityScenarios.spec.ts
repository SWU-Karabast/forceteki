// From Comprehensive Rules v4.0, 8.15.2:
//   If an ability causes a card to "lose all abilities," the card ceases to have any
//   abilities, including abilities given to it by other cards, for the duration of the
//   "lose" effect. The card cannot gain abilities for the duration of the effect.
describe('Lose All Abilities', function() {
    integration(function(contextRef) {
        describe('Some meta-relavant and edge cases worth covering:', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', deployed: true },
                        hand: [
                            'sneak-attack',
                            'ruthless-raider',
                            'trench-run',
                            'traitorous'
                        ],
                        spaceArena: [
                            'millennium-falcon#piece-of-junk',
                            'fireball#an-explosion-with-wings'
                        ]
                    },
                    player2: {
                        hand: [
                            'takedown'
                        ],
                        groundArena: [
                            'consular-security-force',
                            'val#loyal-to-the-end'
                        ],
                        deck: [
                            'devastator#inescapable',
                            'ma-klounkee'
                        ]
                    }
                });
            });

            it('SOR Millennium Falcon\'s tax can be avoided by removing its ability for the round', function() {
                const { context } = contextRef;

                // Attack with Kazuda to activate ability
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.p2Base);

                // Choose Millennium Falcon to remove its ability
                context.player1.clickCard(context.millenniumFalcon);
                context.player1.clickDone();

                // Move to next action phase
                context.moveToNextActionPhase();

                // Falcon tax was not paid
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // Effect has expired, move to next phase
                context.moveToRegroupPhase();

                // Resource
                context.player1.clickDone();
                context.player2.clickDone();

                // Falcon tax is back
                expect(context.player1).toHaveEnabledPromptButtons(['Pay 1 resource', 'Return this unit to her owner\'s hand']);
                context.player1.clickPrompt('Pay 1 resource');
                expect(context.player1).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('if Ruthless Raider\'s abilities are removed for the round, its when-defeated will not trigger if it dies during the regroup phase', function() {
                const { context } = contextRef;

                // Sneak Attack Ruthless Raider
                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.p2Base.damage).toBe(2);

                context.player2.passAction();

                // Attack with Kazuda to remove Ruthless Raider's abilities (and others to suppress prompts)
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.millenniumFalcon);
                context.player1.clickCard(context.fireball);
                context.player1.clickDone();

                // Move to the regroup phase
                context.moveToRegroupPhase();

                // Ruthless Raider is defeated and Player 2's base took no more damage
                expect(context.ruthlessRaider).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(2);
            });

            it('can remove negative effects of events like Trench Run', function() {
                const { context } = contextRef;

                // Attack with Kazuda to remove Fireball's ability
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.fireball);
                context.player1.clickDone();

                context.player2.passAction();

                // Play Trench Run on Fireball
                context.player1.clickCard(context.trenchRun);
                context.player1.clickCard(context.fireball);
                context.player1.clickCard(context.p2Base);

                // Fireball attacked with the buff (3 + 4), but cards were not discarded and it took no damage
                expect(context.p2Base.damage).toBe(7);
                expect(context.fireball.damage).toBe(0);

                expect(context.devastator).toBeInZone('deck');
                expect(context.maKlounkee).toBeInZone('deck');
            });

            it('can remove a bounty from a stolen unit', function() {
                const { context } = contextRef;

                // Play traitorous to steal Val
                context.player1.clickCard(context.traitorous);
                context.player1.clickCard(context.val);
                context.player2.passAction();

                // Attack with Kazuda to remove Val's abilities
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.consularSecurityForce);
                context.player1.clickCard(context.val);
                context.player1.clickDone();

                // Player 2 defeats Val with takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.val);

                // No abilities to resolve
                expect(context.player2).not.toHaveExactPromptButtons(['You', 'Opponent']);

                context.moveToRegroupPhase();
            });
        });
    });
});