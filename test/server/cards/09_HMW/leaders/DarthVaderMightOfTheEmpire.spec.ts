describe('Darth Vader, Might of the Empire', function () {
    integration(function (contextRef) {
        describe('Darth Vader\'s leader side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#mightof-the-empire',
                        groundArena: ['yoda#old-master', 'wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should grant Raid 1 to a friendly unit that costs exactly 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });

            it('should not grant Raid 1 to a friendly unit that costs less than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
            });

            it('should grant Raid 1 to a friendly unit that costs more than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
            });

            it('should not grant Raid 1 to the opponent\'s units', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(6);
            });
        });

        describe('Darth Vader\'s leader unit side ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'darth-vader#mightof-the-empire', deployed: true },
                        groundArena: ['yoda#old-master', 'wampa'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should grant Raid 1 to another friendly unit that costs exactly 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });

            it('should not grant Raid 1 to the leader unit itself', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVader);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
            });

            it('should not grant Raid 1 to another friendly unit that costs less than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
            });

            it('should grant Raid 1 to another friendly unit that costs more than 3', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.wampa);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
            });

            it('should not grant Raid 1 to the opponent\'s units', function () {
                const { context } = contextRef;

                context.player1.passAction();

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(6);
            });
        });
    });
});
