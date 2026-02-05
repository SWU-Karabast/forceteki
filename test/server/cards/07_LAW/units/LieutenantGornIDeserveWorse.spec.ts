describe('Lieutenant Gorn, I Deserve Worse', () => {
    integration(function(contextRef) {
        describe('Triggered On Attack ability', function() {
            it('should take control of an enemy Credit token (and the new controller can spend it)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'rey#more-than-a-scavenger',
                        hand: ['resilient'],
                        groundArena: ['lieutenant-gorn#i-deserve-worse'],
                        credits: 0
                    },
                    player2: {
                        credits: 1
                    }
                });

                const { context } = contextRef;

                const p2CreditToken = context.player2.findCardByName('credit');

                // P1 attacks with Lieutenant Gorn
                context.player1.clickCard(context.lieutenantGorn);
                context.player1.clickCard(context.p2Base);

                // Verify that P1 took control of P2's Credit token
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(p2CreditToken).toBeInZone('base', context.player1);
                expect(context.getChatLog()).toEqual('player1 uses Lieutenant Gorn to take control of a Credit token from player2');

                context.player2.passAction();

                // Veify that P1 can spend the stolen Credit token
                context.player1.clickCard(context.resilient);
                context.player1.clickCard(context.lieutenantGorn);
                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Resilient');
                context.player1.clickPrompt('Use 1 Credit');

                expect(context.lieutenantGorn).toHaveExactUpgradeNames(['resilient']);
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(0);
            });

            it('should take control of an enemy Credit token (and the old controller cannot spend it)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['lieutenant-gorn#i-deserve-worse'],
                        credits: 0
                    },
                    player2: {
                        hand: ['resilient'],
                        groundArena: ['wampa'],
                        credits: 1
                    }
                });

                const { context } = contextRef;

                const p2CreditToken = context.player2.findCardByName('credit');

                // P1 attacks with Lieutenant Gorn
                context.player1.clickCard(context.lieutenantGorn);
                context.player1.clickCard(context.p2Base);

                // Verify that P1 took control of P2's Credit token
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(p2CreditToken).toBeInZone('base', context.player1);
                expect(context.getChatLog()).toEqual('player1 uses Lieutenant Gorn to take control of a Credit token from player2');

                context.player2.clickCard(context.resilient);
                context.player2.clickCard(context.wampa);
                expect(context.player1).not.toHavePrompt('Use Credit tokens to pay for Resilient');

                expect(context.wampa).toHaveExactUpgradeNames(['resilient']);
                expect(context.player1.credits).toBe(1); // Player 1 keeps the stolen Credit token
                expect(context.player2.exhaustedResourceCount).toBe(1);
            });

            it('does nothing if the opponent has no Credit tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['lieutenant-gorn#i-deserve-worse'],
                        credits: 1 // Start with one just to verify no change
                    },
                    player2: {
                        credits: 0
                    }
                });

                const { context } = contextRef;

                // P1 attacks with Lieutenant Gorn
                context.player1.clickCard(context.lieutenantGorn);
                context.player1.clickCard(context.p2Base);

                // Verify that nothing happens since P2 has no Credit tokens
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(context.getChatLogs(3)).not.toContain('player1 uses Lieutenant Gorn to take control of a Credit token from player2');
            });
        });
    });
});
