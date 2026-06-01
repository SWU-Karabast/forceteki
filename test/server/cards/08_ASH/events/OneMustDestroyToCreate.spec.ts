describe('One Must Destroy To Create', function() {
    integration(function(contextRef) {
        it('should defeat a friendly non-leader unit and then play it for free', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-must-destroy-to-create'],
                    groundArena: ['clan-wren-rescuer', 'wampa'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.oneMustDestroyToCreate);
            expect(context.player1).toHavePrompt('Defeat a friendly non-leader unit');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.wampa]); // Leaders should not be selectable

            context.player1.clickCard(context.clanWrenRescuer);

            expect(context.player1).toHavePassAbilityPrompt('Play Clan Wren Rescuer from your discard pile for free');
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Trigger');

            expect(context.player1).toHavePrompt('Give an Experience token to a unit');
            context.player1.clickCard(context.wampa);

            expect(context.clanWrenRescuer).toBeInZone('groundArena', context.player1);
            expect(context.wampa).toHaveExactUpgradeNames(['experience']);
            expect(context.player2).toBeActivePlayer();
        });

        it('should pass the playing for free', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-must-destroy-to-create'],
                    groundArena: ['clan-wren-rescuer', 'wampa'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.oneMustDestroyToCreate);
            expect(context.player1).toHavePrompt('Defeat a friendly non-leader unit');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.clanWrenRescuer, context.wampa]); // Leaders should not be selectable

            context.player1.clickCard(context.clanWrenRescuer);

            expect(context.player1).toHavePassAbilityPrompt('Play Clan Wren Rescuer from your discard pile for free');
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Pass');

            expect(context.clanWrenRescuer).toBeInZone('discard', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.player2).toBeActivePlayer();
        });

        it('survive the Thrawn shenanigans', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-must-destroy-to-create'],
                    groundArena: ['grand-admiral-thrawn#grand-schemer', 'wampa'],
                    leader: { card: 'boba-fett#collecting-the-bounty', deployed: true }
                },
                player2: {
                    groundArena: ['atst', 'consular-security-force'],
                    leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.oneMustDestroyToCreate);
            expect(context.player1).toHavePrompt('Defeat a friendly non-leader unit');
            expect(context.player1).not.toHavePassAbilityButton();
            expect(context.player1).toBeAbleToSelectExactly([context.grandAdmiralThrawn, context.wampa]); // Leaders should not be selectable

            context.player1.clickCard(context.grandAdmiralThrawn);

            expect(context.player1).toHavePassAbilityPrompt('Play Grand Admiral Thrawn from your discard pile for free');
            expect(context.player1).toHavePassAbilityButton();
            context.player1.clickPrompt('Trigger');

            // When Played ability should happen first
            context.player2.clickPrompt('Choose a non-leader unit to be captured');
            context.player2.clickCard(context.atst);

            // Now the When Defeated ability
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.grandAdmiralThrawn, context.bobaFett]);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.consularSecurityForce);

            expect(context.grandAdmiralThrawn).toBeInZone('groundArena', context.player1);
            expect(context.player1.exhaustedResourceCount).toBe(3);
            expect(context.atst).toBeCapturedBy(context.grandAdmiralThrawn);
            expect(context.consularSecurityForce).toBeCapturedBy(context.wampa);
            expect(context.player2).toBeActivePlayer();
        });
    });
});