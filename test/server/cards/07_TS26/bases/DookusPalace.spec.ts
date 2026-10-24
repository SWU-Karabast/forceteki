describe('Dooku\'s Palace', function() {
    integration(function(contextRef) {
        describe('Dooku\'s Palace\'s Epic Action', function() {
            it('should play a unit from hand with cost reduced by 1 for each friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dookus-palace',
                        leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: true },
                        hand: ['battlefield-marine', 'mastery', 'fulcrum', 'awing'],
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dookusPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.dookusPalace.epicActionSpent).toBeTrue();
            });

            it('should not decrease cost if there no friendly leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dookus-palace',
                        leader: { card: 'captain-rex#fighting-for-his-brothers', deployed: false },
                        hand: ['battlefield-marine', 'mastery', 'fulcrum', 'awing'],
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dookusPalace);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
                expect(context.player1).toHaveChooseNothingButton();
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('groundArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.dookusPalace.epicActionSpent).toBeTrue();
            });

            it('should reduce cost by 1 for each of two deployed leaders in Faux Suns', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        base: 'dookus-palace',
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        secondLeader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        hand: ['wampa'], // cost 4
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dookusPalace);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player1);
                // 2 friendly leader units → cost 4 reduced by 2
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.dookusPalace.epicActionSpent).toBeTrue();
            });

            it('should count a Darksaber-bearing unit as a friendly leader unit for its cost reduction', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'dookus-palace',
                        leader: { card: 'chewbacca#walking-carpet', deployed: true },
                        groundArena: [{ card: 'mace-windu#party-crasher', upgrades: ['the-darksaber#icon-of-leadership'] }],
                        hand: ['wampa'], // cost 4
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend'
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.dookusPalace);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player1);
                // chewbacca (leader) + Mace with the Darksaber (a leader unit) = 2 leader units
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.dookusPalace.epicActionSpent).toBeTrue();
            });
        });
    });
});
