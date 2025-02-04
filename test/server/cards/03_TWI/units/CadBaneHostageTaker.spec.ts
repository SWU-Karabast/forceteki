describe('Cad Bane, Hostage Taker', function() {
    integration(function(contextRef) {
        it('Cad Bane\'s ability should allow you to capture up to 3 enemy non-leader units and on attack the opponent can rescue one', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['cad-bane#hostage-taker'],
                    groundArena: [{ card: 'battlefield-marine', damage: 2 }, 'isb-agent']
                },
                player2: {
                    hand: ['change-of-heart'],
                    groundArena: ['wampa', 'mercenary-company', 'death-star-stormtrooper'],
                    spaceArena: ['wing-leader', 'consortium-starviper'],
                    leader: { card: 'iden-versio#inferno-squad-commander', deployed: true },
                }
            });

            const { context } = contextRef;

            // Player 1 passes
            context.player1.passAction();

            // Player 2 takes control of the Battlefield Marine
            context.player2.clickCard(context.changeOfHeart);
            context.player2.clickCard(context.battlefieldMarine);

            // Player 1 plays Cad Bane
            context.player1.clickCard(context.cadBane);

            expect(context.player1).toHavePrompt('Choose up to 3 enemy non-leader units with a total of 8 or less remaining HP');
            expect(context.player1).toHaveChooseNoTargetButton();
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.mercenaryCompany, context.wingLeader, context.consortiumStarviper, context.battlefieldMarine, context.deathStarStormtrooper]);

            context.player1.clickCard(context.wampa);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.wingLeader, context.consortiumStarviper, context.battlefieldMarine, context.deathStarStormtrooper]);

            context.player1.clickCard(context.battlefieldMarine);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.wingLeader, context.battlefieldMarine, context.deathStarStormtrooper]);

            context.player1.clickCard(context.wingLeader);
            expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.wingLeader, context.battlefieldMarine, context.deathStarStormtrooper]);

            context.player1.clickCardNonChecking(context.deathStarStormtrooper);
            context.player1.clickPrompt('Done');

            expect(context.wampa).toBeCapturedBy(context.cadBane);
            expect(context.wingLeader).toBeCapturedBy(context.cadBane);
            expect(context.battlefieldMarine).toBeCapturedBy(context.cadBane);
            expect(context.deathStarStormtrooper).toBeInZone('groundArena', context.player2);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 attacks with Cad Bane
            context.cadBane.exhausted = false;
            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);

            // Player 2 rescues the Wampa and Player 1 draws 2 cards
            expect(context.player1.handSize).toBe(0);
            expect(context.player2).toHavePassAbilityPrompt('Rescue a card you own captured by Cad Bane and the opponent draws 2 cards');
            context.player2.clickPrompt('Rescue a card you own captured by Cad Bane and the opponent draws 2 cards');

            // Player 2 can't rescue the Battlefield Marine because they don't own it
            expect(context.player2).toBeAbleToSelectExactly([context.wampa, context.wingLeader]);
            context.player2.clickCard(context.wampa);

            expect(context.wampa).toBeInZone('groundArena', context.player2);
            expect(context.player1.handSize).toBe(2);
        });

        it('Cad Bane\'s ability should do nothing when it has no captured units', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['cad-bane#hostage-taker']
                },
            });

            const { context } = contextRef;

            // Player 1 attacks with Cad Bane
            context.player1.clickCard(context.cadBane);
            context.player1.clickCard(context.p2Base);

            expect(context.player2).toBeActivePlayer();
        });
    });
});
