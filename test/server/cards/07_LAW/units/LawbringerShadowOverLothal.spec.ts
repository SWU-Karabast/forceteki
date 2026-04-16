describe('Lawbringer, Shadow Over Lothal', function() {
    integration(function(contextRef) {
        describe('Lawbringer\'s triggered ability', function() {
            const prompt = 'Choose an aspect. Each enemy unit with that aspect gets -2/-2 for this phase';
            const choices = ['Vigilance', 'Command', 'Aggression', 'Cunning', 'Villainy', 'Heroism'];

            it('should give enemy units with chosen aspect -2/-2 for this phase when played', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lawbringer#shadow-over-lothal'],
                        groundArena: ['wampa'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst', 'pyke-sentinel']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lawbringer);

                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(choices);

                // Choose Villainy to affect atst and pyke-sentinel
                context.player1.clickPrompt('Villainy');

                // atst (6/7) should now be 4/5
                expect(context.atst.getPower()).toBe(4);
                expect(context.atst.getHp()).toBe(5);

                // pyke-sentinel (2/3) should now be 0/1
                expect(context.pykeSentinel.getPower()).toBe(0);
                expect(context.pykeSentinel.getHp()).toBe(1);

                // battlefield-marine (Command/Heroism, not Villainy) should be unaffected
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Lawbringer',
                    'player1 uses Lawbringer to choose Villainy and to give -2/-2 to AT-ST and Pyke Sentinel for this phase',
                ]);

                expect(context.player2).toBeActivePlayer();
            });

            it('should give enemy units with chosen aspect -2/-2 for this phase on attack', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['lawbringer#shadow-over-lothal']
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'atst']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lawbringer);
                context.player1.clickCard(context.p2Base);

                // Should be prompted to choose an aspect
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(choices);

                // Choose Command to affect battlefield-marine
                context.player1.clickPrompt('Command');

                // battlefield-marine (3/3) should now be 1/1
                expect(context.battlefieldMarine.getPower()).toBe(1);
                expect(context.battlefieldMarine.getHp()).toBe(1);

                // atst (Villainy) should be unaffected
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 attacks player2\'s base with Lawbringer',
                    'player1 uses Lawbringer to choose Command and to give -2/-2 to Battlefield Marine for this phase',
                ]);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not affect friendly units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lawbringer#shadow-over-lothal'],
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['phoenix-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'consular-security-force']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lawbringer);

                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(choices);

                context.player1.clickPrompt('Command');

                // Friendly wampa (Aggression) should NOT be affected
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                // Friendly atst should also be unaffected
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);

                // Friendly Phoenix Squadron A-Wing should also be unaffected
                expect(context.phoenixSquadronAwing.getPower()).toBe(3);
                expect(context.phoenixSquadronAwing.getHp()).toBe(2);

                // Enemy battlefield-marine (Command) should be affected
                expect(context.battlefieldMarine.getPower()).toBe(1);
                expect(context.battlefieldMarine.getHp()).toBe(1);

                // Enemy consular-security-force (Vigilance, Heroism - not Command) should be unaffected
                expect(context.consularSecurityForce.getPower()).toBe(3);
                expect(context.consularSecurityForce.getHp()).toBe(7);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Lawbringer',
                    'player1 uses Lawbringer to choose Command and to give -2/-2 to Battlefield Marine for this phase',
                ]);

                expect(context.player2).toBeActivePlayer();
            });

            it('should have the stat penalty expire at end of phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lawbringer#shadow-over-lothal']
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lawbringer);

                // Should have multiple aspect options
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(choices);
                context.player1.clickPrompt('Villainy');

                expect(context.atst.getPower()).toBe(4);
                expect(context.atst.getHp()).toBe(5);

                context.moveToNextActionPhase();

                // Stat penalty should be gone
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);
            });

            it('should defeat units reduced to 0 HP', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lawbringer#shadow-over-lothal']
                    },
                    player2: {
                        spaceArena: ['tieln-fighter'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lawbringer);

                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(choices);
                context.player1.clickPrompt('Villainy');

                // tieln-fighter (2/1) gets -2/-2, reducing to 0/-1 - should be defeated
                expect(context.tielnFighter).toBeInZone('discard');

                // battlefield-marine should be unaffected
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            it('should allow choosing an aspect to no effect', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['lawbringer#shadow-over-lothal']
                    },
                    player2: {
                        groundArena: ['atst', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.lawbringer);

                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveExactPromptButtons(choices);
                context.player1.clickPrompt('Aggression');

                // AT-ST is unaffected
                expect(context.atst.getPower()).toBe(6);
                expect(context.atst.getHp()).toBe(7);

                // Battlefield Marine is unaffected
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);

                expect(context.getChatLogs(2)).toEqual([
                    'player1 plays Lawbringer',
                    'player1 uses Lawbringer to choose Aggression'
                ]);

                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
