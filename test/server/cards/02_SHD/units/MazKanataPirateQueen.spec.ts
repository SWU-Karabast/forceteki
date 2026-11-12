describe('Maz Kanata, Pirate Queen', function() {
    integration(function(contextRef) {
        describe('Maz Kanata\'s triggered ability', function() {
            it('should give herself an Experience when another friendly unit is played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['battlefield-marine', 'maz-kanata#pirate-queen'],
                        leader: 'boba-fett#daimyo'
                    },
                    player2: {
                        hand: ['tieln-fighter']
                    }
                });
                const { context } = contextRef;

                // CASE 1: no upgrade when she is played
                context.player1.clickCard(context.mazKanata);
                expect(context.mazKanata.isUpgraded()).toBe(false);

                // CASE 2: opponent plays unit
                context.player2.clickCard(context.tielnFighter);
                expect(context.mazKanata.isUpgraded()).toBe(false);

                // CASE 3: we play unit
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.mazKanata).toHaveExactUpgradeNames(['experience']);

                // CASE 4: we deploy a leader
                context.player2.passAction();
                context.player1.clickCard(context.bobaFett);
                context.player1.clickPrompt('Deploy Boba Fett');
                expect(context.mazKanata).toHaveExactUpgradeNames(['experience']);
            });

            it('should not give herself an Experience when a unit is played with Piloting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['r2d2#artooooooooo'],
                        groundArena: ['maz-kanata#pirate-queen'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'boba-fett#daimyo'
                    },
                    player2: {
                        hand: ['tieln-fighter']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.r2d2);
                context.player1.clickPrompt('Play R2-D2 with Piloting');
                context.player1.clickCard(context.cartelSpacer);

                expect(context.mazKanata.isUpgraded()).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should give herself an Experience when her controller plays an opponent-owned unit from the discard pile with Stolen AT-Hauler', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['takedown'],
                    groundArena: ['maz-kanata#pirate-queen']
                },
                player2: {
                    spaceArena: ['stolen-athauler']
                }
            });
            const { context } = contextRef;

            // Defeat the opponent's Stolen AT-Hauler so player1 may play it from player2's discard pile
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('discard', context.player2);

            context.player2.passAction();

            context.player1.clickCard(context.stolenAthauler);
            expect(context.stolenAthauler).toBeInZone('spaceArena', context.player1);

            // Maz Kanata reacts to player1 playing the opponent-owned unit
            expect(context.mazKanata).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
