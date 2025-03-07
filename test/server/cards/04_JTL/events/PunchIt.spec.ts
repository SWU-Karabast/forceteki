describe('Punch It', function () {
    integration(function (contextRef) {
        describe('Punch It\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['punch-it'],
                        groundArena: ['liberated-slaves', 'escort-skiff'],
                        spaceArena: ['millennium-falcon#piece-of-junk']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'guerilla-attack-pod'],
                        spaceArena: ['green-squadron-awing']
                    }
                });
            });

            it('should attack with a space Vehicle unit giving it +2/0 for the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.punchIt);

                expect(context.player1).toBeAbleToSelectExactly([context.escortSkiff, context.millenniumFalconPieceOfJunk]);

                context.player1.clickCard(context.millenniumFalconPieceOfJunk);

                expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.p2Base]);

                context.player1.clickCard(context.p2Base);

                // 3 damage from Millennium Falcon + 2 from Punch It
                expect(context.p2Base.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('should attack with a ground Vehicle unit giving it +2/0 for the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.punchIt);

                expect(context.player1).toBeAbleToSelectExactly([context.escortSkiff, context.millenniumFalconPieceOfJunk]);

                context.player1.clickCard(context.escortSkiff);

                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.guerillaAttackPod, context.p2Base]);

                context.player1.clickCard(context.p2Base);

                // 4 damage from Escort Skiff + 2 from Punch It
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});