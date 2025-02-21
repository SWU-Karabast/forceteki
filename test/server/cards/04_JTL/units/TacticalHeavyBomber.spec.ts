describe('Tactical Heavy Bomber', function() {
    integration(function(contextRef) {
        it('Tactical Heavy Bomber\'s ability should deal indirect damage to the defending player equal to the unit\'s attack and let you draw a card if a base is damage this way', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'tactical-heavy-bomber', upgrades: ['experience'] }],
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'republic-arc170', 'headhunter-squadron'],
                }
            });

            const { context } = contextRef;

            // Player 1 attacks with Tactical Heavy Bomber
            context.player1.clickCard(context.tacticalHeavyBomber);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.handSize).toBe(0);

            // Player 2 distributes the indirect damage and chooses the base
            expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing, context.republicArc170, context.headhunterSquadron, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.greenSquadronAwing, 1],
                [context.republicArc170, 1],
                [context.headhunterSquadron, 1],
                [context.p2Base, 1],
            ]));

            expect(context.player1.handSize).toBe(1);
        });

        it('Tactical Heavy Bomber\'s ability should deal indirect damage to the defending player equal to the unit\'s attack and does not let you draw a card if a base is not damage this way', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    spaceArena: [{ card: 'tactical-heavy-bomber', upgrades: ['experience', 'experience'] }],
                },
                player2: {
                    spaceArena: ['green-squadron-awing', 'republic-arc170', 'headhunter-squadron'],
                }
            });

            const { context } = contextRef;

            // Player 1 attacks with Tactical Heavy Bomber
            context.player1.clickCard(context.tacticalHeavyBomber);
            context.player1.clickCard(context.p2Base);
            expect(context.player1.handSize).toBe(0);

            // Player 2 distributes the indirect damage and chooses the base
            expect(context.player2).toBeAbleToSelectExactly([context.greenSquadronAwing, context.republicArc170, context.headhunterSquadron, context.p2Base]);
            expect(context.player2).not.toHaveChooseNoTargetButton();
            context.player2.setDistributeIndirectDamagePromptState(new Map([
                [context.greenSquadronAwing, 1],
                [context.republicArc170, 1],
                [context.headhunterSquadron, 3],
            ]));

            expect(context.player1.handSize).toBe(0);
        });
    });
});
