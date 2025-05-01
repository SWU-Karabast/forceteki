describe('Common bases in Legens of the Force', function() {
    integration(function(contextRef) {
        describe('Triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'shadowed-undercity',
                        hand: [
                            'change-of-heart',
                            'luke-skywalker#you-still-with-me',
                        ],
                        groundArena: [
                            'guardian-of-the-whills',
                            'general-krell#heartless-tactician',
                            'battlefield-marine'
                        ],
                        spaceArena: [
                            'green-squadron-awing'
                        ]
                    },
                    player2: {
                        groundArena: [
                            'count-dooku#darth-tyranus'
                        ]
                    }
                });
            });

            it('gives the player The Force token when a friendly unit with the Force trait attacks', function () {
                const { context } = contextRef;

                // Ensure that no one has The Force token at the start
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2.hasTheForce).toBe(false);

                context.player1.clickCard(context.guardianOfTheWhills);
                context.player1.clickCard(context.p2Base);

                // Only Player 1 should have The Force token
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
            });

            it('works correctly if multiple friendly Force units attack', function () {
                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(false);

                context.player1.clickCard(context.guardianOfTheWhills);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hasTheForce).toBe(true);

                context.player2.passAction();
                context.player1.clickCard(context.generalKrell);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hasTheForce).toBe(true);
            });

            it('does not give The Force token if an enemy Force Unit attacks', function () {
                const { context } = contextRef;

                context.player1.passAction();

                // Ensure that no one has The Force token at the start
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2.hasTheForce).toBe(false);

                context.player2.clickCard(context.countDooku);
                context.player2.clickCard(context.p1Base);

                // Nobody should have The Force token
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2.hasTheForce).toBe(false);
            });

            it('does not give The Force token if a friendly non-Force unit attacks', function () {
                const { context } = contextRef;

                expect(context.player1.hasTheForce).toBe(false);

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player1.hasTheForce).toBe(false);
            });

            it('gives The Force token when an enemy Force unit is stolen, then attacks', function () {
                const { context } = contextRef;

                // Ensure that no one has The Force token at the start
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2.hasTheForce).toBe(false);

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.countDooku);

                context.player2.passAction();

                context.player1.clickCard(context.countDooku);
                context.player1.clickCard(context.p2Base);

                // Only Player 1 should have The Force token
                expect(context.player1.hasTheForce).toBe(true);
                expect(context.player2.hasTheForce).toBe(false);
            });

            it('does not give the Force token when a unit with a Force upagrade attacks', function () {
                const { context } = contextRef;

                // Play Luke Skywalker as a pilot on the A-Wing
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Play Luke Skywalker with Piloting');
                context.player1.clickCard(context.greenSquadronAwing);

                context.player2.passAction();

                // Attack with the A-Wing
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                // Nobody should have The Force token
                expect(context.player1.hasTheForce).toBe(false);
                expect(context.player2.hasTheForce).toBe(false);
            });
        });
    });
});
