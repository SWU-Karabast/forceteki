describe('Grand Admiral Thrawn, Patient and Insightful', function () {
    integration(function (contextRef) {
        describe('Grand Admiral Thrawn\'s undeployed ability', function () {
            it('should look at top deck of each player and should reveal top deck of a player to exhaust a unit which cost same or less than the revealed card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        deck: ['takedown', 'vanquish', 'rivals-fall'],
                        groundArena: ['battlefield-marine'],
                        leader: 'grand-admiral-thrawn#patient-and-insightful',
                        resources: 3,
                    },
                    player2: {
                        groundArena: ['wampa'],
                        deck: ['atst', 'avenger#hunting-star-destroyer', 'specforce-soldier']
                    }
                });
                const { context } = contextRef;

                // go to the next action phase
                context.player1.passAction();
                context.player2.passAction();
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // thrawn ability reveal top deck of each player
                expect(context.getChatLogs(2, true)).toEqual([
                    'player1 uses Grand Admiral Thrawn to look at a card',
                    'Grand Admiral Thrawn sees Rival\'s Fall and SpecForce Soldier'
                ]);

                context.player1.clickCard(context.grandAdmiralThrawn);

                expect(context.player1).toHaveExactPromptButtons(['Reveal your top deck cards', 'Reveal opponent top deck cards']);
                context.player1.clickPrompt('Reveal your top deck cards');

                expect(context.getChatLogs(1)).toContain('player1 reveals Rival\'s Fall due to Grand Admiral Thrawn');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();

                expect(context.wampa.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
            });
        });

        describe('Grand Admiral Thrawn\'s deployed ability', function () {
            it('should look at top deck of each player and on attack ability should reveal top deck of a player to exhaust a unit which cost same or less than the revealed card', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        deck: ['takedown', 'vanquish', 'rivals-fall'],
                        groundArena: ['battlefield-marine'],
                        leader: { card: 'grand-admiral-thrawn#patient-and-insightful', deployed: true },
                    },
                    player2: {
                        groundArena: ['wampa'],
                        deck: ['atst', 'avenger#hunting-star-destroyer', 'specforce-soldier']
                    }
                });
                const { context } = contextRef;

                // go to the next action phase
                context.player1.passAction();
                context.player2.passAction();
                context.player1.clickPrompt('Done');
                context.player2.clickPrompt('Done');

                // thrawn ability reveal top deck of each player
                expect(context.getChatLogs(2, true)).toEqual([
                    'player1 uses Grand Admiral Thrawn to look at a card',
                    'Grand Admiral Thrawn sees Rival\'s Fall and SpecForce Soldier'
                ]);

                context.player1.clickCard(context.grandAdmiralThrawn);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHaveExactPromptButtons(['Reveal your top deck cards', 'Reveal opponent top deck cards']);
                context.player1.clickPrompt('Reveal your top deck cards');

                // confirm optional ability
                expect(context.player1).toHavePassAbilityPrompt('Reveal the top card of any player\'s deck');
                context.player1.clickPrompt('Reveal the top card of any player\'s deck');

                expect(context.getChatLogs(1, true)).toContain('player1 reveals Rival\'s Fall due to Grand Admiral Thrawn');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.grandAdmiralThrawn]);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeActivePlayer();
                expect(context.wampa.exhausted).toBeTrue();
            });
        });
    });
});
