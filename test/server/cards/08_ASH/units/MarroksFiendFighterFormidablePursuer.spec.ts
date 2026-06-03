describe('Marrok\'s Fiend Fighter, Formidable Pursuer', function() {
    integration(function(contextRef) {
        describe('Marrok\'s Fiend Fighter\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['marroks-fiend-fighter#formidable-pursuer'],
                    },
                    player2: {
                        spaceArena: ['awing'],
                    },
                });
            });

            it('should have no effect when attacking a non-damaged-unit', function () {
                const { context } = contextRef;

                // actions
                context.player1.clickCard(context.marroksFiendFighter);
                context.player1.clickCard(context.awing);

                // check board state
                expect(context.awing).toBeInZone('discard', context.player2);
                expect(context.marroksFiendFighter.damage).toBe(1);
                expect(context.marroksFiendFighter.getPower()).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Marrok\'s Fiend Fighter\'s ability with a damaged unit.', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['marroks-fiend-fighter#formidable-pursuer'],
                    },
                    player2: {
                        spaceArena: [{ card: 'awing', damage: 1 }],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },
                });
            });

            it('Marrok\'s Fiend Fighter should receive and +2/+0, defeating the Bright Hope and dealing 4 damage to opponents base.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.marroksFiendFighter);
                context.player1.clickCard(context.awing);

                // Check board state
                expect(context.awing).toBeInZone('discard', context.player2);
                expect(context.marroksFiendFighter.damage).toBe(1);
                expect(context.marroksFiendFighter.getPower()).toBe(3);
                expect(context.p2Base.damage).toBe(9);
                expect(context.player2).toBeActivePlayer();

                // Reset state
                context.player2.passAction();
                context.readyCard(context.marroksFiendFighter);

                // Case 2: Attacking base and not receiving +2/+0
                context.player1.clickCard(context.marroksFiendFighter);
                context.player1.clickCard(context.p2Base);

                // Check board state
                expect(context.marroksFiendFighter.exhausted).toBe(true);
                expect(context.marroksFiendFighter.damage).toBe(1);
                expect(context.p2Base.damage).toBe(12);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Marrok\'s Fiend Fighter\'s ability with support', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['marroks-fiend-fighter#formidable-pursuer'],
                        spaceArena: ['phoenix-squadron-awing']
                    },
                    player2: {
                        spaceArena: [{ card: 'awing', damage: 1 }],
                        base: { card: 'dagobah-swamp', damage: 5 }
                    },
                });
            });

            it('Marrok\'s Fiend Fighter should receive and +2/+0, defeating the Bright Hope and dealing 4 damage to opponents base.', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.marroksFiendFighter);
                context.player1.clickCard(context.phoenixSquadronAwing);
                context.player1.clickCard(context.awing);

                // Check board state
                expect(context.awing).toBeInZone('discard', context.player2);
                expect(context.phoenixSquadronAwing.damage).toBe(1);
                expect(context.phoenixSquadronAwing.getPower()).toBe(3);
                expect(context.p2Base.damage).toBe(9);
                expect(context.player2).toBeActivePlayer();

                // Reset state
                context.player2.passAction();
                context.readyCard(context.phoenixSquadronAwing);

                // Case 2: Attacking base and not receiving +2/+0
                context.player1.clickCard(context.phoenixSquadronAwing);
                context.player1.clickCard(context.p2Base);

                // Check board state
                expect(context.phoenixSquadronAwing.exhausted).toBe(true);
                expect(context.phoenixSquadronAwing.damage).toBe(1);
                expect(context.p2Base.damage).toBe(12);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});