describe('Clan Challengers', function() {
    integration(function(contextRef) {
        describe('Clan Challengers\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'clan-challengers', upgrades: ['academy-training'] }]
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should give Overwhelm to itself when upgraded', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.clanChallengers);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(3); // 3 printed + 3 raid + 2 upgrade = 8, wampa has 5 hp
                expect(context.clanChallengers.exhausted).toBe(true);
                expect(context.clanChallengers.damage).toBe(4);
            });
        });

        describe('Clan Challengers\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['clan-challengers']
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should not give Overwhelm to itself when not upgraded', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.clanChallengers);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(0);
                expect(context.clanChallengers.exhausted).toBe(true);
                expect(context.clanChallengers.damage).toBe(4);
            });
        });
    });
});
