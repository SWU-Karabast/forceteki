
describe('Poe Demaron Quick to improvise\'s ability', function () {
    integration(function (contextRef) {
        it('should allow to discard card and to resolve effects', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['sneak-attack', 'battlefield-marine', 'daring-raid'],
                    groundArena: ['poe-dameron#quick-to-improvise'],
                },
                player2: {
                    hand: ['open-fire', 'karabast'],
                    groundArena: [{ card: 'death-star-stormtrooper', upgrades: ['academy-training'] }],
                    spaceArena: ['tie-advanced']
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.poeDameron);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly(['sneak-attack', 'battlefield-marine', 'daring-raid']);
            context.player1.clickCard(context.sneakAttack);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.daringRaid);
            context.player1.clickPrompt('Done');

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
            context.player1.clickCard(context.academyTraining);
            expect(context.academyTraining).toBeInZone('discard');
            expect(context.deathStarStormtrooper).toBeInZone('discard');

            expect(context.player1).toHaveEnabledPromptButtons([
                'An opponent discards a card from their hand.',
            ]);
            context.player1.clickPrompt('An opponent discards a card from their hand.');
            context.player2.clickCard(context.karabast);
            expect(context.karabast).toBeInZone('discard');
        });
    });
});
