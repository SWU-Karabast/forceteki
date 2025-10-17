describe('Emissaries from Ryloth', function () {
    integration(function (contextRef) {
        it('Emissaries from Ryloth\'s ability may give a unit -3/-0 for this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['emissaries-from-ryloth'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['strikeship'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.emissariesFromRyloth);

            expect(context.player1).toBeAbleToSelectExactly([context.emissariesFromRyloth, context.wampa, context.strikeship, context.battlefieldMarine, context.lukeSkywalkerFaithfulFriend]);
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickCard(context.wampa);

            expect(context.wampa.getPower()).toBe(1);
            expect(context.wampa.getHp()).toBe(5);

            context.moveToNextActionPhase();
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
        });
    });
});
