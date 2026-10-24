describe('Don\'t Touch Anything', function() {
    integration(function(contextRef) {
        describe('Don\'t Touch Anything\'s ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dont-touch-anything'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['green-squadron-awing'],
                    },
                    player2: {
                        groundArena: ['wampa', 'atst'],
                        spaceArena: ['ruthless-raider'],
                    }
                });
            });

            it('should deal 3 damage to a random enemy unit', function() {
                const { context } = contextRef;

                context.game.setRandomSeed('khgfk');

                context.player1.clickCard(context.dontTouchAnything);

                expect(context.getChatLogs(1)).toContain('player1 plays Don\'t Touch Anything to randomly select Ruthless Raider from Wampa, AT-ST, and Ruthless Raider, and to deal 3 damage to Ruthless Raider');
                expect(context.ruthlessRaider.damage).toBe(3);
                expect(context.wampa.damage).toBe(0);
                expect(context.atst.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.p1Base.damage).toBe(0);
                expect(context.p2Base.damage).toBe(0);
                expect(context.dontTouchAnything).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to select a different enemy unit', function() {
                const { context } = contextRef;

                context.game.setRandomSeed('abcde');

                context.player1.clickCard(context.dontTouchAnything);

                expect(context.getChatLogs(1)).toContain('player1 plays Don\'t Touch Anything to randomly select AT-ST from Wampa, AT-ST, and Ruthless Raider, and to deal 3 damage to AT-ST');
                expect(context.atst.damage).toBe(3);
                expect(context.wampa.damage).toBe(0);
                expect(context.ruthlessRaider.damage).toBe(0);
                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.greenSquadronAwing.damage).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Don\'t Touch Anything\'s ability should deal 3 damage to the only enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dont-touch-anything'],
                    groundArena: ['battlefield-marine'],
                },
                player2: {
                    groundArena: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dontTouchAnything);

            expect(context.wampa.damage).toBe(3);
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Don\'t Touch Anything\'s ability should defeat an enemy unit with 3 or less remaining HP', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dont-touch-anything'],
                },
                player2: {
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dontTouchAnything);

            expect(context.cartelSpacer).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });

        it('Don\'t Touch Anything\'s ability should be able to deal damage to an enemy leader unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dont-touch-anything'],
                },
                player2: {
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true },
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dontTouchAnything);

            expect(context.bobaFett.damage).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('Don\'t Touch Anything\'s ability should do nothing when there are no enemy units', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['dont-touch-anything'],
                    groundArena: ['battlefield-marine'],
                    leader: 'han-solo#audacious-smuggler',
                },
                player2: {
                    hand: ['wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.dontTouchAnything);
            context.player1.clickPrompt('Play anyway');

            expect(context.dontTouchAnything).toBeInZone('discard');
            expect(context.battlefieldMarine.damage).toBe(0);
            expect(context.p2Base.damage).toBe(0);
            expect(context.player1.exhaustedResourceCount).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
