describe('Cassian Andor, Dedicated to the Rebellion', function() {
    integration(function(contextRef) {
        describe('Cassian Andor\'s leader ability', function() {
            const prompt = 'If you\'ve dealt 3 or more damage to an enemy base this phase, draw a card.';

            it('should draw a card aftering dealing 3 damage using from multiple scenarios', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['daring-raid', 'daring-raid'],
                        deck: ['k2so#cassians-counterpart', 'underworld-thug', 'underworld-thug', 'open-fire'],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'cassian-andor#dedicated-to-the-rebellion',
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });
                const { context } = contextRef;

                // Expect this ability be available, but performs a no-op since 3 damage hasn't been dealt yet
                expect(context.cassianAndor).toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.clickPrompt('Use it anyway');
                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player1.hand).not.toContain(context.k2so);

                context.readyCard(context.cassianAndor);
                context.player2.passAction();

                // Select the a-wing to deal 3 damage to base
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Expect this ability have activated now - so it should draw the top card from the deck
                expect(context.cassianAndor).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(2);
                expect(context.player1.hand).toContain(context.k2so);

                context.moveToNextActionPhase();

                // Expect this ability to be a no-op again since its a new action phase
                expect(context.cassianAndor).toHaveAvailableActionWhenClickedBy(context.player1);
                context.player1.clickPrompt('Use it anyway');
                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(1);
                expect(context.player1.hand).not.toContain(context.openFire);

                context.readyCard(context.cassianAndor);
                context.player2.passAction();

                // Deal 3+ damage using abilities now -- use two daring raids in hand
                context.player1.clickCard(context.player1.findCardByName('daring-raid', 'hand'));
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                // Select the remaining daring-raid
                context.player1.clickCard(context.player1.findCardByName('daring-raid', 'hand'));
                context.player1.clickCard(context.p2Base);
                context.player2.passAction();

                expect(context.player1.exhaustedResourceCount).toBe(3);

                // Expect this ability have activated now - so it should draw the top card from the deck
                expect(context.cassianAndor).toHaveAvailableActionWhenClickedBy(context.player1);
                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.exhaustedResourceCount).toBe(4);
                expect(context.player1.hand).toContain(context.openFire);
            });

            it('works with overwhelm damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#dedicated-to-the-rebellion',
                        groundArena: ['k2so#cassians-counterpart'],
                        hand: []
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.k2so);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.p2Base.damage).toBe(3);
                context.player2.passAction();

                context.player1.clickCard(context.cassianAndor);
                context.player1.clickPrompt(prompt);

                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.hand).toHaveSize(1);
            });

            it('works with indirect damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#dedicated-to-the-rebellion',
                        hand: ['kimogila-heavy-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to opponent');

                expect(context.p2Base.damage).toBe(3);
                context.player2.passAction();

                context.player1.clickCard(context.cassianAndor);
                context.player1.clickPrompt(prompt);

                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.hand).toHaveSize(1);
            });

            it('does not count damage dealt to the player\'s own base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cassian-andor#dedicated-to-the-rebellion',
                        hand: ['kimogila-heavy-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to yourself');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 3]
                ]));

                expect(context.p1Base.damage).toBe(3);
                context.player2.passAction();

                context.player1.clickCard(context.cassianAndor);
                context.player1.clickPrompt(prompt);

                expect(context.player1).toHaveNoEffectAbilityPrompt(prompt);
                context.player1.clickPrompt('Use it anyway');

                expect(context.cassianAndor.exhausted).toBeTrue();
                expect(context.player1.hand).toHaveSize(0);
            });
        });

        describe('Cassian Andor\'s leader unit ability', function() {
            it('should draw a card when you deal damage to an enemy base, but only once a round', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        deck: ['k2so#cassians-counterpart', 'atst', 'awing', 'red-three#unstoppable'],
                        hand: ['daring-raid'],
                        groundArena: ['yoda#old-master'],
                        spaceArena: ['green-squadron-awing'],
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: true },
                        resources: 4,
                    },
                    player2: {
                        groundArena: ['wampa'],
                        spaceArena: ['tieln-fighter'],
                    },
                });

                const { context } = contextRef;

                expect(context.player1.hand).toHaveSize(1);

                // Select yoda to deal damage (less than 3 for sanity check) to base
                context.player1.clickCard(context.yoda);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.hand).toHaveSize(2);
                expect(context.player1.hand).toContain(context.k2so);
                expect(context.player1.exhaustedResourceCount).toBe(0); // no resources spent now

                context.player2.passAction();

                // Deal more damage to base to see if another event will trigger - it shouldn't
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                // No card draw should have happened due to once per round limit -- state should be the same
                expect(context.player1.hand).toHaveSize(2);
                expect(context.player1.hand).toContain(context.k2so);
                expect(context.player1.exhaustedResourceCount).toBe(0);

                // Test limit 1 per round resets on next action phase
                context.moveToNextActionPhase();

                // Select daring-raid to deal damage via ability
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Trigger');

                context.player2.passAction();

                // Expect to have spent daring-raid and gained red three + 2 cards from regroup phase
                expect(context.player1.hand).toHaveSize(4);
                expect(context.player1.hand).toContain(context.redThree);
            });

            it('works with overwhelm damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: true },
                        groundArena: ['k2so#cassians-counterpart'],
                        hand: []
                    },
                    player2: {
                        groundArena: ['death-star-stormtrooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.k2so);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.p2Base.damage).toBe(3);

                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.hand).toHaveSize(1);
            });

            it('works with indirect damage', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: true },
                        hand: ['kimogila-heavy-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to opponent');

                expect(context.p2Base.damage).toBe(3);

                expect(context.player1).toHavePassAbilityPrompt('Draw a card');
                context.player1.clickPrompt('Trigger');

                expect(context.player1.hand).toHaveSize(1);
            });

            it('does not trigger when dealing damage to the player\'s own base', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'cassian-andor#dedicated-to-the-rebellion', deployed: true },
                        hand: ['kimogila-heavy-fighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.kimogilaHeavyFighter);
                context.player1.clickPrompt('Deal indirect damage to yourself');
                context.player1.setDistributeIndirectDamagePromptState(new Map([
                    [context.p1Base, 3]
                ]));

                expect(context.p1Base.damage).toBe(3);

                // No card draw should have happened
                expect(context.player1).not.toHavePassAbilityPrompt('Draw a card');
                expect(context.player1.hand).toHaveSize(0);
            });
        });
    });
});
