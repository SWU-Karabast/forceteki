describe('Admiral Ackbar, It\'s a Trap !', function () {
    integration(function (contextRef) {
        describe('Admiral Ackbar\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'admiral-ackbar#its-a-trap',
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: ['dqar-cargo-frigate'],
                        resources: 2
                    },
                    player2: {
                        groundArena: ['poe-dameron#quick-to-improvise'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should exhaust a friendly unit and create a xwing token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbar);
                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.dqarCargoFrigate, context.atst]);

                context.player1.clickCard(context.dqarCargoFrigate);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.dqarCargoFrigate.exhausted).toBeTrue();
                expect(context.player1.findCardsByName('xwing', 'spaceArena').length).toBe(1);
            });

            it('should exhaust an enemy unit and create a xwing token under his control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbar);
                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.dqarCargoFrigate, context.atst]);

                context.player1.clickCard(context.poeDameron);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.poeDameron.exhausted).toBeTrue();
                expect(context.player2.findCardsByName('xwing', 'spaceArena').length).toBe(1);
            });

            it('should exhaust an exhausted unit and not create any xwing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbar);
                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.dqarCargoFrigate, context.atst]);

                context.player1.clickCard(context.atst);
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.atst.exhausted).toBeTrue();
                expect(context.player1.findCardsByName('xwing', 'spaceArena').length).toBe(0);
            });
        });

        describe('Admiral Ackbar\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'admiral-ackbar#its-a-trap', deployed: true },
                        groundArena: [{ card: 'atst', exhausted: true }],
                        spaceArena: ['dqar-cargo-frigate'],
                    },
                    player2: {
                        groundArena: ['poe-dameron#quick-to-improvise'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
            });

            it('should exhaust a friendly unit and create a xwing token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.dqarCargoFrigate, context.atst]);

                context.player1.clickCard(context.dqarCargoFrigate);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.dqarCargoFrigate.exhausted).toBeTrue();
                expect(context.player1.findCardsByName('xwing', 'spaceArena').length).toBe(1);
            });

            it('should exhaust an enemy unit and create a xwing token under his control', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.dqarCargoFrigate, context.atst]);

                context.player1.clickCard(context.poeDameron);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.poeDameron.exhausted).toBeTrue();
                expect(context.player2.findCardsByName('xwing', 'spaceArena').length).toBe(1);
            });

            it('should exhaust an exhausted unit and not create any xwing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.admiralAckbar);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.poeDameron, context.dqarCargoFrigate, context.atst]);

                context.player1.clickCard(context.atst);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.atst.exhausted).toBeTrue();
                expect(context.player1.findCardsByName('xwing', 'spaceArena').length).toBe(0);
            });
        });
    });
});
