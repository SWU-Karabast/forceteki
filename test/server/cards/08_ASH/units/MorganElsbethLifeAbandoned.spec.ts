describe('Morgan Elsbeth, Life Abandoned', function () {
    integration(function (contextRef) {
        describe('When Defeated ability', function () {
            it('should give a unit -2/-2 for this phase when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rivals-fall'],
                        spaceArena: ['awing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['morgan-elsbeth#life-abandoned', 'wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.rivalsFall);
                context.player1.clickCard(context.morganElsbeth);

                expect(context.player2).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                expect(context.battlefieldMarine.getPower()).toBe(1);
                expect(context.battlefieldMarine.getHp()).toBe(1);
            });

            it('should give a unit -2/-2 for this phase when defeated (No Glory Only Results)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['no-glory-only-results'],
                        spaceArena: ['awing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['morgan-elsbeth#life-abandoned', 'wampa']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.noGloryOnlyResults);
                context.player1.clickCard(context.morganElsbeth);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.getHp()).toBe(3);
            });
        });
    });
});
