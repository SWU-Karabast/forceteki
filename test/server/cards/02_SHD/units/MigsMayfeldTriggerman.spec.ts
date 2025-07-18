describe('Migs Mayfeld, Triggerman', function() {
    integration(function(contextRef) {
        describe('Migs Mayfeld\'s ability', function() {
            it('can deal two damage to a unit or base after a card is discarded from hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['pillage', 'forced-surrender', 'no-bargain', 'commission', 'fell-the-dragon'],
                        groundArena: ['grogu#irresistible', 'migs-mayfeld#triggerman']
                    },
                    player2: {
                        hand: ['confiscate', 'daring-raid', 'krayt-dragon'],
                        groundArena: [{ card: 'wampa', upgrades: ['shield'] }],
                        spaceArena: ['system-patrol-craft']
                    }
                });

                const { context } = contextRef;

                // CASE 1: Can deal two damage to a unit or base after a card is discarded from own hand and can optionally pass
                context.player1.clickCard(context.pillage);
                context.player1.clickPrompt('You discard');
                context.player1.clickCard(context.commission);
                context.player1.clickCard(context.fellTheDragon);
                context.player1.clickPrompt('Done');
                expect(context.player1).toBeAbleToSelectExactly([context.groguIrresistible, context.migsMayfeldTriggerman, context.wampa, context.systemPatrolCraft, context.p1Base, context.p2Base]);
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                // CASE 2: Cannot use the ability twice in a round
                context.player2.passAction();
                context.player1.clickCard(context.forcedSurrender);
                context.player2.clickCard(context.confiscate);
                context.player2.clickCard(context.daringRaid);
                context.player2.clickPrompt('Done');
                expect(context.player2).toBeActivePlayer();

                // CASE 3: Is usable in the next round and from opponent discarding
                context.moveToNextActionPhase();
                context.player1.clickCard(context.noBargain);
                context.player2.clickCard(context.kraytDragon);
                expect(context.player1).toBeAbleToSelectExactly([context.groguIrresistible, context.migsMayfeldTriggerman, context.wampa, context.systemPatrolCraft, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.systemPatrolCraft);
                expect(context.systemPatrolCraft.damage).toBe(2);
            });


            it('deals his damage after a discard event that deals damage resolves', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['migs-mayfeld#triggerman', 'yoda#old-master'],
                        hand: ['force-throw']
                    },
                    player2: {
                        hand: ['confiscate'],
                        groundArena: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.forceThrow);
                context.player1.clickPrompt('Opponent discards');
                context.player2.clickCard(context.confiscate);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(1);

                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.migsMayfeldTriggerman, context.yoda, context.wampa]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);

                expect(context.player2).toBeActivePlayer();
            });

            it('deals his damage even if the discarded card is discarded as a cost', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kylo-ren#rash-and-deadly',
                        groundArena: ['migs-mayfeld#triggerman'],
                        hand: ['wampa'],
                        resources: 3
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kyloRen);
                context.player1.clickCard(context.migsMayfeld);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });

            it('deals his damage even if the discarded card is discarded by a look-at system', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'sabine-wren#galvanized-revolutionary',
                        groundArena: ['migs-mayfeld#triggerman'],
                        hand: ['spark-of-rebellion']
                    },
                    player2: {
                        hand: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.sparkOfRebellion);
                context.player1.clickCardInDisplayCardPrompt(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                expect(context.player1).toBeAbleToSelectExactly([context.migsMayfeldTriggerman, context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
