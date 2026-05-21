describe('R5-D4, Built for Adventure', function() {
    integration(function(contextRef) {
        it('R5-D4\'s On Attack ability should defeat all upgrades on the defending unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['r5d4#built-for-adventure'],
                },
                player2: {
                    groundArena: [{ card: 'yoda#old-master', upgrades: ['fulcrum', 'shield'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.r5d4BuiltForAdventure);
            context.player1.clickCard(context.yoda);

            expect(context.player2).toBeActivePlayer();
            expect(context.yoda).toHaveExactUpgradeNames([]);
            expect(context.fulcrum).toBeInZone('discard', context.player2);
            expect(context.yoda.damage).toBe(3);
            expect(context.r5d4.damage).toBe(2);
        });

        it('R5-D4\'s On Attack ability should defeat all upgrades on the defending unit (no upgrades on defending unit)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['r5d4#built-for-adventure'],
                },
                player2: {
                    groundArena: ['yoda#old-master']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.r5d4BuiltForAdventure);
            context.player1.clickCard(context.yoda);

            expect(context.player2).toBeActivePlayer();
            expect(context.yoda.damage).toBe(3);
            expect(context.r5d4.damage).toBe(2);
        });

        it('R5-D4\'s On Attack ability should not defeat any upgrades if attacking base', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['r5d4#built-for-adventure'],
                },
                player2: {
                    groundArena: [{ card: 'yoda#old-master', upgrades: ['fulcrum', 'shield'] }]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.r5d4BuiltForAdventure);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(3);
            expect(context.yoda).toHaveExactUpgradeNames(['fulcrum', 'shield']);
        });

        it('R5-D4\'s Support ability should defeat Pilot upgrades', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['chewbacca#faithful-first-mate'],
                    spaceArena: ['awing']
                },
                player2: {
                    hand: ['r5d4#built-for-adventure'],
                    spaceArena: ['green-squadron-awing']
                },
            });

            const { context } = contextRef;


            context.player1.clickCard(context.chewbacca);
            context.player1.clickPrompt('Play Chewbacca with Piloting');
            context.player1.clickCard(context.awing);

            context.player2.clickCard(context.r5d4BuiltForAdventure);
            context.player2.clickCard(context.greenSquadronAwing);
            context.player2.clickCard(context.awing);

            expect(context.player1).toBeActivePlayer();
            expect(context.greenSquadronAwing.damage).toBe(1);
            expect(context.awing).toBeInZone('discard', context.player1);
            expect(context.chewbacca).toBeInZone('discard', context.player1);
        });

        it('R5-D4\'s Support ability should upgrades on all targets (TWI Darth Maul)', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['r5d4#built-for-adventure'],
                    groundArena: ['darth-maul#revenge-at-last']
                },
                player2: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['shield', 'mastery'] }, { card: 'gungi#finding-himself', upgrades: ['shield'] }]
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.r5d4);
            context.player1.clickCard(context.darthMaul);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.gungi);
            context.player1.clickDone();

            expect(context.player2).toBeActivePlayer();
            expect(context.darthMaul.damage).toBe(5);
            expect(context.gungi).toBeInZone('discard', context.player2);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.mastery).toBeInZone('discard', context.player2);
        });
    });
});
