describe('Fennec Shand, Honoring the Deal', function () {
    integration(function (contextRef) {
        describe('Fennec Shand\'s undeployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: 'fennec-shand#honoring-the-deal',
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'wampa'],
                        resources: 4
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    }
                });
            });

            it('should allow the player to play a unit with cost 4 or less, paying its cost, and give it ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing, context.wampa]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.fennecShand.exhausted).toBeTrue();
                expect(context.rebelPathfinder).toBeInLocation('ground arena');
                expect(context.player1.countExhaustedResources()).toBe(3);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Ambush');
                expect(context.rebelPathfinder.exhausted).toBeTrue();
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });
        });

        describe('Fennec Shand\'s deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'modded-cohort'],
                        resources: 8
                    },
                    player2: {
                        groundArena: ['isb-agent', 'battlefield-marine'],
                    }
                });
            });

            it('should allow the player to play a unit with cost 4 or less, paying its cost, and give it ambush (multiple times)', function () {
                const { context } = contextRef;

                // use fennec ability to play a unit with ambush (should not exhaust fennec)
                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit that costs 4 or less from your hand. Give it ambush for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing, context.moddedCohort]);

                // play rebel pathfinder
                context.player1.clickCard(context.rebelPathfinder);
                expect(context.rebelPathfinder).toBeInLocation('ground arena');
                expect(context.player1.countExhaustedResources()).toBe(2); // no extra cost
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                // ambush isb agent
                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.isbAgent);
                expect(context.fennecShand.exhausted).toBeFalse();
                expect(context.rebelPathfinder.exhausted).toBeTrue();
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);

                context.player2.passAction();

                // attack with fennec (to exhaust her)
                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                context.player2.passAction();

                // use fennec ability to play a unit with ambush (even if fennec is exhausted)
                context.player1.clickCard(context.fennecShand);
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.moddedCohort]);
                context.player1.clickCard(context.moddedCohort);

                // play a unit who already has Ambush
                expect(context.moddedCohort).toBeInLocation('ground arena');
                expect(context.player1.countExhaustedResources()).toBe(6); // no extra cost
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Ambush');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.moddedCohort.exhausted).toBeTrue();
                expect(context.moddedCohort.damage).toBe(3);
                expect(context.battlefieldMarine.location).toBe('discard');
            });
        });

        describe('Fennec Shand\'s deployed ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['reinforcement-walker'],
                        resources: 8
                    },
                    player2: { }
                });
            });

            it('should not allow the player to play a unit with cost 4 or less when he does not have any targetable units in hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                expect(context.player1).not.toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player2).toBeActivePlayer();
                expect(context.fennecShand.exhausted).toBeTrue();
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});
