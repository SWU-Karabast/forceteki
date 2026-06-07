describe('Ezra Bridger, Its Now or Never', function() {
    integration(function(contextRef) {
        describe('Leader side triggered ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst'],
                        spaceArena: ['awing'],
                        leader: 'ezra-bridger#its-now-or-never'
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });
            });

            it('should allow to give an Advantage token to a different unit', function() {
                const { context } = contextRef;

                // 3 Damage dealt to base from AT-ST
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Give an Advantage token to a different unit');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing, context.battlefieldMarine, context.yoda, context.sabineWren]);
                expect(context.player1).not.toHaveChooseNothingButton();
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.porg);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
                expect(context.porg).toHaveExactUpgradeNames(['advantage']);
                expect(context.ezraBridger.exhausted).toBeTrue();
            });

            it('should not trigger if damage is less than 3', function() {
                const { context } = contextRef;

                // 2 Damage dealt to base from AWing
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(2);
                expect(context.ezraBridger.exhausted).toBeFalse();
            });

            it('should not trigger if damage is not dealt by combat', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.ezraBridger.exhausted).toBeFalse();
            });

            it('should be able to choose nothing', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Give an Advantage token to a different unit');
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
                expect(context.ezraBridger.exhausted).toBeFalse();
            });
        });

        describe('Leader unit side triggered ability', function() {
            it('should allow to give an Advantage token to a different unit if he attacks', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist'],
                        spaceArena: ['awing'],
                        leader: { card: 'ezra-bridger#its-now-or-never', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give an Advantage token to a different unit than Ezra Bridger');
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing, context.sabineWren, context.yoda, context.battlefieldMarine]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
                expect(context.yoda).toHaveExactUpgradeNames(['advantage']);
            });

            it('should allow to give an Advantage token to a different unit if another unit attacks', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst'],
                        spaceArena: ['awing'],
                        leader: { card: 'ezra-bridger#its-now-or-never', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give an Advantage token to a different unit than AT-ST');
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing, context.sabineWren, context.yoda, context.battlefieldMarine, context.ezraBridger]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
                expect(context.yoda).toHaveExactUpgradeNames(['advantage']);
            });

            it('should allow to give an Advantage token to a different unit if a unit deals damage to the base due to Overwhelm', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst'],
                        spaceArena: ['awing'],
                        leader: { card: 'ezra-bridger#its-now-or-never', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.porg);

                expect(context.player1).toHavePrompt('Give an Advantage token to a different unit than AT-ST');
                expect(context.player1).toBeAbleToSelectExactly([context.awing, context.sabineWren, context.yoda, context.battlefieldMarine, context.ezraBridger]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(5);
                expect(context.yoda).toHaveExactUpgradeNames(['advantage']);
            });

            it('should not trigger for enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst'],
                        spaceArena: ['awing'],
                        leader: { card: 'ezra-bridger#its-now-or-never', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);
                context.player2.clickCard(context.p1Base);

                expect(context.player1).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should not trigger if damage is dealt with no combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst'],
                        spaceArena: ['awing'],
                        leader: { card: 'ezra-bridger#its-now-or-never', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sabineWren);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.p2Base);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(3);
            });

            it('should allow to give an Advantage token to a different unit for each unit that attacks and deals 3 or more damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['sabine-wren#explosives-artist', 'atst'],
                        spaceArena: ['awing'],
                        leader: { card: 'ezra-bridger#its-now-or-never', deployed: true }
                    },
                    player2: {
                        groundArena: ['porg', 'battlefield-marine', 'yoda#old-master'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePrompt('Give an Advantage token to a different unit than AT-ST');
                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing, context.sabineWren, context.yoda, context.battlefieldMarine, context.ezraBridger]);
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickCard(context.yoda);

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(6);
                expect(context.yoda).toHaveExactUpgradeNames(['advantage']);

                context.player2.passAction();

                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.porg, context.awing, context.sabineWren, context.yoda, context.battlefieldMarine, context.atst]);
                context.player1.clickCard(context.porg);
                expect(context.p2Base.damage).toBe(9);
                expect(context.porg).toHaveExactUpgradeNames(['advantage']);
            });
        });
    });
});