describe('Ravage', function() {
    integration(function(contextRef) {
        describe('its ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ravage'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['awing']
                    }
                });
            });

            it('should show the correct prompt title and allow selecting any unit regardless of controller or arena', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ravage);

                expect(context.player1).toHavePrompt('Distribute 3 Weakness tokens among targets');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.atst,
                    context.cartelSpacer,
                    context.battlefieldMarine,
                    context.awing
                ]);

                context.player1.setDistributeTokenUpgradePromptState(new Map());
                expect(context.player2).toBeActivePlayer();
            });

            it('should distribute Weakness tokens across friendly and enemy units in both arenas', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ravage);
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 1],
                    [context.battlefieldMarine, 1],
                    [context.awing, 1]
                ]));

                expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
                expect(context.awing).toHaveExactUpgradeNames(['weakness']);
                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);

                // Power/HP are each reduced by 1 for every unit with a Weakness token
                expect(context.wampa.getPower()).toBe(3);
                expect(context.wampa.remainingHp).toBe(4);
                expect(context.battlefieldMarine.getPower()).toBe(2);
                expect(context.battlefieldMarine.remainingHp).toBe(2);
                expect(context.awing.getPower()).toBe(0);
                expect(context.awing.remainingHp).toBe(1);

                expect(context.ravage).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow stacking all 3 Weakness tokens on a single unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ravage);
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.atst, 3]
                ]));

                expect(context.atst).toHaveExactUpgradeNames(['weakness', 'weakness', 'weakness']);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);

                // AT-ST is 6/7 printed; 3 Weakness tokens reduce it to 3/4
                expect(context.atst.getPower()).toBe(3);
                expect(context.atst.remainingHp).toBe(4);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow distributing fewer than 3 Weakness tokens', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ravage);
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 1],
                    [context.battlefieldMarine, 1]
                ]));

                expect(context.wampa).toHaveExactUpgradeNames(['weakness']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
                expect(context.awing).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow declining to distribute any Weakness tokens', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ravage);
                context.player1.setDistributeTokenUpgradePromptState(new Map());

                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.atst).toHaveExactUpgradeNames([]);
                expect(context.cartelSpacer).toHaveExactUpgradeNames([]);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.awing).toHaveExactUpgradeNames([]);

                expect(context.ravage).toBeInZone('discard', context.player1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not allow distributing more than 3 Weakness tokens', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ravage);

                expect(() => context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 2],
                    [context.battlefieldMarine, 1],
                    [context.awing, 1]
                ]))).toThrowError('Contract assertion failure: Illegal prompt results for \'Distribute 3 Weakness tokens among targets\', distributed Weakness tokens should be less than or equal to 3 but instead received a total of 4');

                // Resolve legally so the test doesn't end with an unresolved prompt
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.wampa, 2],
                    [context.battlefieldMarine, 1]
                ]));

                expect(context.wampa).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['weakness']);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('its ability, when a Weakness token defeats a unit', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ravage'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['sullustan-spacer']
                    }
                });
            });

            it('should defeat a unit reduced to 0 remaining HP by a Weakness token', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.ravage);
                context.player1.setDistributeTokenUpgradePromptState(new Map([
                    [context.sullustanSpacer, 1],
                    [context.wampa, 2]
                ]));

                // Sullustan Spacer is 1/1 - a single Weakness token drops its remaining HP to 0
                expect(context.sullustanSpacer).toBeInZone('discard', context.player2);

                // Wampa survives with 2 Weakness tokens
                expect(context.wampa).toHaveExactUpgradeNames(['weakness', 'weakness']);
                expect(context.wampa.getPower()).toBe(2);
                expect(context.wampa.remainingHp).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
