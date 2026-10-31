describe('Rhokai Gunship', function() {
    integration(function(contextRef) {
        describe('Rhokai Gunship\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['rhokai-gunship']
                    },
                    player2: {
                        spaceArena: ['green-squadron-awing'],
                    }
                });
            });

            it('should deal 1 damage to a unit or a base.', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // kill rhokai gunship
                context.player2.clickCard(context.greenSquadronAwing);
                context.player2.clickCard(context.rhokaiGunship);

                // select a unit or a base
                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine, context.p1Base, context.p2Base]);
                expect(context.player1).not.toHaveChooseNothingButton();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });
        });

        it('Rhokai Gunship\'s ability should be resolved by the player who controlled it when defeated by No Glory, Only Results', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['rhokai-gunship']
                },
                player2: {
                    hand: ['no-glory-only-results'],
                    spaceArena: ['green-squadron-awing'],
                    hasInitiative: true
                }
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.rhokaiGunship);

            expect(context.rhokaiGunship).toBeInZone('discard', context.player1);
            expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing, context.battlefieldMarine, context.p1Base, context.p2Base]);
            expect(context.player2).not.toHaveChooseNothingButton();
            context.player2.clickCard(context.p1Base);

            expect(context.p1Base.damage).toBe(1);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player1).toBeActivePlayer();
        });
    });
});
