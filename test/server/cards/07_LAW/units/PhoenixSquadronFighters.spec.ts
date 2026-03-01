describe('Phoenix Squadron Fighters', function() {
    integration(function(contextRef) {
        describe('Phoenix Squadron Fighters\'s ability', function() {
            it('should have no cost reduction when there are no damaged units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['phoenix-squadron-fighters'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        leader: 'chirrut-imwe#one-with-the-force'
                    },
                    player2: {
                        groundArena: [{ card: 'atst', damage: 1 }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.phoenixSquadronFighters);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(8);
            });

            it('should cost 1 resource less to play for each friendly damaged unit (1 friendly damaged unit)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['phoenix-squadron-fighters'],
                        groundArena: ['wampa', { card: 'battlefield-marine', damage: 1 }],
                        leader: 'chirrut-imwe#one-with-the-force'
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.phoenixSquadronFighters);
                expect(context.player1.exhaustedResourceCount).toBe(7);
            });

            it('should cost 1 resource less to play for each friendly damaged unit (multiple damaged unit, including leader, enemy and space units)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['phoenix-squadron-fighters'],
                        groundArena: ['wampa', { card: 'battlefield-marine', damage: 1 }],
                        spaceArena: [{ card: 'awing', damage: 1 }],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true, damage: 2 },
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: [{ card: 'phoenix-squadron-awing', damage: 1 }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.phoenixSquadronFighters);

                expect(context.player2).toBeActivePlayer();
                expect(context.player1.exhaustedResourceCount).toBe(5);
            });
        });
    });
});
