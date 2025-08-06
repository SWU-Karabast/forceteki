describe('Guerilla Soldier', function() {
    integration(function(contextRef) {
        beforeEach(function() {
            return contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['guerilla-soldier'],
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'republic-arc170', 'headhunter-squadron']
                }
            });
        });

        it('Guerilla Soldier\'s ability should deal 3 indirect damage to a player and ready the unit if a base was damaged', function () {
            const { context } = contextRef;

            // Player 1 plays Guerilla Soldier
            context.player1.clickCard(context.guerillaSoldier);
            expect(context.player1).toHavePrompt('Choose a player to deal 3 indirect damage to');
            expect(context.guerillaSoldier.exhausted).toBeTrue();

            // Player 1 distributes the indirect damage and chooses the base
            context.player1.clickPrompt('Deal indirect damage to yourself');
            expect(context.player1).toBeAbleToSelectExactly([context.guerillaSoldier, context.p1Base]);
            expect(context.player1).not.toHaveChooseNothingButton();
            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.guerillaSoldier, 2],
                [context.p1Base, 1],
            ]));

            expect(context.guerillaSoldier.exhausted).toBeFalse();
        });

        it('Guerilla Soldier\'s ability should deal 3 indirect damage to a player and not ready the unit if a base was not damaged', function () {
            const { context } = contextRef;

            // Player 1 plays Guerilla Soldier
            context.player1.clickCard(context.guerillaSoldier);
            expect(context.player1).toHavePrompt('Choose a player to deal 3 indirect damage to');
            expect(context.guerillaSoldier.exhausted).toBeTrue();

            // Player 2 distributes the indirect damage without choosing the base
            context.player1.clickPrompt('Deal indirect damage to opponent');
            expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing, context.republicArc170, context.headhunterSquadron, context.p2Base]);
            expect(context.player2).not.toHaveChooseNothingButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.greenSquadronAwing, 1],
                [context.republicArc170, 1],
                [context.headhunterSquadron, 1],
            ]));

            expect(context.guerillaSoldier.exhausted).toBeTrue();
        });
    });
});
