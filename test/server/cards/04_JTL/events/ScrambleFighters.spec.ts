describe('Scramble Fighters', function() {
    integration(function(contextRef) {
        describe('Scrambled Fighters\' event ability', function() {
            it('should create 8 readied TIE fighters', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['scramble-fighters']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.scrambleFighters);

                const tieFighters = context.player1.findCardsByName('tie-fighter');
                expect(tieFighters.length).toBe(8);
                expect(tieFighters).toAllBeInZone('spaceArena');
                expect(tieFighters.every((tieFighter) => tieFighter.exhausted)).toBeFalse();
                expect(context.player2.getArenaCards().length).toBe(0);
            });

            it('should create TIE fighters that cannot attack the base the phase they were created', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['scramble-fighters']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.scrambleFighters);
                const tieFighters = context.player1.findCardsByName('tie-fighter');

                context.player2.passAction();
                context.player1.clickCard(tieFighters[7]);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);

                context.player2.passAction();
                context.player1.clickCard(tieFighters[6]);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);
            });

            it('should create TIE fighters that can attack the base the phase after they were created', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['scramble-fighters']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.scrambleFighters);
                const tieFighters = context.player1.findCardsByName('tie-fighter');
                context.moveToNextActionPhase();

                context.player1.clickCard(tieFighters[7]);
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.p2Base]);
                context.player1.clickCard(context.p2Base);
            });
        });
    });
});
