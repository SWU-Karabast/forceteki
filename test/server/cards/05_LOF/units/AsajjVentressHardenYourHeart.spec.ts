describe('Asajj Ventress, Harden Your Heart', () => {
    integration(function (contextRef) {
        describe('Asajj Ventress\'s When Played/On Attack ability', () => {
            const prompt = 'Give another friendly Force unit +2/+0 for this phase';

            it('gives another friendly Force unit +2/+0 for the phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['asajj-ventress#harden-your-heart'],
                        groundArena: [
                            'quinlan-vos#dark-disciple',
                            'battlefield-marine'
                        ],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                            'luke-skywalker#jedi-knight'
                        ],
                    }
                });

                const { context } = contextRef;

                // Verify Quinlan's initial stats
                expect(context.quinlanVos.getPower()).toBe(4);
                expect(context.quinlanVos.getHp()).toBe(5);

                // Player 1 plays Asajj Ventress
                context.player1.clickCard(context.asajjVentress);

                // Only friendly Force units should be selectable
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([context.quinlanVos]);
                context.player1.clickCard(context.quinlanVos);

                // Quinlan gets +2/+0
                expect(context.quinlanVos.getPower()).toBe(6);
                expect(context.quinlanVos.getHp()).toBe(5);

                // Move to the next action phase
                context.moveToNextActionPhase();

                // Quinlan's stat moidifier has expired
                expect(context.quinlanVos.getPower()).toBe(4);
                expect(context.quinlanVos.getHp()).toBe(5);

                // Attack with Asajj Ventress
                context.player1.clickCard(context.asajjVentress);
                context.player1.clickCard(context.consularSecurityForce);

                // Ability is triggered again
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([context.quinlanVos]);
                context.player1.clickCard(context.quinlanVos);

                // Quinlan gets +2/+0 for the phase
                expect(context.quinlanVos.getPower()).toBe(6);
                expect(context.quinlanVos.getHp()).toBe(5);
            });

            it('does nothing if no other friendly Force units are in play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['asajj-ventress#harden-your-heart'],
                        groundArena: [
                            'battlefield-marine'
                        ],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: [
                            'consular-security-force',
                            'luke-skywalker#jedi-knight'
                        ],
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Asajj Ventress
                context.player1.clickCard(context.asajjVentress);

                // Ability does not trigger
                expect(context.player1).not.toHavePrompt(prompt);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
