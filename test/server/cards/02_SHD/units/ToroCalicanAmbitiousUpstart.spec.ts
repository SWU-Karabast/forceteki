describe('Toro Calican, Ambitious Upstart', function() {
    integration(function(contextRef) {
        describe('Toro Calican\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'toro-calican#ambitious-upstart',
                            'reputable-hunter',
                            'ketsu-onyo#old-friend',
                            'greedo#slow-on-the-draw',
                            'embo#stoic-and-resolute',
                            'hunter-of-the-haxion-brood'
                        ],
                        spaceArena: ['tieln-fighter'],
                        leader: 'the-mandalorian#sworn-to-the-creed'
                    },
                    player2: {
                        hand: ['dengar#the-demolisher', 'consular-security-force'],
                        groundArena: ['hylobon-enforcer']
                    }
                });
            });

            it('should deal 1 damage to the played Bounty Hunter unit and ready himself (once per round)', function () {
                const { context } = contextRef;

                // CASE 1: play Toro Calican, ability does not trigger
                context.player1.clickCard(context.toroCalican);
                expect(context.player2).toBeActivePlayer();
                context.player2.passAction();

                // CASE 2: play friendly Bounty Hunter, ability triggers, pass
                context.player1.clickCard(context.reputableHunter);
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to the played Bounty Hunter unit');
                context.player1.clickPrompt('Pass');
                expect(context.reputableHunter.damage).toBe(0);
                expect(context.toroCalican.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();

                // CASE 3: play enemy Bounty Hunter, ability does not trigger
                context.player2.clickCard(context.dengar);
                expect(context.player1).toBeActivePlayer();
                expect(context.dengar.damage).toBe(0);
                expect(context.toroCalican.exhausted).toBeTrue();

                // CASE 4: deployed friendly Bounty Hunter leader, ability does not trigger
                context.player1.clickCard(context.theMandalorian);
                expect(context.player2).toBeActivePlayer();
                expect(context.theMandalorian.damage).toBe(0);
                expect(context.toroCalican.exhausted).toBeTrue();

                context.player2.passAction();

                // CASE 5: play friendly Bounty Hunter, ability triggers
                context.player1.clickCard(context.ketsuOnyo);
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to the played Bounty Hunter unit');
                context.player1.clickPrompt('Trigger');
                expect(context.ketsuOnyo.damage).toBe(1);
                expect(context.toroCalican.exhausted).toBeFalse();

                context.exhaustCard(context.toroCalican);
                context.player2.passAction();

                // CASE 6: play another friendly Bounty Hunter, ability does not trigger due to limit
                context.player1.clickCard(context.greedo);
                expect(context.player2).toBeActivePlayer();
                expect(context.greedo.damage).toBe(0);
                expect(context.toroCalican.exhausted).toBeTrue();

                context.moveToNextActionPhase();
                context.readyCard(context.toroCalican);

                // CASE 7: play friendly Bounty Hunter next phase,
                // ability triggers and can be activated even though Toro is not exhausted
                context.player1.clickCard(context.embo);
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to the played Bounty Hunter unit');
                context.player1.clickPrompt('Trigger');
                expect(context.embo.damage).toBe(1);
                expect(context.toroCalican.exhausted).toBeFalse();

                context.moveToNextActionPhase();
                context.exhaustCard(context.toroCalican);

                // CASE 8: shield replacement effect should activate "if you do" ability
                context.player1.clickCard(context.hunterOfTheHaxionBrood);
                context.player1.clickPrompt('Shielded');
                context.player1.clickPrompt('Trigger');

                expect(context.hunterOfTheHaxionBrood.isUpgraded()).toBeFalse();
                expect(context.hunterOfTheHaxionBrood.damage).toBe(0);
                expect(context.toroCalican.exhausted).toBeFalse();
            });
        });
    });
});
