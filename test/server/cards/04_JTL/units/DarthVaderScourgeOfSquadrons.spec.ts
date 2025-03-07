describe('Darth Vader, Scourge Of Squadrons', function() {
    integration(function(contextRef) {
        describe('Darth Vader, Scourge Of Squadrons\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons', 'survivors-gauntlet'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        spaceArena: ['alliance-xwing', 'tieln-fighter']
                    }
                });
            });

            it('should give restore 1 to the attached unit when played as a pilot', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.allianceXwing);

                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.ruthlessRaider]);
                context.player1.clickCard(context.tielnFighter);
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base, context.ruthlessRaider]);
                context.player1.clickCard(context.p2Base);
                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});