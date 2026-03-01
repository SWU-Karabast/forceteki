describe('Persecutor, Fire Over Scarif', function () {
    integration(function (contextRef) {
        describe('Persecutor\'s triggered ability', function () {
            it('should deal 3 damage to each space unit when choosing Space', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['persecutor#fire-over-scarif'],
                        spaceArena: ['jedi-starfighter']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['lurking-tie-phantom', 'first-light#threatening-elegance']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.persecutor);

                expect(context.player1).toHaveExactPromptButtons(['Space', 'Ground', 'Pass']);

                context.player1.clickPrompt('Space');

                expect(context.persecutor.damage).toBe(3);
                expect(context.lurkingTiePhantom.damage).toBe(0); // prevent damage
                expect(context.jediStarfighter.damage).toBe(3);
                expect(context.firstLight.damage).toBe(3);
                expect(context.wampa.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when choosing Pass', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['persecutor#fire-over-scarif'],
                        spaceArena: ['jedi-starfighter']
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['lurking-tie-phantom', 'first-light#threatening-elegance']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.persecutor);

                expect(context.player1).toHaveExactPromptButtons(['Space', 'Ground', 'Pass']);

                context.player1.clickPrompt('Pass');

                expect(context.persecutor.damage).toBe(0);
                expect(context.lurkingTiePhantom.damage).toBe(0);
                expect(context.jediStarfighter.damage).toBe(0);
                expect(context.firstLight.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 3 damage to each non-shielded ground unit when choosing Ground', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['persecutor#fire-over-scarif'],
                        groundArena: ['consular-security-force']
                    },
                    player2: {
                        groundArena: ['wampa', 'yoda#old-master'],
                        spaceArena: ['cartel-spacer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.persecutor);

                expect(context.player1).toHaveExactPromptButtons(['Space', 'Ground', 'Pass']);

                context.player1.clickPrompt('Ground');

                expect(context.wampa.damage).toBe(3);
                expect(context.yoda.damage).toBe(3);
                expect(context.consularSecurityForce.damage).toBe(3);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.persecutor.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger on attack and deal 3 damage to space units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['persecutor#fire-over-scarif', 'alliance-xwing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.persecutor);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Space', 'Ground', 'Pass']);

                context.player1.clickPrompt('Space');

                expect(context.persecutor.damage).toBe(3);
                expect(context.allianceXwing).toBeInZone('discard'); // 3 HP
                expect(context.cartelSpacer).toBeInZone('discard'); // 3 HP
                expect(context.wampa.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger on attack and deal 3 damage to ground units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['persecutor#fire-over-scarif', 'alliance-xwing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.persecutor);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Space', 'Ground', 'Pass']);

                context.player1.clickPrompt('Ground');

                expect(context.persecutor.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.wampa.damage).toBe(3);
                expect(context.battlefieldMarine).toBeInZone('discard'); // 3 HP, defeated

                expect(context.player2).toBeActivePlayer();
            });

            it('should do nothing when choosing Pass on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['persecutor#fire-over-scarif', 'alliance-xwing'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        spaceArena: ['cartel-spacer'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.persecutor);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Space', 'Ground', 'Pass']);

                context.player1.clickPrompt('Pass');

                expect(context.persecutor.damage).toBe(0);
                expect(context.allianceXwing.damage).toBe(0);
                expect(context.cartelSpacer.damage).toBe(0);
                expect(context.wampa.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
