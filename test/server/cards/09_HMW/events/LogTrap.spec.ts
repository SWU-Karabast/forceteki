describe('Log Trap', function() {
    integration(function(contextRef) {
        it('Log Trap\'s ability should attack with a unit and then attack with it again', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['log-trap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.logTrap);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.rebelPathfinder, context.atst]);
            context.player1.clickCard(context.p2Base);

            context.player1.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.atst]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.rebelPathfinder);

            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.p2Base.damage).toBe(3);
            expect(context.rebelPathfinder).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Log Trap\'s ability should attack with a unit and then not break if there are no legal targets for 2nd attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['log-trap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.logTrap);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.player1).toBeAbleToSelectExactly([context.p2Base]);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });

        it('Log Trap\'s ability should attack with a unit and then not break if it dies in first attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['log-trap'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom']
                },
                player2: {
                    groundArena: ['rebel-pathfinder', 'atst'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.logTrap);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.lurkingTiePhantom]);
            expect(context.player1).not.toHaveChooseNothingButton();
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickCard(context.battlefieldMarine);

            context.player1.clickCard(context.atst);

            expect(context.atst.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
            expect(context.battlefieldMarine).toBeInZone('discard');
        });
    });
});