describe('Merrin, Alone with the Dead', function() {
    integration(function(contextRef) {
        it('Merrin\'s on attack ability should give allow you to discard a card to deal 2 damage to a unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['battlefield-marine', 'vanquish', 'generals-blade'],
                    groundArena: ['merrin#alone-with-the-dead', 'isb-agent'],
                    spaceArena: ['red-squadron-xwing'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.merrin);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.vanquish, context.generalsBlade]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.cartelSpacer, context.redSquadronXwing, context.merrin, context.isbAgent]);

            context.player1.clickCard(context.wampa);
            expect(context.wampa.damage).toBe(2);
        });

        it('Merrin\'s on attack ability should do nothing if hand is empty', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: [],
                    groundArena: ['merrin#alone-with-the-dead', 'isb-agent'],
                    spaceArena: ['red-squadron-xwing'],
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['cartel-spacer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.merrin);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(2);
            expect(context.player2).toBeActivePlayer();
        });
    });
});