describe('It Binds All Things', function() {
    integration(function(contextRef) {
        describe('It Binds All Things\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['it-binds-all-things'],
                        groundArena: ['yoda#old-master'],
                        leader: { card: 'leia-organa#alliance-general', deployed: true, damage: 2 }
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['tieln-fighter'],
                        leader: { card: 'han-solo#audacious-smuggler', deployed: true }
                    }
                });
            });

            it('should heal damage from one unit and deal damage to another unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.itBindsAllThings);

                // select card to give healing
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.leiaOrgana, 2],
                ]));

                // select target for damage since yoda is a force user.
                expect(context.player1).toHaveEnabledPromptButton('Pass ability');
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.tielnFighter, context.hanSolo, context.yoda, context.leiaOrgana]);
                context.player1.clickCard(context.atst);

                // check board state
                expect(context.leiaOrgana.damage).toBe(0);
                expect(context.atst.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('should perform heal from one unit without damage and not deal damage to another unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.itBindsAllThings);

                // select card to give healing
                expect(context.player1).toBeAbleToSelectExactly([context.yoda, context.leiaOrgana, context.atst, context.tielnFighter, context.hanSolo]);
                expect(context.player1).toHaveChooseNoTargetButton();
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.yoda, 3],
                ]));

                // check board state
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('It binds all thing\'s ability, when no force user is present', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['it-binds-all-things'],
                        groundArena: [{ card: 'moisture-farmer', damage: 3 }]
                    },
                    player2: {
                        groundArena: ['consular-security-force', 'yoda#old-master']
                    }
                });
            });

            it('should only heal a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.itBindsAllThings);
                expect(context.player1).toBeAbleToSelectExactly([context.moistureFarmer, context.consularSecurityForce, context.yoda]);
                context.player1.setDistributeHealingPromptState(new Map([
                    [context.moistureFarmer, 3],
                ]));

                expect(context.player2).toBeActivePlayer();
                expect(context.moistureFarmer.damage).toBe(0);
            });
        });
    });
});
