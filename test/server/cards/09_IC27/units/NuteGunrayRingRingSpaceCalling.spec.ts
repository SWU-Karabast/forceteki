describe('Nute Gunray, Ring Ring, Space Calling', function () {
    integration(function (contextRef) {
        describe('Nute\'s constant ability', function () {
            it('should give each other friendly Separatist unit Restore 1 in both arenas', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'nute-gunray#ring-ring-space-calling',
                            'b1-attack-platform',
                            'battlefield-marine'
                        ],
                        spaceArena: ['desperate-nantex'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        groundArena: ['droid-commando'],
                        base: { card: 'jedha-city', damage: 10 }
                    }
                });

                const { context } = contextRef;

                // Friendly ground Separatist attacks and restores 1
                context.player1.clickCard(context.b1AttackPlatform);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(9);
                expect(context.p2Base.damage).toBe(15);

                // Enemy Separatist does not gain Restore
                context.player2.clickCard(context.droidCommando);
                context.player2.clickCard(context.p1Base);
                expect(context.p1Base.damage).toBe(13);
                expect(context.p2Base.damage).toBe(15);

                // Friendly space Separatist attacks and restores 1
                context.player1.clickCard(context.desperateNantex);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(12);
                expect(context.p2Base.damage).toBe(17);

                context.player2.passAction();

                // Friendly non-Separatist does not gain Restore
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(12);
                expect(context.p2Base.damage).toBe(20);

                context.player2.passAction();

                // Nute does not gain Restore from his own ability
                context.player1.clickCard(context.nuteGunrayRingRingSpaceCalling);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(12);
                expect(context.p2Base.damage).toBe(21);
                expect(context.player2).toBeActivePlayer();
            });

            it('should add to a printed Restore value', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'nute-gunray#ring-ring-space-calling',
                            'mina-bonteri#stop-this-war'
                        ],
                        base: { card: 'echo-base', damage: 10 }
                    }
                });

                const { context } = contextRef;

                // Mina has her printed Restore plus Restore 1 from Nute
                expect(context.minaBonteri.getNumericKeywordTotal('restore')).toBe(2);

                // Mina attacks and restores 2
                context.player1.clickCard(context.minaBonteri);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(8);
                expect(context.p2Base.damage).toBe(2);
            });

            it('should give Restore 1 to a deployed Separatist leader unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nute-gunray#ring-ring-space-calling'],
                        leader: { card: 'general-grievous#separatist-warlord', deployed: true },
                        base: { card: 'echo-base', damage: 10 }
                    }
                });

                const { context } = contextRef;

                // Deployed General Grievous attacks and restores 1
                context.player1.clickCard(context.generalGrievous);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(9);
            });

            it('should give Restore 1 to a Separatist that enters play after him', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['b1-attack-platform'],
                        groundArena: ['nute-gunray#ring-ring-space-calling'],
                        base: { card: 'echo-base', damage: 10 }
                    }
                });

                const { context } = contextRef;

                // Play B1 Attack Platform, it gains Restore 1
                context.player1.clickCard(context.b1AttackPlatform);
                expect(context.b1AttackPlatform.getNumericKeywordTotal('restore')).toBe(1);

                context.moveToNextActionPhase();

                // B1 Attack Platform attacks and restores 1
                context.player1.clickCard(context.b1AttackPlatform);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(9);
            });

            it('should stop giving Restore 1 when he leaves play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nute-gunray#ring-ring-space-calling', 'b1-attack-platform'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 defeats Nute with Vanquish
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.nuteGunrayRingRingSpaceCalling);
                expect(context.nuteGunrayRingRingSpaceCalling).toBeInZone('discard');

                // B1 Attack Platform attacks and does not restore
                context.player1.clickCard(context.b1AttackPlatform);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(10);
            });

            it('should not give Restore 1 to a Separatist the opponent takes control of', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nute-gunray#ring-ring-space-calling', 'b1-attack-platform']
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        base: { card: 'jedha-city', damage: 10 },
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 takes control of B1 Attack Platform with Change of Heart
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.b1AttackPlatform);
                expect(context.b1AttackPlatform).toBeInZone('groundArena', context.player2);
                expect(context.b1AttackPlatform.hasSomeKeyword('restore')).toBeFalse();

                context.player1.passAction();

                // Stolen B1 Attack Platform attacks and does not restore
                context.player2.clickCard(context.b1AttackPlatform);
                context.player2.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(10);
            });

            it('should give Restore 1 to his new controller\'s Separatists when the opponent takes control of him', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['nute-gunray#ring-ring-space-calling', 'b1-attack-platform'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        groundArena: ['droid-commando'],
                        base: { card: 'jedha-city', damage: 10 },
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Player 2 takes control of Nute with Change of Heart
                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.nuteGunrayRingRingSpaceCalling);
                expect(context.nuteGunrayRingRingSpaceCalling).toBeInZone('groundArena', context.player2);

                // Player 1's B1 Attack Platform attacks and no longer restores
                context.player1.clickCard(context.b1AttackPlatform);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(10);

                // Player 2's Droid Commando attacks and restores 1
                context.player2.clickCard(context.droidCommando);
                context.player2.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(14);
            });
        });
    });
});
