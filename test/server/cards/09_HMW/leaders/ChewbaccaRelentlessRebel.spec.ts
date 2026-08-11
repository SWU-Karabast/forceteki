describe('Chewbacca, Relentless Rebel', function () {
    integration(function (contextRef) {
        const promptAbility = 'Attack with a unit, even if it\'s exhausted. It can\'t attack bases for this attack';

        it('Chewbacca\'s leader side ability should initiate an attack with a unit. It cannot attack base for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#relentless-rebel',
                    hand: ['bravado'],
                    groundArena: ['wampa', { card: 'atst', exhausted: true }],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['porg', 'yoda#old-master']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            context.player1.clickPrompt(promptAbility);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.porg, context.yoda]);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.chewbacca.exhausted).toBeTrue();

            context.player2.passAction();

            context.player1.clickCard(context.bravado);
            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.yoda]);
            context.player1.clickCard(context.p2Base);
        });

        it('Chewbacca\'s leader side ability should initiate an attack with an exhausted unit. It cannot attack base for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'chewbacca#relentless-rebel',
                    groundArena: ['lothwolf', { card: 'atst', exhausted: true }],
                    resources: 2
                },
                player2: {
                    groundArena: ['porg', 'yoda#old-master']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            // we cannot select Loth Wolf, this unit can't attack
            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);
            expect(context.player1).toBeAbleToSelectExactly([context.porg, context.yoda]);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.atst.exhausted).toBeTrue();
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.chewbacca.exhausted).toBeTrue();
        });

        it('Chewbacca\'s leader unit side ability should initiate an attack with a unit (even if it\'s exhausted). It cannot attack base for this attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'chewbacca#relentless-rebel', deployed: true },
                    hand: ['bravado'],
                    groundArena: ['wampa', { card: 'atst', exhausted: true }],
                    spaceArena: ['awing']
                },
                player2: {
                    groundArena: ['porg', 'yoda#old-master']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Cancel', promptAbility]);
            context.player1.clickPrompt(promptAbility);

            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.chewbacca, context.atst]);
            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.porg, context.yoda]);
            context.player1.clickCard(context.porg);

            expect(context.player2).toBeActivePlayer();
            expect(context.wampa.exhausted).toBeTrue();
            expect(context.chewbacca.exhausted).toBeFalse();

            context.player2.passAction();

            context.player1.clickCard(context.chewbacca);
            expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            context.moveToNextActionPhase();

            context.player1.clickCard(context.chewbacca);
            expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Cancel', promptAbility]);
            context.player1.clickPrompt('Cancel');
        });
    });
});
