describe('Sabine\'s Lightsaber, Not Alone', function() {
    integration(function(contextRef) {
        it('Sabine\'s Lightsaber\'s attach condition should be able to attach to non-Vehicle units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['sabines-lightsaber#not-alone'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.sabinesLightsaberNotAlone);
            expect(context.player1).toBeAbleToSelect(context.battlefieldMarine);
            context.player1.clickCard(context.battlefieldMarine);
        });

        describe('Sabine\'s Lightsaber\'s ability', function() {
            it('should give Restore 2 when attached to Sabine Wren', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'sabine-wren#explosives-artist', upgrades: ['sabines-lightsaber#not-alone'] }],
                        base: { card: 'echo-base', damage: 10 }
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);
                context.player1.clickPrompt('Restore 2');
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(8);
            });

            it('should give Restore 2 when attached to a Force unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'secretive-sage', upgrades: ['sabines-lightsaber#not-alone'] }],
                        base: { card: 'echo-base', damage: 10 }
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.secretiveSage);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(8);
            });

            it('should not give Restore 2 when attached to a non-Force unit or a non-Sabine Wren', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['sabines-lightsaber#not-alone'] }],
                        base: { card: 'echo-base', damage: 10 }
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(10);
            });
        });
    });
});
