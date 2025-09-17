describe('Rebel Propagandist', function () {
    integration(function (contextRef) {
        describe('Rebel Propagandist\'s ability', function () {
            it('should give another friendly unit +1/+0 and Saboteur when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rebel-propagandist'],
                        groundArena: ['wampa'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst', 'phaseiii-dark-trooper'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.rebelPropagandist);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(5); // 4 base + 1 from ability
                expect(context.wampa.getHp()).toBe(5); // unchanged
                expect(context.player2).toBeActivePlayer();

                // Test Saboteur by attacking base directly (ignoring Sentinel)
                context.player2.passAction();

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.phaseiiiDarkTrooper, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should give another friendly unit +1/+0 and Saboteur when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rebel-propagandist', 'wampa'],
                        spaceArena: ['green-squadron-awing']
                    },
                    player2: {
                        groundArena: ['atst', 'phaseiii-dark-trooper'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.rebelPropagandist);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.greenSquadronAwing]);
                expect(context.player1).not.toHavePassAbilityButton();

                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(5); // 4 base + 1 from ability
                expect(context.wampa.getHp()).toBe(5); // unchanged
                expect(context.rebelPropagandist).toBeInZone('discard');
                expect(context.player1).toBeActivePlayer();

                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.phaseiiiDarkTrooper, context.p2Base]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(5);
            });

            it('should work with no other friendly units available', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rebel-propagandist']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.rebelPropagandist);
                // Should auto-pass if no valid targets
                expect(context.rebelPropagandist).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should apply effects for this phase only', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['rebel-propagandist'],
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst', 'phaseiii-dark-trooper']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.rebelPropagandist);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.getPower()).toBe(5);

                // Move to next phase
                context.moveToNextActionPhase();

                // Effects should be gone in regroup phase
                expect(context.wampa.getPower()).toBe(4); // back to base

                // no more saboteur
                context.player1.clickCard(context.wampa);
                expect(context.player1).toBeAbleToSelectExactly([context.phaseiiiDarkTrooper]);
                context.player1.clickCard(context.phaseiiiDarkTrooper);
            });

            it('should give enemy unit +1/+0 and Saboteur when defeated with No Glory Only Results', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['wampa', 'rebel-propagandist']
                    },
                    player2: {
                        hand: ['no-glory-only-results'],
                        groundArena: ['atst', 'phaseiii-dark-trooper'],
                        hasInitiative: true,
                    }
                });
                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.rebelPropagandist);

                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.phaseiiiDarkTrooper]);
                context.player2.clickCard(context.atst);

                expect(context.atst.getPower()).toBe(7);
                expect(context.atst.getHp()).toBe(7);
            });
        });
    });
});