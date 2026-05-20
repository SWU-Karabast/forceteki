describe('Protectorate Fighter', function () {
    integration(function (contextRef) {
        describe('Protectorate Fighter\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['protectorate-fighter'],
                        groundArena: ['liberated-slaves'],
                    },
                    player2: {
                        groundArena: ['grand-inquisitor#youre-right-to-be-afraid']
                    }
                });
            });

            it('should not create a Mandalorian token as we do not control a unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.protectorateFighter);

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Protectorate Fighter\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['protectorate-fighter'],
                        groundArena: ['yoda#old-master']
                    },
                    player2: {
                        groundArena: ['liberated-slaves'],
                    }
                });
            });

            it('should create a Mandalorian token as we control a unique unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.protectorateFighter);

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena');
                expect(mandalorians[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});