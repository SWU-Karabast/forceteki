describe('For A Cause I Believe In', function() {
    integration(function(contextRef) {
        it('deals 4 damage to opponents base when 4 heroism cards are revealed', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['for-a-cause-i-believe-in'],
                    deck: [
                        'battlefield-marine',
                        'echo-base-defender',
                        'specforce-soldier',
                        'regional-sympathizers'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.forACauseIBelieveIn);

            // Top 4 cards are revealed in chat
            expect(context.getChatLogs(1)[0]).toContain(context.battlefieldMarine.title);
            expect(context.getChatLogs(1)[0]).toContain(context.specforceSoldier.title);
            expect(context.getChatLogs(1)[0]).toContain(context.echoBaseDefender.title);
            expect(context.getChatLogs(1)[0]).toContain(context.regionalSympathizers.title);

            // 4 damage is dealt for the 4 Heroic cards revealed
            expect(context.player2.base.damage).toBe(4);

            // P1 gets to choose what to do with the top 4 cards of their deck
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Discard']);
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                context.battlefieldMarine,
                context.echoBaseDefender,
                context.specforceSoldier,
                context.regionalSympathizers
            ]);

            // Leave Battlefield Marine and SpecForce Soldier on top
            context.player1.clickDisplayCardPromptButton(context.battlefieldMarine.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.specforceSoldier.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.echoBaseDefender.uuid, 'discard');
            context.player1.clickDisplayCardPromptButton(context.regionalSympathizers.uuid, 'discard');

            // SpecForce Soldier should be on the top of deck
            expect(context.player1.deck[0]).toBe(context.specforceSoldier);
            expect(context.player1.deck[1]).toBe(context.battlefieldMarine);

            expect(context.echoBaseDefender).toBeInZone('discard');
            expect(context.regionalSympathizers).toBeInZone('discard');
        });

        it('deals 0 damage to opponents base when 0 heroism cards are revealed', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['for-a-cause-i-believe-in'],
                    deck: [
                        'atst',
                        'waylay',
                        'wampa',
                        'frontier-atrt'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.forACauseIBelieveIn);

            // Top 4 cards are revealed in chat
            expect(context.getChatLogs(1)[0]).toContain(context.atst.title);
            expect(context.getChatLogs(1)[0]).toContain(context.waylay.title);
            expect(context.getChatLogs(1)[0]).toContain(context.wampa.title);
            expect(context.getChatLogs(1)[0]).toContain(context.frontierAtrt.title);

            // 0 damage is dealt for the 0 Heroic cards revealed
            expect(context.player2.base.damage).toBe(0);

            // P1 gets to choose what to do with the top 4 cards of their deck
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Discard']);
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                context.atst,
                context.waylay,
                context.wampa,
                context.frontierAtrt
            ]);

            // Leave all cards on top in reverse order
            context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.waylay.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.wampa.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.frontierAtrt.uuid, 'top');

            expect(context.player1.deck[0]).toBe(context.frontierAtrt);
            expect(context.player1.deck[1]).toBe(context.wampa);
            expect(context.player1.deck[2]).toBe(context.waylay);
            expect(context.player1.deck[3]).toBe(context.atst);
        });

        it('reveals less than 4 cards if there are less than 4 cards remaining in the deck', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['for-a-cause-i-believe-in'],
                    deck: [
                        'atst',
                        'echo-base-defender'
                    ]
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.forACauseIBelieveIn);

            // Top 2 cards are revealed in chat
            expect(context.getChatLogs(1)[0]).toContain(context.atst.title);
            expect(context.getChatLogs(1)[0]).toContain(context.echoBaseDefender.title);

            // 1 damage is dealt for the 1 Heroism card revealed
            expect(context.player2.base.damage).toBe(1);

            // P1 gets to choose what to do with the top 2 cards of their deck
            expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Put on top', 'Discard']);
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                context.atst,
                context.echoBaseDefender
            ]);

            // Leave Echo Base Defender on top
            context.player1.clickDisplayCardPromptButton(context.echoBaseDefender.uuid, 'top');
            context.player1.clickDisplayCardPromptButton(context.atst.uuid, 'discard');

            // Echo Base Defender should be on the top of deck
            expect(context.player1.deck[0]).toBe(context.echoBaseDefender);

            expect(context.atst).toBeInZone('discard');
        });

        it('should do nothing if there are no cards remaining in the deck', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['for-a-cause-i-believe-in'],
                    deck: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.forACauseIBelieveIn);

            expect(context.player2).toBeActivePlayer();
        });

        it('should do nothing if the game ends before the ability resolves', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    base: { card: 'dagobah-swamp', damage: 28 },
                    hand: ['for-a-cause-i-believe-in'],
                    deck: [
                        'battlefield-marine',
                        'echo-base-defender',
                        'specforce-soldier',
                        'regional-sympathizers'
                    ]
                },
                player2: {
                    groundArena: ['saw-gerrera#extremist']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.forACauseIBelieveIn);

            expect(context.player1).toHavePrompt('player2 has won the game!');
            expect(context.player2).toHavePrompt('player2 has won the game!');

            expect(context.player1.base.damage).toBe(30);
            expect(context.player2.base.damage).toBe(0);

            // The FACIBI reveal prompt is hiding under the Game Over prompt here
            // Is there a way to avoid this?
            context.allowTestToEndWithOpenPrompt = true;
        });

        it('should end the game if it deals lethal damage to the opponent\'s base', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['for-a-cause-i-believe-in'],
                    deck: [
                        'battlefield-marine',
                        'echo-base-defender',
                        'specforce-soldier',
                        'this-is-the-way'
                    ]
                },
                player2: {
                    base: { card: 'dagobah-swamp', damage: 26 }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.forACauseIBelieveIn);

            // Top 4 cards are revealed in chat
            expect(context.getChatLogs(2)[0]).toContain(context.battlefieldMarine.title);
            expect(context.getChatLogs(2)[0]).toContain(context.specforceSoldier.title);
            expect(context.getChatLogs(2)[0]).toContain(context.echoBaseDefender.title);
            expect(context.getChatLogs(2)[0]).toContain(context.thisIsTheWay.title);

            expect(context.player2.base.damage).toBe(30);

            expect(context.player1).toHavePrompt('player1 has won the game!');
            expect(context.player2).toHavePrompt('player1 has won the game!');

            context.player1.clickPrompt('Continue Playing');
            context.player2.clickPrompt('Continue Playing');
        });
    });
});