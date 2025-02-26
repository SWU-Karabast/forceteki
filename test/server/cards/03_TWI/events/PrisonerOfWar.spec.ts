describe('Prisoner of War', function() {
    integration(function(contextRef) {
        describe('Prisoner of War\'s event ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['prisoner-of-war'],
                        groundArena: ['ezra-bridger#resourceful-troublemaker'],
                        spaceArena: ['millennium-falcon#piece-of-junk'],
                    },
                    player2: {
                        groundArena: ['pyke-sentinel', 'gideon-hask#ruthless-loyalist'],
                        spaceArena: ['inferno-four#unforgetting'],
                        leader: { card: 'director-krennic#aspiring-to-authority', deployed: true }
                    }
                });
            });

            it('should allow a friendly unit to capture an enemy non-leader, non-vehicle unit generating 2 battle droid tokens because the captured unit costs less', () => {
                const { context } = contextRef;

                context.player1.clickCard(context.prisonerOfWar);
                expect(context.player1).toBeAbleToSelectExactly([context.ezraBridger, context.millenniumFalcon]);

                context.player1.clickCard(context.millenniumFalcon);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.gideonHask]);

                context.player1.clickCard(context.pykeSentinel);

                expect(context.player2).toBeActivePlayer();
                expect(context.pykeSentinel).toBeCapturedBy(context.millenniumFalcon);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(2);
                expect(battleDroids).toAllBeInZone('groundArena', context.player1);
                expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            });

            it('should allow a friendly unit to capture an enemy non-leader, non-vehicle unit not generating 2 battle droid tokens because the captured unit does not cost less', () => {
                const { context } = contextRef;

                context.player1.clickCard(context.prisonerOfWar);
                expect(context.player1).toBeAbleToSelectExactly([context.ezraBridger, context.millenniumFalcon]);

                context.player1.clickCard(context.ezraBridger);
                expect(context.player1).toBeAbleToSelectExactly([context.pykeSentinel, context.gideonHask]);

                context.player1.clickCard(context.gideonHask);

                expect(context.player2).toBeActivePlayer();
                expect(context.gideonHask).toBeCapturedBy(context.ezraBridger);

                const battleDroids = context.player1.findCardsByName('battle-droid');
                expect(battleDroids.length).toBe(0);
            });
        });
    });
});
