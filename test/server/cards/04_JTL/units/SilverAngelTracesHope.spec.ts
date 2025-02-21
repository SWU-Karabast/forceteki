describe('Silver Angel, Trace\'s Hope', function () {
    integration(function (contextRef) {
        it('Silver Angel\'s ability should deal 1 damage to a space unit when he\'s healed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['repair'],
                    spaceArena: [{ card: 'silver-angel#traces-hope', damage: 1 }, 'inferno-four#unforgetting']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                }
            });

            const { context } = contextRef;

            // heal silver angel
            context.player1.clickCard(context.repair);
            context.player1.clickCard(context.silverAngel);

            // can deal 1 damage to a space unit
            expect(context.player1).toBeAbleToSelectExactly([context.silverAngel, context.infernoFour, context.greenSquadronAwing]);

            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.damage).toBe(1);
        });

        it('Silver Angel\'s ability should deal 1 damage to a space unit when he\'s healed (more than 1 damage healed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['repair'],
                    spaceArena: [{ card: 'silver-angel#traces-hope', damage: 2 }, 'inferno-four#unforgetting']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                }
            });

            const { context } = contextRef;

            // heal silver angel
            context.player1.clickCard(context.repair);
            context.player1.clickCard(context.silverAngel);

            // can deal 1 damage to a space unit
            expect(context.player1).toBeAbleToSelectExactly([context.silverAngel, context.infernoFour, context.greenSquadronAwing]);

            context.player1.clickCard(context.greenSquadronAwing);
            expect(context.greenSquadronAwing.damage).toBe(1);
        });

        it('Silver Angel\'s ability should not deal damage if you heal 0 on silver angel', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: ['silver-angel#traces-hope', { card: 'inferno-four#unforgetting', damage: 1 }],
                    leader: { card: 'obiwan-kenobi#patient-mentor', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['green-squadron-awing'],
                }
            });

            const { context } = contextRef;

            // attack with obi wan
            context.player1.clickCard(context.obiwanKenobi);
            context.player1.clickCard(context.p2Base);

            // can heal 1 damage from unit but choose to heal 0 on silver angel
            context.player1.clickCard(context.silverAngel);

            // should not deal any damage
            expect(context.player2).toBeActivePlayer();
        });
    });
});
