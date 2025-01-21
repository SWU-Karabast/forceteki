
describe('MagnaGuard Wing Leader', function () {
    integration(function (contextRef) {
        it('MagnaGuard Wing Leader\'s ability should allow to attack with a droid unit and then another droid unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: [],
                    spaceArena: [{ card: 'magnaguard-wing-leader', exhausted: true }, 'squadron-of-vultures'],
                    groundArena: ['super-battle-droid', 'b1-security-team', 'wampa']
                },
                player2: {
                    spaceArena: ['droid-starfighter']
                }
            });

            const { context } = contextRef;

            // Player 1 can choose MagnaGuard Wing Leader action, even if exhausted
            context.player1.clickCard(context.magnaguardWingLeader);
            expect(context.player1).toBeAbleToSelectExactly([context.superBattleDroid, context.b1SecurityTeam, context.squadronOfVultures]);

            context.player1.clickCard(context.superBattleDroid);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);

            expect(context.player1).toBeAbleToSelectExactly([context.b1SecurityTeam, context.squadronOfVultures]);
            context.player1.clickCard(context.b1SecurityTeam);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(7);

            context.player2.passAction();

            // Player 1 can't choose MagnaGuard Wing Leader action again in the same round
            expect(context.player1).not.toBeAbleToSelect(context.magnaguardWingLeader);

            context.moveToNextActionPhase();
        });

        it('MagnaGuard Wing Leader\'s ability can\'t be used if it would have no game state changing effect', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: [],
                    spaceArena: [{ card: 'magnaguard-wing-leader', exhausted: true }, { card: 'squadron-of-vultures', exhausted: true }],
                    groundArena: [{ card: 'b1-security-team', exhausted: true }, 'wampa']
                },
                player2: {
                    groundArena: ['super-battle-droid'],
                    spaceArena: ['droid-starfighter']
                }
            });

            const { context } = contextRef;

            // Player 1 can't choose MagnaGuard Wing Leader action if it would have no game state changing effect
            expect(context.player1).not.toBeAbleToSelect(context.magnaguardWingLeader);
        });
    });
});
