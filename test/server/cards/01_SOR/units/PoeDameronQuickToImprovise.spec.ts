describe('Poe Demaron Quick to improvise\'s ability', function () {
    integration(function (contextRef) {
        describe('Poe Demaron Quick to improvise\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['sneak-attack', 'battlefield-marine', 'daring-raid', 'specforce-soldier'],
                        groundArena: [{ card: 'poe-dameron#quick-to-improvise', upgrades: ['resilient'] }],
                    },
                    player2: {
                        hand: ['open-fire', 'karabast'],
                        groundArena: [{ card: 'death-star-stormtrooper', upgrades: ['academy-training'] }],
                        spaceArena: ['tie-advanced']
                    }
                });
            });

            it('should allow to discard up to 3 cards and to resolve 1 different effect per card discarded', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.poeDameron);
                context.player1.clickCard(context.p2Base);

                // We discard 3 cards
                expect(context.player1).toBeAbleToSelectExactly([
                    'sneak-attack',
                    'battlefield-marine',
                    'daring-raid',
                    'specforce-soldier',
                ]);
                expect(context.player1).toHaveChooseNoTargetButton();

                context.player1.clickCard(context.sneakAttack);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.daringRaid);
                context.player1.clickCardNonChecking(context.specforceSoldier);
                context.player1.clickPrompt('Done');

                expect(context.sneakAttack).toBeInZone('discard');
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.daringRaid).toBeInZone('discard');
                expect(context.specforceSoldier).toBeInZone('hand');

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Deal 2 damage to a unit or base.',
                    'Defeat an upgrade.',
                    'An opponent discards a card from their hand.',
                ]);
                context.player1.clickPrompt('Deal 2 damage to a unit or base.');
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.tieAdvanced, context.p2Base, context.poeDameron, context.p1Base]);
                context.player1.clickCard(context.deathStarStormtrooper);
                expect(context.deathStarStormtrooper.damage).toBe(2);

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Defeat an upgrade.',
                    'An opponent discards a card from their hand.',
                ]);
                context.player1.clickPrompt('Defeat an upgrade.');
                expect(context.player1).toBeAbleToSelectExactly([context.academyTraining, context.resilient]);

                context.player1.clickCard(context.resilient);
                context.player1.clickCardNonChecking(context.academyTraining);
                context.player1.clickPrompt('Done');

                expect(context.academyTraining).toBeInZone('groundArena');
                expect(context.deathStarStormtrooper).toBeInZone('groundArena');
                expect(context.resilient).toBeInZone('discard');

                expect(context.player1).toHaveEnabledPromptButtons([
                    'An opponent discards a card from their hand.',
                ]);
                context.player1.clickPrompt('An opponent discards a card from their hand.');
                context.player2.clickCard(context.karabast);
                expect(context.karabast).toBeInZone('discard');

                // Second Poe attacks we discard no card
                context.moveToNextActionPhase();
                context.player1.clickCard(context.poeDameron);
                context.player1.clickCard(context.p2Base);

                // can choose no targets
                context.player1.clickPrompt('Choose no target');
                context.player1.clickPrompt('Done');
                expect(context.player2).toBeActivePlayer();

                // Third Poe attacks we one card to defeat an upgrade
                // but there is no upgrade to defeat
                context.moveToNextActionPhase();
                context.player1.passAction();
                context.player2.clickCard(context.deathStarStormtrooper);
                context.player2.clickCard(context.poeDameron);
                expect(context.poeDameron.damage).toBe(5);
                expect(context.deathStarStormtrooper).toBeInZone('discard');
                expect(context.academyTraining).toBeInZone('discard');

                expect(context.player1).toBeActivePlayer();
                context.player1.clickCard(context.poeDameron);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickPrompt('Done');
                expect(context.specforceSoldier).toBeInZone('discard');

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Deal 2 damage to a unit or base.',
                    'Defeat an upgrade.',
                    'An opponent discards a card from their hand.',
                ]);
                context.player1.clickPrompt('Defeat an upgrade.');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
