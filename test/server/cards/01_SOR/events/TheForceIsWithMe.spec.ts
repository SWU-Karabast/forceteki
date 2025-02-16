describe('The Force is With Me', function() {
    integration(function(contextRef) {
        describe('The Force is With Me\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-force-is-with-me'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: 'chirrut-imwe#one-with-the-force'
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('should give 2 experience and attack, if no force unit present', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theForceIsWithMe);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience']);
                expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.p2Base]);
                expect(context.player1).toHavePassAttackButton();

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
                expect(context.wampa.exhausted).toBe(true);
            });
        });

        describe('The Force is With Me\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-force-is-with-me'],
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true, exhausted: true }
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('should give 2 experience, a shield, and then attack, if a force unit is present', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theForceIsWithMe);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.tielnFighter, context.chirrutImwe]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);
                expect(context.wampa).toHaveExactUpgradeNames(['experience', 'experience', 'shield']);
                expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.p2Base]);
                expect(context.player1).toHavePassAttackButton();

                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(6);
                expect(context.wampa.exhausted).toBe(true);
            });

            it('should work if the unit can\'t attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theForceIsWithMe);
                context.player1.clickCard(context.chirrutImwe);
                expect(context.chirrutImwe).toHaveExactUpgradeNames(['experience', 'experience', 'shield']);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('The Force is With Me\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-force-is-with-me'],
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('should do nothing if no legal target', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theForceIsWithMe);
                expect(context.theForceIsWithMe).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
