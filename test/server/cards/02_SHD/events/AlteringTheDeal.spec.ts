describe('Altering the Deal', function() {
    integration(function(contextRef) {
        it('Altering the Deal\'s event ability should discard a card guarded by a friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['take-captive', 'take-captive', 'discerning-veteran', 'altering-the-deal'],
                    groundArena: ['wampa', 'atst', 'pyke-sentinel'],
                    spaceArena: ['tieln-fighter']
                },
                player2: {
                    groundArena: ['snowspeeder', 'specforce-soldier'],
                    spaceArena: ['ruthless-raider'],
                    hand: ['discerning-veteran', 'take-captive']
                },

                // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                autoSingleTarget: true
            });

            const { context } = contextRef;
            const [p1TakeCaptive1, p1TakeCaptive2] = context.player1.findCardsByName('take-captive');
            const p2TakeCaptive = context.player2.findCardByName('take-captive');
            const p1DiscerningVeteran = context.player1.findCardByName('discerning-veteran');
            const p2DiscerningVeteran = context.player2.findCardByName('discerning-veteran');

            // SETUP:
            // - P2 Discerning Veteran captures Wampa + AT-ST
            // - P1 Discerning Veteran captures Snowspeeder + SpecForce Soldier
            // - P1 TIE/LN captures Ruthless Raider
            context.player1.clickCard(p1TakeCaptive1);
            context.player1.clickCard(context.tielnFighter);

            context.player2.clickCard(p2DiscerningVeteran);
            context.player2.clickCard(context.wampa);

            context.player1.clickCard(p1DiscerningVeteran);
            context.player1.clickCard(context.snowspeeder);

            context.player2.clickCard(p2TakeCaptive);
            context.player2.clickCard(p2DiscerningVeteran);
            context.player2.clickCard(context.atst);

            context.player1.clickCard(p1TakeCaptive2);
            context.player1.clickCard(p1DiscerningVeteran);
            context.player1.clickCard(context.specforceSoldier);

            context.player2.passAction();

            // TEST: can't select friendly cards (Wampa, AT-ST) guarded by enemy unit
            context.player1.clickCard(context.alteringTheDeal);
            expect(context.player1).toBeAbleToSelectExactly([context.ruthlessRaider, context.snowspeeder, context.specforceSoldier]);
            context.player1.clickCard(context.ruthlessRaider);
            expect(context.ruthlessRaider).toBeInZone('discard');
            expect(context.player2).toBeActivePlayer();
        });
    });
});
