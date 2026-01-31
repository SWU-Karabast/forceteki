describe('Conveyex Security Captain', function() {
    integration(function(contextRef) {
        describe('Conveyex Security Captain\'s constant ability', function() {
            it('should prevent enemy Credit tokens from being used to pay costs', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        credits: 2,
                        resources: 2,
                        hand: ['consular-security-force', 'restored-arc170'] // 4 cost unit, 2 cost unit
                    },
                    player2: {
                        groundArena: ['conveyex-security-captain'],
                    },
                });

                const { context } = contextRef;

                // Should not be able to play Consular
                expect(context.consularSecurityForce).not.toHaveAvailableActionWhenClickedBy(context.player1);

                // Should be able to play 170, but not get prompted to spend credits
                context.player1.clickCard(context.restoredArc170);
                expect(context.restoredArc170).toBeInZone('spaceArena');
                expect(context.player2).toBeActivePlayer();
            });

            it('should prevent enemy Credit tokens created after Conveyex is played from being used to pay costs', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sabe#queens-shadow',
                        credits: 0,
                        resources: 3,
                        hand: ['champions-kt9-podracer', 'jawa-scavenger']
                    },
                    player2: {
                        groundArena: ['conveyex-security-captain'],
                    },
                });

                const { context } = contextRef;

                context.player1.clickCard(context.championsKt9Podracer);

                expect(context.player1.credits).toBe(1);

                context.player2.passAction();

                // Should not be able to play the jawa
                expect(context.jawaScavenger).not.toHaveAvailableActionWhenClickedBy(context.player1);
            });

            it('should not affect friendly Credit tokens', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'yoda#sensing-darkness',
                        groundArena: ['conveyex-security-captain'],
                        credits: 1,
                        resources: 3,
                        hand: ['consular-security-force'] // 4 cost unit
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.consularSecurityForce);

                expect(context.player1).toHavePrompt('Use Credit tokens to pay for Consular Security Force');

                context.player1.clickPrompt('Use 1 Credit');

                expect(context.consularSecurityForce).toBeInZone('groundArena');
                expect(context.player1.credits).toBe(0);
                expect(context.player1.exhaustedResourceCount).toBe(3);
            });

            it('should restore ability to use enemy Credit tokens when Conveyex Security Captain leaves play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['conveyex-security-captain'],
                        hand: ['vanquish']
                    },
                    player2: {
                        credits: 2,
                        resources: 2,
                        hand: ['consular-security-force'] // 4 cost unit
                    }
                });

                const { context } = contextRef;

                // Defeat Conveyex Security Captain
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.conveyexSecurityCaptain);

                expect(context.conveyexSecurityCaptain).toBeInZone('discard');

                // Now player 2 should be able to use their credits
                context.player2.clickCard(context.consularSecurityForce);

                // Should get a prompt to use credits
                expect(context.player2).toHavePrompt('Use Credit tokens to pay for Consular Security Force');

                context.player2.clickPrompt('Use 2 Credits');

                expect(context.consularSecurityForce).toBeInZone('groundArena');
                expect(context.player2.credits).toBe(0);
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });

            it('should restore ability to use enemy Credit tokens if Conveyex loses it\'s abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'kazuda-xiono#best-pilot-in-the-galaxy', deployed: true },
                        groundArena: ['conveyex-security-captain'],
                        hand: ['vanquish']
                    },
                    player2: {
                        credits: 2,
                        resources: 2,
                        hand: ['consular-security-force'] // 4 cost unit
                    }
                });

                const { context } = contextRef;

                // Remove Conveyx's abilities
                context.player1.clickCard(context.kazudaXiono);
                context.player1.clickCard(context.player2.base);
                context.player1.clickCard(context.conveyexSecurityCaptain);
                context.player1.clickPrompt('Done');

                // Now player 2 should be able to use their credits
                context.player2.clickCard(context.consularSecurityForce);

                // Should get a prompt to use credits
                expect(context.player2).toHavePrompt('Use Credit tokens to pay for Consular Security Force');

                context.player2.clickPrompt('Use 2 Credits');

                expect(context.consularSecurityForce).toBeInZone('groundArena');
                expect(context.player2.credits).toBe(0);
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });

            it('should make enemy Credit tokens return true for isBlank()', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['conveyex-security-captain'],
                    },
                    player2: {
                        credits: 1,
                    }
                });

                const { context } = contextRef;

                const creditTokens = context.player2.findCardsByName('credit');
                expect(creditTokens.length).toBe(1);
                expect(creditTokens[0].isBlank()).toBeTrue();
            });
        });
    });
});