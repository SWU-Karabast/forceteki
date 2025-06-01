describe('Ahsoka Tano Fighting For Peace', function() {
    integration(function(contextRef) {
        it('Ahsoka Tano\'s undeployed ability should give a friendly unit Sentinel for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'ahsoka-tano#fighting-for-peace',
                    hasForceToken: true,
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing'],
                    resources: 3
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst']
                }
            });
            const { context } = contextRef;
            const { player1, player2 } = context;

            player1.clickCard(context.ahsokaTanoFightingForPeace);

            // give sentinel to a friendly unit
            expect(player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
            player1.clickCard(context.wampa);

            // force token should be used
            expect(player2).toBeActivePlayer();
            expect(player1.hasTheForce).toBeFalse();
            expect(context.ahsokaTano.exhausted).toBeTrue();

            // wampa should be a sentinel
            player2.clickCard(context.battlefieldMarine);
            expect(player2).toBeAbleToSelectExactly([context.wampa]);
            player2.clickCard(context.wampa);

            context.moveToNextActionPhase();
            player1.passAction();

            // next turn, wampa is not sentinel anymore
            player2.clickCard(context.atst);
            expect(player2).toBeAbleToSelectExactly([context.wampa, context.p1Base]);
            player2.clickCard(context.p1Base);
        });

        it('Ahsoka Tano\'s deployed ability should give a friendly unit Sentinel for the phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'ahsoka-tano#fighting-for-peace', deployed: true },
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst']
                }
            });
            const { context } = contextRef;
            const { player1, player2 } = context;

            // attack with ahsoka
            player1.clickCard(context.ahsokaTano);
            player1.clickCard(context.p2Base);

            // give sentinel to a friendly unit
            expect(player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing, context.ahsokaTano]);
            expect(player1).toHavePassAbilityButton();
            player1.clickCard(context.wampa);

            expect(player2).toBeActivePlayer();

            // wampa should be a sentinel
            player2.clickCard(context.battlefieldMarine);
            expect(player2).toBeAbleToSelectExactly([context.wampa]);
            player2.clickCard(context.wampa);

            context.moveToNextActionPhase();
            player1.passAction();

            // next turn, wampa is not sentinel anymore
            player2.clickCard(context.atst);
            expect(player2).toBeAbleToSelectExactly([context.wampa, context.p1Base, context.ahsokaTano]);
            player2.clickCard(context.p1Base);
        });
    });
});