describe('Twin Suns Blast token', function () {
    integration(function (contextRef) {
        describe('Claim Blast token effect', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: [],
                        // Two cards so the regroup drawTwo (draw 2) doesn't trigger empty-deck damage
                        deck: ['battlefield-marine', 'wampa'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        hand: [],
                        // Two cards so the regroup drawTwo (draw 2) doesn't trigger empty-deck damage
                        deck: ['wampa', 'moment-of-peace'],
                    }
                });
            });

            it('deals 1 damage to the opponent\'s base and passes the turn', function () {
                const { context } = contextRef;

                expect(context.p2Base.damage).toBe(0);

                context.player1.clickPrompt('Claim Blast');

                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('player2 claiming Blast deals 1 damage to player1\'s base', function () {
                const { context } = contextRef;

                context.player1.clickPrompt('Claim Initiative');
                // player2 is now active
                context.player2.clickPrompt('Claim Blast');

                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(0);
            });
        });
    });
});
