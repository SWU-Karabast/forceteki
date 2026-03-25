describe('King Katuunko, Great King of Toydaria', function() {
    integration(function(contextRef) {
        describe('King Katuunko\'s ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['king-katuunko#great-king-of-toydaria', 'keep-fighting'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['awing'],
                        base: { card: 'mount-tantiss', damage: 10 }
                    }
                });
            });

            it('should give all units Restore 1 for the phase (opponent space unit)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kingKatuunko);

                context.player2.clickCard(context.awing);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(9);
            });

            it('should give all units Restore 1 for the phase (opponent ground unit)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kingKatuunko);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(9);
            });

            it('should give all units Restore 1 for the phase (friendly ground unit)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kingKatuunko);

                context.player2.passAction();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(9);
            });

            it('should give all units Restore 1 for the phase (friendly space unit)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kingKatuunko);

                context.player2.passAction();

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(9);
            });

            it('should give all units Restore 1 for the phase (King Katuunko)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kingKatuunko);

                context.player2.passAction();

                context.player1.clickCard(context.keepFighting);
                context.player1.clickCard(context.kingKatuunko);

                context.player2.passAction();

                context.player1.clickCard(context.kingKatuunko);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(9);
            });

            it('should only last for the phase it was played', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kingKatuunko);
                context.moveToNextActionPhase();

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(10);
            });

            it('should give all units Restore 1 for the phase (multiple attacks)', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.kingKatuunko);

                context.player2.clickCard(context.awing);
                context.player2.clickCard(context.greenSquadronAwing);

                expect(context.p1Base.damage).toBe(10);
                expect(context.p2Base.damage).toBe(9);

                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(9);
                expect(context.p2Base.damage).toBe(12);

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.battlefieldMarine);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(10);
                expect(context.p2Base.damage).toBe(11);
            });
        });
    });
});
