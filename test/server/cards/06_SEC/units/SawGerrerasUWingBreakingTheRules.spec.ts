describe('Saw Gerrera\'s U-Wing, Breaking the Rules', function() {
    integration(function(contextRef) {
        describe('Saw Gerrera\'s U-Wing\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing', 'saw-gerreras-uwing#breaking-the-rules']
                    },
                    player2: {
                        groundArena: ['specforce-soldier'],
                        spaceArena: ['avenger#hunting-star-destroyer', 'awing']
                    }
                });
            });

            it('should initiate an attack with another Aggression unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrerasUwing);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should initiate an attack with another Aggression unit (targetting unit)', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrerasUwing);
                context.player1.clickCard(context.awing);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
            });

            it('should does nothing if he does not survive', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sawGerrerasUwing);
                context.player1.clickCard(context.avenger);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});