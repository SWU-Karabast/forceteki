describe('Darth Vader, Scourge Of Squadrons', function() {
    integration(function(contextRef) {
        describe('Darth Vader, Scourge Of Squadrons\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['darth-vader#scourge-of-squadrons'],
                        spaceArena: ['ruthless-raider']
                    },
                    player2: {
                        groundArena: [{ card: 'determined-recruit', upgrades: ['shield'] }],
                        spaceArena: ['alliance-xwing', 'tieln-fighter']
                    }
                });
            });

            it('should deal 1 damage, if a unit is defeated this way it should deal 1 damage to a unit or base', function() {
                const { context } = contextRef;

                // Play Darth Vader with Piloting
                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                // Attack with attached unit
                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.allianceXwing);

                // Triggers first damage ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit. If a unit is defeated this way, deal 1 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.ruthlessRaider, context.determinedRecruit]);
                context.player1.clickCard(context.tielnFighter);

                // Unit is defeated with ability
                expect(context.tielnFighter).toBeInZone('discard');
                expect(context.player1).toHavePassAbilityButton();

                // Vader's ability can deal 1 damage to a unit or base
                expect(context.player1).toHavePassAbilityPrompt('Deal 1 damage to a unit or base');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.p2Base, context.p1Base, context.ruthlessRaider, context.allianceXwing, context.determinedRecruit]);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage, if that damage does not defeat a unit no extra damage is dealt by the ability', function() {
                const { context } = contextRef;

                // Play Darth Vader with Piloting
                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                // Attack with attached unit
                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.tielnFighter);

                // Triggers first damage ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit. If a unit is defeated this way, deal 1 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.ruthlessRaider, context.determinedRecruit]);
                context.player1.clickCard(context.allianceXwing);

                expect(context.allianceXwing.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should deal 1 damage, if that damage does not defeat a unit because of a shield no extra damage is dealt by the ability', function() {
                const { context } = contextRef;

                // Play Darth Vader with Piloting
                context.player1.clickCard(context.darthVaderScourgeOfSquadrons);
                context.player1.clickPrompt('Play Darth Vader with Piloting');
                context.player1.clickCard(context.ruthlessRaider);

                // Attack with attached unit
                context.player2.passAction();
                context.player1.clickCard(context.ruthlessRaider);
                context.player1.clickCard(context.tielnFighter);

                // Triggers first damage ability
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit. If a unit is defeated this way, deal 1 damage to a unit or base');
                expect(context.player1).toBeAbleToSelectExactly([context.allianceXwing, context.tielnFighter, context.ruthlessRaider, context.determinedRecruit]);
                context.player1.clickCard(context.determinedRecruit);

                expect(context.determinedRecruit).toHaveExactUpgradeNames([]);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});