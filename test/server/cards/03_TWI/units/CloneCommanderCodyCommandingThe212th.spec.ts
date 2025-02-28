describe('Clone Commander Cody, Commanding the 212th', function () {
    integration(function (contextRef) {
        describe('Clone Commander Cody\'s coordinate ability', function () {
            it('should give +1/+1 and overwhelm to other friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['echo-base-defender', 'clone-commander-cody#commanding-the-212th'],
                        hand: ['green-squadron-awing']
                    },
                    player2: {
                        spaceArena: ['distant-patroller']
                    }
                });

                const { context } = contextRef;

                // coordinate not activated
                expect(context.echoBaseDefender.getPower()).toBe(4);
                expect(context.echoBaseDefender.getHp()).toBe(3);

                expect(context.cloneCommanderCody.getPower()).toBe(4);
                expect(context.cloneCommanderCody.getHp()).toBe(4);

                // activate coordinate
                context.player1.clickCard(context.greenSquadronAwing);

                context.greenSquadronAwing.exhausted = false;
                context.player2.passAction();

                expect(context.greenSquadronAwing.getPower()).toBe(2);
                expect(context.greenSquadronAwing.getHp()).toBe(4);

                expect(context.echoBaseDefender.getPower()).toBe(5);
                expect(context.echoBaseDefender.getHp()).toBe(4);

                expect(context.cloneCommanderCody.getPower()).toBe(4);
                expect(context.cloneCommanderCody.getHp()).toBe(4);

                expect(context.distantPatroller.getPower()).toBe(2);
                expect(context.distantPatroller.getHp()).toBe(1);

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.distantPatroller);

                // green squadron awing should have deal damage to base with overwhelm
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });
        });
    });
});
