describe('0-0-0, Translation and Torture', function() {
    integration(function(contextRef) {
        it('0-0-0\'s ability should put an Aggression card from own discard to bottom of deck to deal one damage to enemy base', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['000#translation-and-torture'],
                    discard: ['wrecker#boom', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context._000TranslationAndTorture);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.greenSquadronAwing, context.wrecker, context.daringRaid, context.suddenFerocity]);
            expect(context.player1).toHavePassAbilityButton();

            context.player1.clickCard(context.wrecker);
            expect(context.player2).toBeActivePlayer();
            expect(context.p2Base.damage).toBe(5);
            expect(context.wrecker).toBeInBottomOfDeck(context.player1, 1);
        });

        it('should be able to be passed', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['000#translation-and-torture'],
                    discard: ['wrecker#boom', 'echo#restored', 'green-squadron-awing', 'daring-raid', 'sudden-ferocity']
                },
                player2: {
                    discard: ['wolffe#suspicious-veteran']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context._000TranslationAndTorture);
            context.player1.clickCard(context.p2Base);
            context.player1.clickPrompt('Pass');

            expect(context.greenSquadronAwing).toBeInZone('discard');
            expect(context.wrecker).toBeInZone('discard');
            expect(context.daringRaid).toBeInZone('discard');
            expect(context.suddenFerocity).toBeInZone('discard');
            expect(context.p2Base.damage).toBe(4);
            expect(context.player2).toBeActivePlayer();
        });
    });
});