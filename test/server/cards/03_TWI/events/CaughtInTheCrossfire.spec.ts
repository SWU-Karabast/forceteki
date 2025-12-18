describe('Caught In The Crossfire', function() {
    integration(function(contextRef) {
        describe('Caught In The Crossfire\'s event ability', function() {
            it('should allow to pick 2 enemy units in the same arena and those units will deal damage to each other (ground units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire'],
                        groundArena: ['atst']
                    },
                    player2: {
                        groundArena: ['clan-wren-rescuer'],
                        spaceArena: ['awing', 'green-squadron-awing'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true }
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.caughtInTheCrossfire);

                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.sabineWren, context.awing, context.greenSquadronAwing]);
                context.player1.clickCard(context.sabineWren);

                expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.sabineWren]);
                context.player1.clickCard(context.clanWrenRescuer);

                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.clanWrenRescuer).toBeInZone('discard');
                expect(context.sabineWren.damage).toBe(1);
            });

            it('should allow to pick 2 enemy units in the same arena and those units will deal damage to each other (space units)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire'],
                    },
                    player2: {
                        groundArena: ['wampa', 'yoda#old-master'],
                        spaceArena: ['cartel-spacer', 'headhunter-squadron', 'avenger#hunting-star-destroyer'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.caughtInTheCrossfire);

                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer, context.headhunterSquadron, context.avenger, context.wampa, context.yoda]);
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.headhunterSquadron);
                context.player1.clickCardNonChecking(context.avenger);

                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.cartelSpacer.damage).toBe(1);
                expect(context.headhunterSquadron.damage).toBe(2);
            });

            it('does nothing if the opponent controls only one unit in an arena', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire'],
                        groundArena: ['atst', 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: ['clan-wren-rescuer'],
                        spaceArena: ['cartel-spacer'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.caughtInTheCrossfire);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
            });

            it('does nothing if the opponent controls no units', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire'],
                        groundArena: ['atst', 'battlefield-marine'],
                    },
                });
                const { context } = contextRef;

                context.player1.clickCard(context.caughtInTheCrossfire);
                context.player1.clickPrompt('Play anyway');

                expect(context.player2).toBeActivePlayer();
            });

            it('should set who defeat the units to the opponent (Bravado)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['caught-in-the-crossfire', 'bravado'],
                        groundArena: [{ card: 'wampa', exhausted: true }],
                        base: 'tarkintown'
                    },
                    player2: {
                        groundArena: ['battlefield-marine', 'imperial-dark-trooper'],
                    }

                });
                const { context } = contextRef;

                context.player1.clickCard(context.caughtInTheCrossfire);
                context.player1.clickCard(context.imperialDarkTrooper);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickDone();

                expect(context.player2).toBeActivePlayer();
                expect(context.imperialDarkTrooper).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');

                context.player2.passAction();
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                // 6 from caught in the crossfire + 5 from bravado
                expect(context.player1.exhaustedResourceCount).toBe(11);
            });
        });
    });
});
