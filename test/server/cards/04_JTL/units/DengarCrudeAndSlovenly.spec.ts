describe('Dengar, Crude and Slovenly', function() {
    integration(function(contextRef) {
        describe('Dengar, Crude and Slovenly\'s piloting ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dengar#crude-and-slovenly'],
                        groundArena: ['snowspeeder'],
                        spaceArena: ['cartel-spacer']
                    },
                    player2: {
                        groundArena: ['atst']
                    }
                });
            });

            it('should deal 2 indirect damage to a player if attached unit is not Underworld when played as a pilot', function() {
                const { context } = contextRef;

                // Play Dengar with Piloting
                context.player1.clickCard(context.dengar);
                context.player1.clickPrompt('Play Dengar with Piloting');
                context.player1.clickCard(context.snowspeeder);

                context.player2.passAction();

                // Attack with attached unit
                context.player1.clickCard(context.snowspeeder);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).not.toHavePassAbilityButton();

                // Snowspeeder's is not Underworld so it should deal 2 indirect damage
                context.player1.clickPrompt('Deal 2 indirect damage to a player. If attached unit is Underworld, deal 3 indirect damage instead.');
                context.player1.clickPrompt('Opponent');
                expect(context.player2).toBeAbleToSelectExactly([context.p2Base, context.atst]);
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.atst, 1],
                    [context.p2Base, 1],
                ]));
                context.player1.clickCard(context.atst); // Snowspeeder's ability
                expect(context.p2Base.damage).toBe(5); // 4 Unit attack + 1 Dengar's ability
                expect(context.atst.damage).toBe(1);
            });

            it('should deal 3 indirect damage to a player if attached unit is Underworld when played as a pilot', function() {
                const { context } = contextRef;

                // Play Dengar with Piloting
                context.player1.clickCard(context.dengar);
                context.player1.clickPrompt('Play Dengar with Piloting');
                context.player1.clickCard(context.cartelSpacer);
                context.player2.passAction();

                // Attack with attached unit
                context.player1.clickCard(context.cartelSpacer);
                context.player1.clickCard(context.p2Base);

                // Cartel Spacer is Underworld so it should deal 3 indirect damage
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickPrompt('Opponent');
                expect(context.player2).toBeAbleToSelectExactly([context.p2Base, context.atst]);
                context.player2.setDistributeIndirectDamagePromptState(new Map([
                    [context.atst, 1],
                    [context.p2Base, 2],
                ]));
                expect(context.p2Base.damage).toBe(5); // 3 Unit attack + 2 Dengar's ability
                expect(context.atst.damage).toBe(1);
            });
        });
    });
});