describe('Pre Vizsla, Pursuing the Throne', function () {
    integration(function (contextRef) {
        it('Pre Vizsla\'s leader undeployed ability should deal damage to a unit equal to the number of cards drawn this phase', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['mission-briefing', 'search-your-feelings'],
                    leader: 'pre-vizsla#pursuing-the-throne',
                    deck: ['superlaser-blast', 'atst', 'avenger#hunting-star-destroyer'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing'],
                },
            });

            const { context } = contextRef;

            // draw 2 cards
            context.player1.clickCard(context.missionBriefing);
            context.player1.clickPrompt('You');
            context.player2.passAction();

            // draw a specific cards
            context.player1.clickCard(context.searchYourFeelings);
            context.player1.clickPrompt(context.avenger.title);
            context.player2.passAction();

            const exhaustedResourceCount = context.player1.exhaustedResourceCount;

            context.player1.clickCard(context.preVizsla);
            context.player1.clickPrompt('Deal damage to a unit equal to the number of cards you\'ve drawn this phase');

            // can select all unit
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.wampa, context.greenSquadronAwing]);
            context.player1.clickCard(context.wampa);

            expect(context.wampa.damage).toBe(3);
            expect(context.player1.exhaustedResourceCount - exhaustedResourceCount).toBe(1);
            expect(context.preVizsla.exhausted).toBeTrue();
        });

        it('Pre Vizsla\'s leader deployed abilityshould have Saboteur while we have 3 cards or more in hand and +2/+0 while we have 6 cards or more in hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['strategic-analysis', 'b1-security-team', 'battlefield-marine'],
                    leader: { card: 'pre-vizsla#pursuing-the-throne', deployed: true },
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                },
            });
            const { context } = contextRef;

            // 3 cards in hand > have saboteur
            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.p2Base]);
            context.player1.clickCard(context.p2Base);

            context.player2.passAction();

            // draw 3 and bring back the 6th
            context.player1.clickCard(context.strategicAnalysis);
            context.player1.moveCard(context.strategicAnalysis, 'hand');

            context.player2.passAction();

            // 6 cards on hand > +2/+0
            expect(context.preVizsla.getPower()).toBe(6);
            expect(context.preVizsla.getHp()).toBe(6);
        });
    });
});