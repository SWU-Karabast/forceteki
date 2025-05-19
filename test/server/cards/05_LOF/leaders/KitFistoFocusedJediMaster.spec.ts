describe('Kit Fisto, Focused Jedi Master', function() {
    integration(function(contextRef) {
        describe('Kit Fisto\'s undeployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                        groundArena: ['yoda#old-master', 'battlefield-marine', 'jedi-guardian'],
                        spaceArena: ['anakins-interceptor#where-the-fun-begins'],
                        leader: 'kit-fisto#focused-jedi-master'
                    },
                    player2: {
                        groundArena: ['count-dooku#fallen-jedi'],
                        spaceArena: ['alliance-xwing', 'padawan-starfighter'],
                        hand: ['traitorous']
                    }
                });
            });

            it('should be able to deal 2 damage to a unit if the controller has attack with a Jedi this phase', function () {
                const { context } = contextRef;

                // Attack with a Jedi unit
                context.player1.clickCard(context.jediGuardian);
                context.player1.clickCard(context.p2Base);

                // Use Kit Fisto's ability
                context.player2.passAction();
                context.player1.clickCard(context.kitFisto);
                context.player1.clickPrompt('If you attacked with a Jedi unit this phase, deal 2 damage to a unit');

                // Only units are selectable, deals 2 damage to the selected unit
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.jediGuardian, context.countDooku, context.allianceXwing, context.padawanStarfighter, context.anakinsInterceptor]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.countDooku);

                expect(context.kitFisto.exhausted).toBeTrue();
                expect(context.countDooku.damage).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should be able to deal 2 damage to a unit as stolen Jedi unit attacked this phase', function () {
                const { context } = contextRef;

                // Attack with a non Jedi unit
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.padawanStarfighter);

                const usedResourceCount = context.player1.exhaustedResourceCount;

                context.player2.passAction();
                context.player1.clickCard(context.padawanStarfighter);
                context.player1.clickCard(context.p2Base);

                // Use Kit Fisto's ability
                context.player2.passAction();
                context.player1.clickCard(context.kitFisto);
                context.player1.clickPrompt('If you attacked with a Jedi unit this phase, deal 2 damage to a unit');

                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.battlefieldMarine, context.jediGuardian, context.countDooku, context.allianceXwing, context.padawanStarfighter, context.anakinsInterceptor]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.allianceXwing);

                expect(context.kitFisto.exhausted).toBeTrue();
                expect(context.allianceXwing.damage).toBe(2);
                expect(context.player1.exhaustedResourceCount).toBe(usedResourceCount + 1);
            });

            it('should not be able to deal 2 damage to a unit as the controller hasn\'t attacked with a Jedi this phase', function () {
                const { context } = contextRef;

                // Attack with a non Jedi unit
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Use Kit Fisto's ability
                context.player2.passAction();
                context.player1.clickCard(context.kitFisto); // Ability does not trigger
                context.player1.clickPrompt('If you attacked with a Jedi unit this phase, deal 2 damage to a unit');

                expect(context.kitFisto.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should not be able to deal 2 damage to a unit as the controller hasn\'t attacked with a Jedi this phase, only the opponent', function () {
                const { context } = contextRef;

                // Attack with a non Jedi unit
                context.player1.passAction();
                context.player2.clickCard(context.padawanStarfighter);
                context.player2.clickCard(context.p1Base);

                // Use Kit Fisto's ability
                context.player1.clickCard(context.kitFisto); // Ability does not trigger
                context.player1.clickPrompt('If you attacked with a Jedi unit this phase, deal 2 damage to a unit');

                expect(context.kitFisto.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });

            it('should not be able to deal 2 damage to a unit as Jedi unit was stolen by the opponent', function () {
                const { context } = contextRef;

                // Attack with a non Jedi unit
                context.player1.passAction();
                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.yoda);
                context.player1.passAction();
                context.player2.clickCard(context.yoda);
                context.player2.clickCard(context.p1Base);

                // Use Kit Fisto's ability
                context.player1.clickCard(context.kitFisto); // Ability does not trigger
                context.player1.clickPrompt('If you attacked with a Jedi unit this phase, deal 2 damage to a unit');

                expect(context.kitFisto.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Kit Fisto\'s deployed ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['yoda#old-master', 'battlefield-marine', 'jedi-guardian'],
                        spaceArena: ['anakins-interceptor#where-the-fun-begins'],
                        leader: { card: 'kit-fisto#focused-jedi-master', deployed: true },
                    },
                    player2: {
                        groundArena: ['count-dooku#fallen-jedi'],
                        spaceArena: ['alliance-xwing', 'padawan-starfighter'],
                        hand: ['vanquish'],
                    }
                });
            });

            it('should have +1/+0 for each other friendly Jedi unit', function () {
                const { context } = contextRef;

                expect(context.kitFisto.getPower()).toBe(4); // 3 from the ability, 1 from the unit
                expect(context.kitFisto.getHp()).toBe(6); // Only power is modified by the ability

                context.player1.passAction();
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.jediGuardian);

                expect(context.kitFisto.getPower()).toBe(3); // 2 from the ability, 1 from the unit. Opponent's unit does not count
                expect(context.kitFisto.getHp()).toBe(6);
            });
        });
    });
});
