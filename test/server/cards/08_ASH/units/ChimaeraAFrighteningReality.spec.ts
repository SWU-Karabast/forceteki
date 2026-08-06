describe('Chimaera, A Frightening Reality', function() {
    integration(function(contextRef) {
        describe('When played ability', function() {
            it('should defeat a friendly unit and an enemy unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#a-frightening-reality'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                // Choose friendly unit to defeat - can choose Chimaera or A-wing
                expect(context.player1).toHavePrompt('Choose a friendly unit and an enemy non-leader unit. If you do, defeat those units');
                expect(context.player1).toBeAbleToSelectExactly([context.chimaera, context.awing]);
                context.player1.clickCard(context.awing);

                // Choose enemy non-leader unit to defeat
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player2).toBeActivePlayer();

                expect(context.awing).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.chimaera).toBeInZone('spaceArena');
            });

            it('should allow passing the ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#a-frightening-reality'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                expect(context.awing).toBeInZone('spaceArena');
                expect(context.battlefieldMarine).toBeInZone('groundArena');
                expect(context.chimaera).toBeInZone('spaceArena');
                expect(context.p1Base.damage).toBe(0);

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat friendly unit and enemy unit (but enemy unit is not defeatable)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#a-frightening-reality'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        groundArena: ['chewbacca#faithful-first-mate']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.awing);
                context.player1.clickCard(context.chewbacca);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('discard');
                expect(context.chewbacca).toBeInZone('groundArena');
            });

            it('cannot choose an enemy leader unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#a-frightening-reality'],
                        spaceArena: ['awing']
                    },
                    player2: {
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('spaceArena');
                expect(context.sabineWren).toBeInZone('groundArena');
            });

            it('cannot defeat a single unit (friendly)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['chimaera#a-frightening-reality'],
                        spaceArena: ['awing']
                    },
                    player2: {}
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);

                expect(context.player2).toBeActivePlayer();
                expect(context.awing).toBeInZone('spaceArena');
            });
        });

        describe('Triggered ability', function() {
            it('should heal 2 damage from base when an enemy unit is defeated by another source', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#a-frightening-reality'],
                        hand: ['vanquish'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Defeat enemy unit with vanquish
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');

                // Base should be healed 2 from the triggered ability (5 -> 3)
                expect(context.p1Base.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            it('should heal 2 damage from base when an enemy unit is defeated by combat damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#a-frightening-reality'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        spaceArena: ['awing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.awing);

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should trigger for each enemy unit defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#a-frightening-reality'],
                        hand: ['vanquish', 'takedown'],
                        base: { card: 'echo-base', damage: 10 }
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'sundari-peacekeeper']
                    }
                });

                const { context } = contextRef;

                // Defeat first enemy unit with vanquish
                context.player1.clickCard(context.vanquish);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard');

                // Base should be healed 2 from first defeat (10 -> 8)
                expect(context.p1Base.damage).toBe(8);

                context.player2.passAction();

                // Defeat second enemy unit with takedown
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.sundariPeacekeeper);

                expect(context.sundariPeacekeeper).toBeInZone('discard');

                // Base should be healed 4 total from defeating 2 enemy units (8 -> 6)
                expect(context.p1Base.damage).toBe(6);

                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger when friendly units are defeated', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#a-frightening-reality'],
                        groundArena: ['wampa'],
                        hand: ['takedown'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                });

                const { context } = contextRef;

                // Defeat friendly unit with Takedown
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');

                // Base damage should remain unchanged (no heal)
                expect(context.p1Base.damage).toBe(5);

                expect(context.player2).toBeActivePlayer();
            });

            it('should trigger on friendly units under enemy\'s control', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#a-frightening-reality'],
                        groundArena: ['wampa'],
                        hand: ['takedown'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['change-of-heart']
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('groundArena', context.player2);

                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(3);
            });

            it('should not trigger when defeating Pilot attached as upgrade', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['chimaera#a-frightening-reality'],
                        hand: ['outer-rim-constable'],
                        base: { card: 'echo-base', damage: 5 }
                    },
                    player2: {
                        spaceArena: ['awing'],
                        hand: ['chewbacca#faithful-first-mate'],
                        hasInitiative: true,
                    }
                });

                const { context } = contextRef;

                context.player2.clickCard(context.chewbacca);
                context.player2.clickPrompt('Play Chewbacca with Piloting');
                context.player2.clickCard(context.awing);

                context.player1.clickCard(context.outerRimConstable);
                context.player1.clickCard(context.chewbacca);

                expect(context.chewbacca).toBeInZone('discard');

                expect(context.player2).toBeActivePlayer();
                expect(context.p1Base.damage).toBe(5);
            });
        });
    });
});
