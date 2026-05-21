describe('Emperor Palpatine, According to My Design', function() {
    integration(function(contextRef) {
        describe('Leader side action ability', function() {
            it('exhausts Palpatine and gives Advantage tokens to an exhausted friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'emperor-palpatine#according-to-my-design',
                        resources: 5,
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            { card: 'wampa', exhausted: true },
                            'atst'
                        ]
                    },
                    player2: {
                        groundArena: [{ card: 'pyke-sentinel', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);

                expect(context.player1).toHavePrompt('Give Advantage tokens to an exhausted friendly unit for each other friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa]);

                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();
                // 2 other friendly units (wampa, atst) = 2 Advantage tokens
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage']);
                expect(context.emperorPalpatine.exhausted).toBeTrue();
            });

            it('gives 1 Advantage token when there is only 1 other friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'emperor-palpatine#according-to-my-design',
                        resources: 5,
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            'wampa'
                        ]
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.battlefieldMarine);

                // 1 other friendly unit (wampa) = 1 Advantage token
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
                expect(context.emperorPalpatine.exhausted).toBeTrue();
            });

            it('cannot be used if there are no exhausted friendly units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'emperor-palpatine#according-to-my-design',
                        resources: 5,
                        groundArena: ['battlefield-marine', 'wampa']
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // No exhausted friendly units, so clicking the leader will show a confirmation prompt
                context.player1.clickCard(context.emperorPalpatine);

                // When no valid targets, a confirmation prompt appears asking if the player wants to proceed
                expect(context.player1).toHaveNoEffectAbilityPrompt('Give Advantage tokens to an exhausted friendly unit for each other friendly unit');

                context.player1.clickPrompt('Use it anyway');

                expect(context.player2).toBeActivePlayer();
                expect(context.emperorPalpatine.exhausted).toBeTrue();
                expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);
                expect(context.wampa).toHaveExactUpgradeNames([]);
                expect(context.pykeSentinel).toHaveExactUpgradeNames([]);
            });

            it('cannot be used if Palpatine is already exhausted', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#according-to-my-design', exhausted: true },
                        resources: 5,
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                // Leader is exhausted, so cannot use action ability
                expect(context.player1).not.toBeAbleToSelect(context.emperorPalpatine);
            });
        });

        describe('Leader unit side on-attack ability', function() {
            it('gives Advantage tokens to an exhausted friendly unit when attacking', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#according-to-my-design', deployed: true },
                        groundArena: [
                            { card: 'battlefield-marine', exhausted: true },
                            'wampa',
                            'atst'
                        ],
                        spaceArena: [{ card: 'awing', exhausted: true }]
                    },
                    player2: {
                        groundArena: [{ card: 'yoda#old-master', exhausted: true }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.p2Base);

                // Ability with targetResolver shows targets directly with Pass button
                expect(context.player1).toHavePrompt('Give Advantage tokens to an exhausted friendly unit for each other friendly unit');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.awing]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.battlefieldMarine);

                // 3 other friendly units (wampa, atst, awing, plus Palpatine as unit) = 4 Advantage tokens
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage', 'advantage', 'advantage', 'advantage']);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger if there are no exhausted friendly units (other than self)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#according-to-my-design', deployed: true },
                        groundArena: ['wampa']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.p2Base);

                // No exhausted friendly units to target, ability doesn't trigger
                expect(context.player2).toBeActivePlayer();
            });

            it('gives 1 Advantage token when only the leader is another friendly unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'emperor-palpatine#according-to-my-design', deployed: true },
                        groundArena: [{ card: 'battlefield-marine', exhausted: true }]
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.emperorPalpatine);
                context.player1.clickCard(context.p2Base);

                // Target selection prompt - just select the target to trigger
                expect(context.player1).toHavePrompt('Give Advantage tokens to an exhausted friendly unit for each other friendly unit');
                context.player1.clickCard(context.battlefieldMarine);

                // 1 other friendly unit (Palpatine as unit) = 1 Advantage token
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['advantage']);
            });
        });
    });
});
