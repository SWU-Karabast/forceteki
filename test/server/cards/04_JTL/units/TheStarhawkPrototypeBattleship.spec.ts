describe('The Starhawk, Prototype Battleship', function() {
    integration(function(contextRef) {
        describe('Starhawk\'s constant ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'captain-rex#fighting-for-his-brothers',
                        hand: ['raddus#holdos-final-command'],
                        spaceArena: ['the-starhawk#prototype-battleship'],
                        groundArena: ['crosshair#following-orders']
                    },
                    player2: {
                        leader: 'admiral-trench#chkchkchkchk',
                        base: 'tarkintown',
                        hand: ['wampa'],
                        spaceArena: ['fetts-firespray#pursuing-the-bounty']
                    }
                });
            });

            it('should decrease the play cost of a card at pay time by half, rounded up', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.raddus);
                expect(context.player1.exhaustedResourceCount).toBe(4);
            });

            it('should decrease the activation cost of a leader ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.captainRex);
                context.player1.clickPrompt('If a friendly unit attacked this phase, create a Clone Trooper token.');
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should decrease the activation cost of a unit ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.crosshair);
                context.player1.clickPrompt('Get +1/+0 for this phase');
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should not affect opponent\'s play card costs', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.wampa);
                expect(context.player2.exhaustedResourceCount).toBe(4);
            });

            it('should not affect opponent\'s leader ability costs', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.admiralTrench);
                context.player2.clickPrompt('Deploy Admiral Trench');
                expect(context.player2.exhaustedResourceCount).toBe(3);

                context.allowTestToEndWithOpenPrompt = true;
            });

            it('should not affect opponent\'s unit ability costs', function() {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.fettsFirespray);
                context.player2.clickPrompt('Exhaust a non-unique unit');
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });
        });
    });
});
