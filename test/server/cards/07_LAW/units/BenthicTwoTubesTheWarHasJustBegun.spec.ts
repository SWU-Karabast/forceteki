describe('Benthic "Two Tubes", The War Has Just Begun', function () {
    integration(function (contextRef) {
        describe('Benthic\'s abilities', function () {
            it('should deal 1 damage to an enemy ground unit on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#the-war-has-just-begun', 'battlefield-marine', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['atst'],
                        spaceArena: ['contracted-jumpmaster']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.benthicTwoTubes);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(1);
                expect(context.benthicTwoTubes.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.contractedJumpmaster.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing if there are no targets', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#the-war-has-just-begun', 'battlefield-marine', 'wampa'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.benthicTwoTubes);
                context.player1.clickCard(context.p2Base);

                expect(context.benthicTwoTubes.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage to enemy base when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#the-war-has-just-begun'],
                    },
                    player2: {
                        hand: ['takedown', 'no-glory-only-results'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.benthicTwoTubes);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });

            it('should deal 1 damage to friendly base when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#the-war-has-just-begun'],
                    },
                    player2: {
                        hand: ['takedown', 'no-glory-only-results'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.benthicTwoTubes);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });

            it('should work with no glory', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['benthic-two-tubes#the-war-has-just-begun'],
                    },
                    player2: {
                        hand: ['takedown', 'no-glory-only-results'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.noGloryOnlyResults);
                context.player2.clickCard(context.benthicTwoTubes);

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player2.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});