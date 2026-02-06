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

            it('should only take control of one Credit token if the opponent has multiple', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['lieutenant-gorn#i-deserve-worse'],
                        credits: 0
                    },
                    player2: {
                        credits: 3
                    }
                });

                const { context } = contextRef;
                const p2CreditTokens = context.player2.findCardsByName('credit');

                // P1 attacks with Lieutenant Gorn
                context.player1.clickCard(context.lieutenantGorn);
                context.player1.clickCard(context.p2Base);

                // Verify that P1 took control of only one of P2's Credit tokens
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(2);
                expect(p2CreditTokens[0]).toBeInZone('base', context.player1);
                expect(p2CreditTokens[1]).toBeInZone('base', context.player2);
                expect(p2CreditTokens[2]).toBeInZone('base', context.player2);
                expect(context.getChatLog()).toEqual('player1 uses Lieutenant Gorn to take control of a Credit token from player2');
            });

            it('can be taken back by the opponent if they attack with their own copy of Lieutenant Gorn', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['lieutenant-gorn#i-deserve-worse'],
                        credits: 0
                    },
                    player2: {
                        groundArena: ['lieutenant-gorn#i-deserve-worse'],
                        credits: 1
                    }
                });

                const { context } = contextRef;

                const p2CreditToken = context.player2.findCardByName('credit');
                const p1Gorn = context.player1.findCardByName('lieutenant-gorn#i-deserve-worse');
                const p2Gorn = context.player2.findCardByName('lieutenant-gorn#i-deserve-worse');

                // P1 attacks with Lieutenant Gorn
                context.player1.clickCard(p1Gorn);
                context.player1.clickCard(context.p2Base);

                // Verify that P1 took control of P2's Credit token
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(p2CreditToken).toBeInZone('base', context.player1);
                expect(context.getChatLogs(2)).toContain('player1 uses Lieutenant Gorn to take control of a Credit token from player2');

                // P2 attacks with their own Lieutenant Gorn
                context.player2.clickCard(p2Gorn);
                context.player2.clickCard(context.p1Base);

                // Verify that P2 took back control of their Credit token
                expect(context.player1.credits).toBe(0);
                expect(context.player2.credits).toBe(1);
                expect(p2CreditToken).toBeInZone('base', context.player2);
                expect(context.getChatLogs(3)).toContain('player2 uses Lieutenant Gorn to take control of a Credit token from player1');
            });

            it('nothing breaks if the credit is defeated after being stolen', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'alliance-outpost',
                        groundArena: ['lieutenant-gorn#i-deserve-worse'],
                        credits: 0
                    },
                    player2: {
                        credits: 1
                    }
                });

                const { context } = contextRef;

                const creditToken = context.player2.findCardByName('credit');

                // P1 attacks with Lieutenant Gorn
                context.player1.clickCard(context.lieutenantGorn);
                context.player1.clickCard(context.p2Base);

                // Verify that P1 took control of P2's Credit token
                expect(context.player1.credits).toBe(1);
                expect(context.player2.credits).toBe(0);
                expect(creditToken).toBeInZone('base', context.player1);
                expect(context.getChatLog()).toEqual('player1 uses Lieutenant Gorn to take control of a Credit token from player2');

                context.player2.passAction();

                // P1 uses Alliance Outpost to defeat the stolen Credit token in exchange for a shield
                context.player1.clickCard(context.allianceOutpost);
                context.player1.clickPrompt('Give Shield');
                context.player1.clickCard(creditToken);
                context.player1.clickCard(context.lieutenantGorn);

                // Verify that the Credit token was defeated and Shield was created
                expect(creditToken).toBeInZone('outsideTheGame');
                expect(context.player1.credits).toBe(0);
                expect(context.lieutenantGorn).toHaveExactUpgradeNames(['shield']);
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
