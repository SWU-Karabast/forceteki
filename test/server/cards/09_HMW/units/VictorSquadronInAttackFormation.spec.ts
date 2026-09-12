describe('Victor Squadron, In Attack Formation', function () {
    integration(function (contextRef) {
        describe('Victor Squadron\'s ability', function () {
            it('should enter play ready when played from hand and be able to attack immediately', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['victor-squadron#in-attack-formation'],
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.victorSquadron);
                expect(context.victorSquadron).toBeInZone('spaceArena');
                expect(context.victorSquadron.exhausted).toBeFalse();
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();

                // attack in the same phase it was played
                context.player1.clickCard(context.victorSquadron);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
                expect(context.victorSquadron.exhausted).toBeTrue();
                expect(context.player2).toBeActivePlayer();
            });

            it('should enter play ready when rescued from capture', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish']
                    },
                    player2: {
                        spaceArena: [{ card: 'cartel-spacer', capturedUnits: ['victor-squadron#in-attack-formation'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.cartelSpacer);

                expect(context.victorSquadron).toBeInZone('spaceArena', context.player1);
                expect(context.victorSquadron.exhausted).toBeFalse();
            });

            it('should enter play ready when played from discard', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['palpatines-return'],
                        discard: ['victor-squadron#in-attack-formation']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.palpatinesReturn);
                context.player1.clickCard(context.victorSquadron);

                expect(context.victorSquadron).toBeInZone('spaceArena');
                expect(context.victorSquadron.exhausted).toBeFalse();
            });
        });
    });
});
