describe('The Mandalorian, From the Shadows', function() {
    integration(function(contextRef) {
        it('Mandalorian\'s On Attack ability should give -4/-0 to the defending unit if it is exhausted', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-mandalorian#from-the-shadows'],
                },
                player2: {
                    groundArena: [{ card: 'atst', exhausted: true }],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theMandalorian);
            context.player1.clickCard(context.atst);

            // AT-ST power is reduced to 2 for this attack, so it only deals 2 damage back
            expect(context.atst.damage).toBe(5);
            expect(context.theMandalorian.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mandalorian\'s On Attack ability should not give -4/-0 if the defending unit is ready', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-mandalorian#from-the-shadows'],
                },
                player2: {
                    groundArena: ['atst'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theMandalorian);
            context.player1.clickCard(context.atst);

            // AT-ST keeps its full 6 power and defeats the 3 HP Mandalorian
            expect(context.atst.damage).toBe(5);
            expect(context.theMandalorian).toBeInZone('discard', context.player1);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mandalorian\'s On Attack ability should have no effect when attacking a base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['the-mandalorian#from-the-shadows'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.theMandalorian);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
            expect(context.theMandalorian.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mandalorian\'s On Attack ability, gained by Darth Maul via Improvised Identity, should give -4/-0 to each exhausted defending unit of a two-unit attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['improvised-identity'] }],
                    deck: ['the-mandalorian#from-the-shadows', 'cartel-spacer', 'takedown'],
                },
                player2: {
                    groundArena: [{ card: 'atst', exhausted: true }, { card: 'wampa', exhausted: true }],
                }
            });
            const { context } = contextRef;

            // Use Improvised Identity: discard The Mandalorian from the top 3 and attack with its abilities
            context.player1.clickCard(context.darthMaul);
            context.player1.clickPrompt('Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.');
            context.player1.clickCardInDisplayCardPrompt(context.theMandalorian);
            expect(context.theMandalorian).toBeInZone('discard', context.player1);

            // Maul attacks both exhausted defenders at once
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.wampa);
            context.player1.clickDone();

            // Both exhausted defenders get -4/-0: AT-ST deals only 2 damage back, Wampa deals nothing
            expect(context.atst.damage).toBe(5);
            expect(context.wampa).toBeInZone('discard', context.player2);
            expect(context.darthMaul.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mandalorian\'s On Attack ability, gained by Darth Maul via Improvised Identity, should only give -4/-0 to the exhausted defending unit of a two-unit attack', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'darth-maul#revenge-at-last', upgrades: ['improvised-identity'] }],
                    deck: ['the-mandalorian#from-the-shadows', 'cartel-spacer', 'takedown'],
                },
                player2: {
                    groundArena: [{ card: 'atst', exhausted: true }, 'battlefield-marine'],
                }
            });
            const { context } = contextRef;

            // Use Improvised Identity: discard The Mandalorian from the top 3 and attack with its abilities
            context.player1.clickCard(context.darthMaul);
            context.player1.clickPrompt('Search the top 3 cards of your deck for a ground unit and discard it. Then, you may attack with this unit. For this attack, this unit gains the discarded unit\'s abilities.');
            context.player1.clickCardInDisplayCardPrompt(context.theMandalorian);
            expect(context.theMandalorian).toBeInZone('discard', context.player1);

            // Maul attacks an exhausted AT-ST and a ready Battlefield Marine at once
            context.player1.clickCard(context.atst);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickDone();

            // Only the exhausted AT-ST gets -4/-0 (deals 2 back); the ready Marine deals its full 3 power
            expect(context.atst.damage).toBe(5);
            expect(context.battlefieldMarine).toBeInZone('discard', context.player2);
            expect(context.darthMaul.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
