describe('One Way Out', function () {
    integration(function (contextRef) {
        it('One Way Out\'s ability should initiate an attack, give +1/+0 and Overwhelm, and remove abilities for the attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-way-out'],
                    groundArena: ['gifted-urchin']
                },
                player2: {
                    groundArena: ['chirrut-imwe#blind-but-not-deaf', 'rebel-pathfinder'],
                    hasForceToken: true,
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.oneWayOut);
            context.player1.clickCard(context.giftedUrchin);

            expect(context.player1).toBeAbleToSelectExactly([context.chirrutImweBlindButNotDeaf]);
            context.player1.clickCard(context.chirrutImweBlindButNotDeaf);
            expect(context.chirrutImweBlindButNotDeaf.damage).toBe(2);

            // second attack to confirm the effect is gone
            context.player2.passAction();
            context.readyCard(context.giftedUrchin);
            context.player1.clickCard(context.giftedUrchin);

            expect(context.player1).toBeAbleToSelectExactly([context.chirrutImweBlindButNotDeaf]);
            context.player1.clickCard(context.chirrutImweBlindButNotDeaf);
            context.player2.clickPrompt('Trigger');
            expect(context.chirrutImweBlindButNotDeaf.damage).toBe(2);
        });

        it('One Way Out\'s ability should initiate an attack, give +1/+0 and Overwhelm, and remove abilities for the attack (specifically checking for Overwhelm)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-way-out'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'porg'],
                    hasForceToken: true,
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.oneWayOut);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.porg, context.p2Base]);
            context.player1.clickCard(context.rebelPathfinder);
            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.p2Base.damage).toBe(1);

            // second attack to confirm the effect is gone
            context.player2.passAction();
            context.readyCard(context.battlefieldMarine);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.porg);

            expect(context.p2Base.damage).toBe(1);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('One Way Out\'s ability should initiate an attack, give +1/+0 and Overwhelm, and not freak out when attacking the base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-way-out'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'porg'],
                    hasForceToken: true,
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.oneWayOut);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.porg, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);
        });
    });
});