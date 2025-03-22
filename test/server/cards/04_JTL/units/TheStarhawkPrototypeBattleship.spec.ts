describe('The Starhawk, Prototype Battleship', function() {
    integration(function(contextRef) {
        describe('Starhawk\'s constant ability', function() {
            it('should decrease the play cost of a card at pay time by half, rounded up', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'captain-rex#fighting-for-his-brothers',
                        hand: ['raddus#holdos-final-command'],
                        spaceArena: ['the-starhawk#prototype-battleship']
                    },
                    player2: {
                        leader: 'admiral-trench#chkchkchkchk',
                        base: 'tarkintown',
                        hand: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.raddus);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });
        });
    });
});
