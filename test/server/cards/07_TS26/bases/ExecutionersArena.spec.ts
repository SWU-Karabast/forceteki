describe('Executioner\'s Arena', function() {
    integration(function(contextRef) {
        describe('Executioner\'s Arena\'s Epic Action', function() {
            it('should deal 2 damage to a unit for each friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'executioners-arena',
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        groundArena: ['wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.executionersArena);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.awing, context.darthVader, context.chewbacca]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.executionersArena.epicActionSpent).toBeTrue();
            });

            it('should not deal damage when there are no friendly leader units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'executioners-arena',
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.executionersArena);
                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.executionersArena.epicActionSpent).toBeTrue();
            });

            it('should deal 2 damage once for each of two deployed leaders in Faux Suns', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        base: 'executioners-arena',
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        secondLeader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.executionersArena);
                // 2 friendly leader units → 2 separate "deal 2 damage" selections
                context.player1.clickCardNonChecking(context.wampa);
                context.player1.clickCardNonChecking(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.executionersArena.epicActionSpent).toBeTrue();
            });

            it('should count a Darksaber-bearing unit as a friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'executioners-arena',
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        groundArena: [{ card: 'mace-windu#party-crasher', upgrades: ['the-darksaber#icon-of-leadership'] }],
                    },
                    player2: {
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.executionersArena);
                // chewbacca (leader) + Mace with the Darksaber (a leader unit) = 2 leader units → 2 selections
                context.player1.clickCardNonChecking(context.wampa);
                context.player1.clickCardNonChecking(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.damage).toBe(2);
                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.executionersArena.epicActionSpent).toBeTrue();
            });
        });
    });
});
