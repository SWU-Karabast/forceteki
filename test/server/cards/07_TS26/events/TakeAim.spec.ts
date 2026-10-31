describe('Take Aim', function () {
    integration(function (contextRef) {
        it('Take Aim\'s ability should initiate an attack and give +2/+0 and Saboteur', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-aim'],
                    groundArena: ['battlefield-marine'],
                    base: 'jabbas-palace'
                },
                player2: {
                    groundArena: ['niima-outpost-constables']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAim);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(5);
            expect(context.player1.exhaustedResourceCount).toBe(3);

            // second attack to confirm the effect is gone
            context.player2.passAction();
            context.readyCard(context.battlefieldMarine);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.niimaOutpostConstables]);
            context.player1.clickCard(context.niimaOutpostConstables);
            expect(context.niimaOutpostConstables.damage).toBe(3);
        });

        it('Take Aim\'s ability should costs 1 resource less by friendly leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-aim'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    base: 'jabbas-palace'
                },
                player2: {
                    groundArena: ['niima-outpost-constables'],
                    leader: { card: 'darth-vader#dont-fail-me-again', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAim);
            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.player1.exhaustedResourceCount).toBe(2);
        });

        it('should cost 1 resource less for each of two deployed leaders in Faux Suns', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    hand: ['take-aim'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    secondLeader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                    base: 'jabbas-palace'
                },
                player2: {
                    groundArena: ['niima-outpost-constables'],
                    leader: 'luke-skywalker#faithful-friend'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAim);
            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            // 2 friendly leader units → base cost 3 reduced by 2
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });

        it('should count a Darksaber-bearing unit as a friendly leader unit for its cost reduction', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-aim'],
                    leader: { card: 'chewbacca#walking-carpet', deployed: true },
                    groundArena: [{ card: 'mace-windu#party-crasher', upgrades: ['the-darksaber#icon-of-leadership'] }],
                    base: 'jabbas-palace'
                },
                player2: {
                    groundArena: ['niima-outpost-constables'],
                    leader: 'luke-skywalker#faithful-friend'
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.takeAim);
            context.player1.clickCard(context.chewbacca);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            // chewbacca (leader) + Mace with the Darksaber (a leader unit) = 2 leader units
            expect(context.player1.exhaustedResourceCount).toBe(1);
        });
    });
});
