describe('Steela Gerrera, Beloved Tactician', function () {
    integration(function (contextRef) {
        it('Steela Gerrera\'s ability should deal 2 damage to our base to search the top 8 cards of deck for a tactic card', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['steela-gerrera#beloved-tactician'],
                    deck: [
                        'superlaser-blast',
                        'battlefield-marine',
                        'strike-true',
                        'wampa',
                        'atst',
                        'takedown',
                        'consular-security-force',
                        'pyke-sentinel',
                        'green-squadron-awing'
                    ]
                },
                player2: {
                    hand: ['rivals-fall'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.steelaGerrera);

            // deal 2 damage to our base to search the top 8 card of deck for a tactic card
            expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to your base');
            context.player1.clickPrompt('Deal 2 damage to your base');

            expect(context.player1).toHaveExactDisplayPromptCards({
                selectable: [context.takedown, context.superlaserBlast, context.strikeTrue],
                invalid: [context.battlefieldMarine, context.wampa, context.consularSecurityForce, context.atst, context.pykeSentinel]
            });
            expect(context.player1).toHaveEnabledPromptButton('Take nothing');

            // draw superlaser blast
            context.player1.clickCardInDisplayCardPrompt(context.superlaserBlast);

            expect(context.player2).toBeActivePlayer();
            expect(context.p1Base.damage).toBe(2);

            expect(context.getChatLogs(2)).toContain('player1 takes Superlaser Blast');
            expect(context.superlaserBlast).toBeInZone('hand');

            expect(context.battlefieldMarine).toBeInBottomOfDeck(context.player1, 7);
            expect(context.atst).toBeInBottomOfDeck(context.player1, 7);
            expect(context.strikeTrue).toBeInBottomOfDeck(context.player1, 7);
            expect(context.takedown).toBeInBottomOfDeck(context.player1, 7);
            expect(context.wampa).toBeInBottomOfDeck(context.player1, 7);
            expect(context.consularSecurityForce).toBeInBottomOfDeck(context.player1, 7);
            expect(context.pykeSentinel).toBeInBottomOfDeck(context.player1, 7);

            // kill steela gerrera, should have prompt again
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.steelaGerrera);

            expect(context.player1).toHavePassAbilityPrompt('Deal 2 damage to your base');

            // pass, nothing happen
            context.player1.clickPrompt('Pass');
            expect(context.player1).toBeActivePlayer();
        });
    });
});
