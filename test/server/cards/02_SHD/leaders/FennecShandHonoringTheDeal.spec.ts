describe('Fennec Shand, Honoring the Deal', function () {
    integration(function (contextRef) {
        describe('Fennec Shand\'s undeployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: 'fennec-shand#honoring-the-deal',
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'clone-combat-squadron'],
                        resources: 5
                    },
                    player2: {
                        groundArena: ['isb-agent'],
                    },
                });
            });

            it('should allow the player to play a unit with cost 4 or less, paying its cost, and give it ambush', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit that costs 4 or less from your hand. Give it ambush for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing, context.cloneCombatSquadron]);

                context.player1.clickCard(context.rebelPathfinder);
                expect(context.fennecShand.exhausted).toBeTrue();
                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(3);
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.isbAgent);
                expect(context.rebelPathfinder.exhausted).toBeTrue();
                expect(context.rebelPathfinder.damage).toBe(1);
                expect(context.isbAgent.damage).toBe(2);
            });

            it('should not allow the player to select a unit that cannot be played', function () {
                const { context } = contextRef;

                context.player1.exhaustResources(context.player1.readyResourceCount - 4);

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit that costs 4 or less from your hand. Give it ambush for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);
                expect(context.cloneCombatSquadron).not.toHaveAvailableActionWhenClickedBy(context.player1);

                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.hasSomeKeyword('ambush')).toBeTrue();
            });

            it('should not give ambush when choosing nothing', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit that costs 4 or less from your hand. Give it ambush for this phase');
                context.player1.clickPrompt('Choose nothing');

                expect(context.rebelPathfinder).toBeInZone('hand');
                expect(context.rebelPathfinder.hasSomeKeyword('ambush')).toBeFalse();
                expect(context.allianceXwing).toBeInZone('hand');
                expect(context.allianceXwing.hasSomeKeyword('ambush')).toBeFalse();
                expect(context.cloneCombatSquadron).toBeInZone('hand');
                expect(context.cloneCombatSquadron.hasSomeKeyword('ambush')).toBeFalse();
            });
        });

        describe('Fennec Shand\'s deployed ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'echo-base',
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'modded-cohort'],
                        resources: 8
                    },
                    player2: {
                        groundArena: ['isb-agent', 'battlefield-marine'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
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
                expect(context.rebelPathfinder).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(2); // no extra cost
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                // ambush isb agent
                context.player1.clickPrompt('Trigger');
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
                expect(context.moddedCohort).toBeInZone('groundArena');
                expect(context.player1.exhaustedResourceCount).toBe(6); // no extra cost
                expect(context.player1).toHavePassAbilityPrompt('Ambush');

                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.moddedCohort.exhausted).toBeTrue();
                expect(context.moddedCohort.damage).toBe(3);
                expect(context.battlefieldMarine.zoneName).toBe('discard');

                // empty hand
                context.player2.passAction();
                context.player1.clickCard(context.allianceXwing);
                context.player2.passAction();

                // hand is empty, can not use fennec ability to soft pass
                expect(context.fennecShand).not.toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Fennec Shand\'s deployed ability', function () {
            it('should not allow the player to play a unit with cost 4 or less when he does not have any targetable units in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['reinforcement-walker'],
                        resources: 8
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickCard(context.p2Base);

                expect(context.fennecShand.exhausted).toBeTrue();
                expect(context.fennecShand).not.toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.p2Base.damage).toBe(4);
            });

            it('should not allow the player to select a unit that cannot be played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'clone-combat-squadron'],
                        resources: 3
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit that costs 4 or less from your hand. Give it ambush for this phase');
                expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.allianceXwing]);
                expect(context.cloneCombatSquadron).not.toHaveAvailableActionWhenClickedBy(context.player1);

                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing.hasSomeKeyword('ambush')).toBeTrue();
            });

            it('should not give ambush when choosing nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'fennec-shand#honoring-the-deal', deployed: true },
                        hand: ['reinforcement-walker', 'rebel-pathfinder', 'alliance-xwing', 'clone-combat-squadron'],
                        resources: 8
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.fennecShand);
                context.player1.clickPrompt('Play a unit that costs 4 or less from your hand. Give it ambush for this phase');
                context.player1.clickPrompt('Choose nothing');

                expect(context.rebelPathfinder).toBeInZone('hand');
                expect(context.rebelPathfinder.hasSomeKeyword('ambush')).toBeFalse();
                expect(context.allianceXwing).toBeInZone('hand');
                expect(context.allianceXwing.hasSomeKeyword('ambush')).toBeFalse();
                expect(context.cloneCombatSquadron).toBeInZone('hand');
                expect(context.cloneCombatSquadron.hasSomeKeyword('ambush')).toBeFalse();
            });
        });
    });
});
