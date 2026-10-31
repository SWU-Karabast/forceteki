describe('Twin Suns Blast counter', function () {
    integration(function (contextRef) {
        describe('Claim Blast counter effect', function () {
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

        describe('Blast counter base damage triggers', function () {
            it('triggers the defender\'s "when your base is dealt damage" ability (Blade Three)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    format: 'fauxSuns',
                    player1: {
                        leader: 'luke-skywalker#faithful-friend',
                        secondLeader: 'saw-gerrera#bring-down-the-empire',
                        base: 'kestro-city',
                        hand: [],
                        deck: ['battlefield-marine', 'wampa'],
                    },
                    player2: {
                        leader: 'darth-vader#dark-lord-of-the-sith',
                        base: 'administrators-tower',
                        spaceArena: ['blade-three#bane-of-the-devastator'],
                        hand: [],
                        deck: ['wampa', 'moment-of-peace'],
                    }
                });

                const { context } = contextRef;

                expect(context.p2Base.damage).toBe(0);
                expect(context.bladeThree).toHaveExactUpgradeNames([]);

                context.player1.clickPrompt('Claim Blast');

                // The Blast damage to player2's base triggers player2's Blade Three
                expect(context.p2Base.damage).toBe(1);
                expect(context.bladeThree).toHaveExactUpgradeNames(['advantage']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
