describe('There Is No Escape', function() {
    integration(function(contextRef) {
        it('Its ability should allow the player to select 3 units. Those units lose all abilities for the round.', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['there-is-no-escape', 'takedown'],
                    groundArena: ['contracted-hunter'],
                    spaceArena: ['fireball#an-explosion-with-wings']
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            // Play There Is No Escape
            context.player1.clickCard(context.thereIsNoEscape);

            expect(context.player1).toHavePrompt('Choose up to 3 units. Those units lose all abilities for this round.');
            expect(context.player1).toBeAbleToSelectExactly([
                context.contractedHunter,
                context.fireball,
                context.lurkingTiePhantom
            ]);
            expect(context.player1).toHaveExactPromptButtons(['Choose no target', 'Done']);

            // Choose 3 units
            context.player1.clickCard(context.contractedHunter);
            context.player1.clickCard(context.fireball);
            context.player1.clickCard(context.lurkingTiePhantom);
            context.player1.clickPrompt('Done');

            context.player2.passAction();

            // Play Takedown to defeat Lurking TIE Phantom via enemy card ability
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.lurkingTiePhantom).toBeInZone('discard');

            // Move to next action phase
            context.moveToNextActionPhase();

            // Fireball and Contracted Hunter's abilities did not trigger
            expect(context.fireball.damage).toBe(0);
            expect(context.contractedHunter).toBeInZone('groundArena');

            // Move to next regroup
            context.moveToRegroupPhase();

            // Abilities should be restored, and must be resolved
            expect(context.player1).toHaveExactPromptButtons([
                'Defeat this unit',
                'Deal 1 damage to this unit.'
            ]);
            context.player1.clickPrompt('Deal 1 damage to this unit.');

            expect(context.fireball.damage).toBe(1);
            expect(context.contractedHunter).toBeInZone('discard');
        });

        it('Its ability can be used on leader units. The leader unit will lose all abilities for the round.', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'kylo-ren#rash-and-deadly', deployed: true },
                    hand: ['there-is-no-escape', 'takedown', 'death-star-stormtrooper', 'tieln-fighter'],
                },
                player2: {
                    leader: { card: 'jango-fett#concealing-the-conspiracy', deployed: true },
                    hand: ['elite-p38-starfighter', 'ruthless-raider']
                }
            });

            const { context } = contextRef;

            // Kylo has 1 power before event is played
            expect(context.kyloRen.getPower()).toBe(1);

            // Play There Is No Escape to remove Kylo and Jango's abilities
            context.player1.clickCard(context.thereIsNoEscape);
            expect(context.player1).toHavePrompt('Choose up to 3 units. Those units lose all abilities for this round.');
            expect(context.player1).toBeAbleToSelectExactly([
                context.kyloRen,
                context.jangoFett
            ]);
            context.player1.clickCard(context.kyloRen);
            context.player1.clickCard(context.jangoFett);
            context.player1.clickPrompt('Done');

            // Kylo has 5 power after losing abilities
            expect(context.kyloRen.getPower()).toBe(5);

            // Player 2 plays Elite P38 Starfighter to ping Kylo, but cannot use Jango's ability to exhaust Kylo
            context.player2.clickCard(context.eliteP38Starfighter);
            context.player2.clickCard(context.kyloRen);

            expect(context.player2).not.toHavePassAbilityPrompt('Exhaust the damaged enemy unit');

            // Move to next action phase, There Is No Escape's effect has expired
            context.moveToNextActionPhase();

            // Kylo has 0 power due to cards in hand
            expect(context.kyloRen.getPower()).toBe(0);
            context.player1.passAction();

            // Player 2 plays Ruthless Raider to ping Kylo, and can use Jango's ability to exhaust Kylo
            context.player2.clickCard(context.ruthlessRaider);
            context.player2.clickCard(context.kyloRen);

            expect(context.player2).toHavePassAbilityPrompt('Exhaust the damaged enemy unit');
            context.player2.clickPrompt('Trigger');
            expect(context.kyloRen.exhausted).toBeTrue();
        });

        it('It allows the player to choose no targets, even if there are targets available.', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['there-is-no-escape'],
                    groundArena: ['contracted-hunter'],
                    spaceArena: ['fireball#an-explosion-with-wings']
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            // Play There Is No Escape
            context.player1.clickCard(context.thereIsNoEscape);

            expect(context.player1).toHavePrompt('Choose up to 3 units. Those units lose all abilities for this round.');
            expect(context.player1).toBeAbleToSelectExactly([
                context.contractedHunter,
                context.fireball,
                context.lurkingTiePhantom
            ]);
            expect(context.player1).toHaveExactPromptButtons(['Choose no target', 'Done']);

            // Choose no target
            context.player1.clickPrompt('Choose no target');

            // It is Player 2's turn
            expect(context.player2).toBeActivePlayer();
        });

        it('It automatically chooses no targes if there are no units in play.', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['there-is-no-escape'],
                },
            });

            const { context } = contextRef;

            // Play There Is No Escape
            context.player1.clickCard(context.thereIsNoEscape);

            // No targets were chosen, it is Player 2's turn
            expect(context.player2).toBeActivePlayer();
        });
    });
});