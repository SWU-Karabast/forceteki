describe('Pre Vizsla, Pursuing the Throne', function () {
    integration(function (contextRef) {
        it('Pre Vizsla\'s leader undeployed ability should deal damage to a unit equal to the number of cards drawn this phase', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mission-briefing', 'search-your-feelings'],
                    leader: 'pre-vizsla#pursuing-the-throne',
                    deck: ['superlaser-blast', 'atst', 'avenger#hunting-star-destroyer'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['strategic-analysis'],
                    groundArena: ['wampa'],
                    spaceArena: ['green-squadron-awing'],
                },
            });

            const { context } = contextRef;

            // draw 2 cards
            context.player1.clickCard(context.missionBriefing);
            context.player1.clickPrompt('You');

            // opponent draw 3 cards
            context.player2.clickCard(context.strategicAnalysis);
            expect(context.player2.hand.length).toBe(3);

            // draw a specific cards
            context.player1.clickCard(context.searchYourFeelings);
            context.player1.clickCardInDisplayCardPrompt(context.avenger);
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

            context.moveToNextActionPhase();

            // no card drawn this phase
            context.player1.clickCard(context.preVizsla);
            context.player1.clickPrompt('Deal damage to a unit equal to the number of cards you\'ve drawn this phase');
            expect(context.player2).toBeActivePlayer();
        });

        it('Pre Vizsla\'s leader deployed abilityshould have Saboteur while we have 3 cards or more in hand and +2/+0 while we have 6 cards or more in hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['b1-security-team', 'battlefield-marine'],
                    leader: { card: 'pre-vizsla#pursuing-the-throne', deployed: true },
                    discard: ['strategic-analysis']
                },
                player2: {
                    groundArena: ['echo-base-defender'],
                },
            });
            const { context } = contextRef;

            expect(context.preVizsla.getPower()).toBe(4);
            expect(context.preVizsla.getHp()).toBe(6);

            // 2 cards in hand > does not have saboteur
            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender]);
            context.player1.clickCard(context.echoBaseDefender);
            context.player1.moveCard(context.strategicAnalysis, 'hand');
            context.player2.moveCard(context.echoBaseDefender, 'groundArena');

            context.preVizsla.exhausted = false;
            context.player2.passAction();

            // 3 cards in hand > have saboteur
            context.player1.clickCard(context.preVizsla);
            expect(context.player1).toBeAbleToSelectExactly([context.echoBaseDefender, context.p2Base]);
            context.player1.clickCard(context.p2Base);
            expect(context.p2Base.damage).toBe(4);

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
