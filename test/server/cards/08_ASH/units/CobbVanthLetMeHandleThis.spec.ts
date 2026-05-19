describe('Cobb Vanth, Let Me Handle This', function() {
    integration(function(contextRef) {
        describe('Triggered ability when a basic unit is played', function() {
            it('should deal 2 damage to self and give a shield to the played unit when undamaged', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: ['cobb-vanth#let-me-handle-this']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to this unit. If you do, give a Shield token to that unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.cobbVanth.damage).toBe(2);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });

            it('should not trigger when unit are played as upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chewbacca#faithful-first-mate'],
                        groundArena: ['cobb-vanth#let-me-handle-this'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca with Piloting');
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.cobbVanth.damage).toBe(0);
                expect(context.awing).toHaveExactUpgradeNames(['chewbacca#faithful-first-mate']);
            });

            it('should trigger when Pilot unit are played as unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chewbacca#faithful-first-mate'],
                        groundArena: ['cobb-vanth#let-me-handle-this'],
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chewbacca);
                context.player1.clickPrompt('Play Chewbacca');

                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to this unit. If you do, give a Shield token to that unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.cobbVanth.damage).toBe(2);
                expect(context.chewbacca).toHaveExactUpgradeNames(['shield']);
            });

            it('should absorb damage with shield and still give shield to played unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: [{ card: 'cobb-vanth#let-me-handle-this', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to this unit. If you do, give a Shield token to that unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.cobbVanth.damage).toBe(0);
                expect(context.cobbVanth).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });

            it('should be defeated when taking damage at 4 health and still give shield to played unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine'],
                        groundArena: [{ card: 'cobb-vanth#let-me-handle-this', damage: 4 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to this unit. If you do, give a Shield token to that unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toBeActivePlayer();
                expect(context.cobbVanth).toBeInZone('discard');
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });

            it('should not trigger when playing a non-basic unit (leader)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'boba-fett#collecting-the-bounty',
                        groundArena: ['cobb-vanth#let-me-handle-this']
                    }
                });

                const { context } = contextRef;

                // Deploy the leader (leaders are not basic units)
                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Deploy Boba Fett');

                // No trigger for deploying leader (non-basic unit)
                expect(context.cobbVanth.damage).toBe(0);
            });

            it('should not trigger when opponent plays a basic unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['wampa'],
                        groundArena: ['cobb-vanth#let-me-handle-this']
                    },
                    player2: {
                        hand: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);

                // No trigger for opponent's unit - pass the action back
                expect(context.player1).toBeActivePlayer();
                expect(context.cobbVanth.damage).toBe(0);
                context.player1.passAction();
            });

            it('should not trigger when playing Cobb Vanth himself', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['cobb-vanth#let-me-handle-this']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.cobbVanth);

                // No trigger for playing Cobb Vanth himself
                expect(context.player2).toBeActivePlayer();
                expect(context.cobbVanth.damage).toBe(0);
            });
        });
    });
});
