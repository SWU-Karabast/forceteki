describe('Han Solo, Worth the Risk', function () {
    integration(function (contextRef) {
        describe('Han Solo\'s leader undeployed ability', function () {
            it('should play a unit from our hand, it costs 1 resource less and take 2 damage', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cantina-braggart', 'vanguard-infantry', 'green-squadron-awing', 'devotion'],
                        groundArena: ['colonel-yularen#isb-director'],
                        leader: 'han-solo#worth-the-risk',
                        base: { card: 'echo-base', damage: 5 },
                        resources: 4,
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.vanguardInfantry, context.greenSquadronAwing]);
                context.player1.clickCard(context.cantinaBraggart);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.cantinaBraggart).toBeInZone('groundArena');
                expect(context.cantinaBraggart.damage).toBe(2);
                expect(context.hanSolo.exhausted).toBeTrue();

                context.hanSolo.exhausted = false;
                context.player2.passAction();

                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.vanguardInfantry)

                // choose which unit to give an experience token (vanguard infantry when defeated ability)
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.colonelYularen]);
                context.player1.clickCard(context.cantinaBraggart);

                // colonel yularen was resolved automatically
                expect(context.p1Base.damage).toBe(4);
                expect(context.vanguardInfantry).toBeInZone('discard');
                expect(context.cantinaBraggart).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.hanSolo.exhausted).toBeTrue();
            });
        });

        describe('Han Solo\'s leader deployed ability', function () {
            it('should play a unit from our hand, it costs 1 resource less and take 2 damage', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['cantina-braggart', 'vanguard-infantry', 'green-squadron-awing', 'devotion'],
                        groundArena: ['colonel-yularen#isb-director'],
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                        base: { card: 'echo-base', damage: 5 },
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player1.clickPrompt('Attack');
                context.player2.passAction();

                context.player1.clickCard(context.hanSolo);
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.vanguardInfantry, context.greenSquadronAwing]);
                context.player1.clickCard(context.cantinaBraggart);

                expect(context.player1.exhaustedResourceCount).toBe(0);
                expect(context.cantinaBraggart).toBeInZone('groundArena');
                expect(context.cantinaBraggart.damage).toBe(2);

                context.player2.passAction();

                context.player1.clickCard(context.hanSolo);
                context.player1.clickCard(context.vanguardInfantry)

                // choose which unit to give an experience token (vanguard infantry when defeated ability)
                expect(context.player1).toBeAbleToSelectExactly([context.cantinaBraggart, context.colonelYularen, context.hanSolo]);
                context.player1.clickCard(context.hanSolo);

                // colonel yularen was resolved automatically
                expect(context.p1Base.damage).toBe(4);
                expect(context.vanguardInfantry).toBeInZone('discard');
                expect(context.hanSolo).toHaveExactUpgradeNames(['experience']);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                context.player2.passAction();
                context.player1.clickCard(context.greenSquadronAwing);
                context.player2.passAction();
                expect(context.hanSolo).not.toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should play a unit from our hand, it costs 1 resource less and take 2 damage', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        leader: { card: 'han-solo#worth-the-risk', deployed: true },
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hanSolo);
                context.player2.passAction();
                expect(context.hanSolo.exhausted).toBeTrue();
                expect(context.hanSolo).not.toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
