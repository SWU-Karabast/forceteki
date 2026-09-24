describe('Take Action', function () {
    integration(function (contextRef) {
        it('Take Action\'s ability should deal 3 damage to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-action'],
                    groundArena: ['battlefield-marine'],
                    base: 'tarkintown'
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['awing'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAction);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(3);
            expect(context.player1.exhaustedResourceCount).toBe(3);
        });

        it('Take Action\'s ability should costs 1 resource less by friendly leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-action'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    base: 'tarkintown'
                },
                player2: {
                    groundArena: ['wampa'],
                    leader: { card: 'darth-vader#dont-fail-me-again', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAction);
            expect(context.player1).toBeAbleToSelectExactly([context.chewbacca, context.darthVader, context.wampa]);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(3);
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('should cost 1 resource less for each of two deployed leaders in Faux Suns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    hand: ['take-action'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    secondLeader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    base: 'tarkintown'
                },
                player2: {
                    groundArena: ['wampa'],
                    leader: 'luke-skywalker#faithful-friend'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAction);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(3);
            // 2 friendly leader units → base cost 3 reduced by 2
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('should count a Darksaber-bearing unit as a friendly leader unit for its cost reduction', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-action'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    groundArena: [{ card: 'mace-windu#party-crasher', upgrades: ['the-darksaber#icon-of-leadership'] }],
                    base: 'tarkintown'
                },
                player2: {
                    groundArena: ['wampa'],
                    leader: 'luke-skywalker#faithful-friend'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAction);
            context.player1.clickCard(context.wampa);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.damage).toBe(3);
            // chewbacca (leader) + Mace with the Darksaber (a leader unit) = 2 leader units
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});
