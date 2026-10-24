describe('Bug report game state serialization', function () {
    integration(function (contextRef) {
        beforeEach(async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                    discard: ['battlefield-marine', 'wampa', 'pyke-sentinel'],
                    deck: ['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper', 'viper-probe-droid']
                },
                player2: {
                    discard: ['frontier-atrt']
                }
            });
        });

        it('should serialize the discard pile top card first, matching the setup format', function () {
            const { context } = contextRef;

            // the zone stores the top card last, the setup format lists it first
            expect(context.player1.discard[context.player1.discard.length - 1]).toBe(context.battlefieldMarine);

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.discard).toEqual(['battlefield-marine', 'wampa', 'pyke-sentinel']);
            expect(state.player2.discard).toEqual(['frontier-atrt']);
        });

        it('should serialize a newly discarded card at the top of the discard pile', function () {
            const { context } = contextRef;

            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.p2Base);

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.discard).toEqual(['daring-raid', 'battlefield-marine', 'wampa', 'pyke-sentinel']);
        });

        it('should serialize the top five deck cards in setup order', function () {
            const { context } = contextRef;

            const state = context.game.captureGameState(context.player1.id);

            expect(state.player1.deck).toEqual(['atst', 'cartel-spacer', 'alliance-xwing', 'rebel-pathfinder', 'death-trooper']);
        });

        it('should serialize the reporting player as player1', function () {
            const { context } = contextRef;

            const state = context.game.captureGameState(context.player2.id);

            expect(state.player1.discard).toEqual(['frontier-atrt']);
            expect(state.player2.discard).toEqual(['battlefield-marine', 'wampa', 'pyke-sentinel']);
        });
    });
});
