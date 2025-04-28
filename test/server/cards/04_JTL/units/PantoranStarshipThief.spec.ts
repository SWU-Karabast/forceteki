describe('Pantoran Starship Thief', function () {
    integration(function (contextRef) {
        describe('Pantoran Starship Thief\'s when played ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#victor-squadron-leader',
                        hand: ['pantoran-starship-thief', 'survivors-gauntlet'],
                        groundArena: ['atst'],
                        spaceArena: ['prototype-tie-advanced', 'millennium-falcon#get-out-and-push'],
                    },
                    player2: {
                        hand: ['traitorous'],
                        groundArena: ['reinforcement-walker'],
                        spaceArena: [
                            'omicron-strike-craft',
                            'scouting-headhunter',
                            { card: 'phoenix-squadron-awing', upgrades: ['bb8#happy-beeps'] },
                        ],
                    }
                });
            });

            it('allows to attach it to an enemy Fighter without a Pilot on it and take control of it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pantoranStarshipThief);
                expect(context.player1).toHavePassAbilityPrompt('Pay 3 resources');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.omicronStrikeCraft, context.scoutingHeadhunter, context.prototypeTieAdvanced, context.millenniumFalcon]);

                context.player1.clickCard(context.scoutingHeadhunter);

                expect(context.scoutingHeadhunter).toHaveExactUpgradeNames(['pantoran-starship-thief']);
                expect(context.scoutingHeadhunter).toBeInZone('spaceArena', context.player1);
            });

            it('allows to attach it to an enemy Transport without a Pilot on it and take control of it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pantoranStarshipThief);
                expect(context.player1).toHavePassAbilityPrompt('Pay 3 resources');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.omicronStrikeCraft, context.scoutingHeadhunter, context.prototypeTieAdvanced, context.millenniumFalcon]);

                context.player1.clickCard(context.omicronStrikeCraft);

                expect(context.omicronStrikeCraft).toHaveExactUpgradeNames(['pantoran-starship-thief']);
                expect(context.omicronStrikeCraft).toBeInZone('spaceArena', context.player1);
            });

            it('correctly has the player playing the card paying all costs', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pantoranStarshipThief);
                expect(context.player1.exhaustedResourceCount).toBe(2);
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.omicronStrikeCraft, context.scoutingHeadhunter, context.prototypeTieAdvanced, context.millenniumFalcon]);

                context.player1.clickCard(context.omicronStrikeCraft);

                expect(context.omicronStrikeCraft).toHaveExactUpgradeNames(['pantoran-starship-thief']);
                expect(context.omicronStrikeCraft).toBeInZone('spaceArena', context.player1);
                expect(context.player1.exhaustedResourceCount).toBe(5);
                expect(context.player2.exhaustedResourceCount).toBe(0);
            });

            it('can ba passed and it stays in play as a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pantoranStarshipThief);
                expect(context.player1).toHavePassAbilityPrompt('Pay 3 resources');

                context.player1.clickPrompt('Pass');

                expect(context.pantoranStarshipThief).toBeInZone('groundArena', context.player1);
            });

            it('allows to attach it to a friendly Fighter or Transport without a Pilot on it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pantoranStarshipThief);
                expect(context.player1).toHavePassAbilityPrompt('Pay 3 resources');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.omicronStrikeCraft, context.scoutingHeadhunter, context.prototypeTieAdvanced, context.millenniumFalcon]);

                context.player1.clickCard(context.prototypeTieAdvanced);

                expect(context.prototypeTieAdvanced).toHaveExactUpgradeNames(['pantoran-starship-thief']);
                expect(context.prototypeTieAdvanced).toBeInZone('spaceArena', context.player1);
            });

            it('gives back control of a unit when it is unattached', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.pantoranStarshipThief);
                expect(context.player1).toHavePassAbilityPrompt('Pay 3 resources');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toBeAbleToSelectExactly([context.omicronStrikeCraft, context.scoutingHeadhunter, context.prototypeTieAdvanced, context.millenniumFalcon]);

                context.player1.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['pantoran-starship-thief']);
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);
                expect(context.millenniumFalcon.getPower()).toBe(4);

                context.player2.clickCard(context.traitorous);
                context.player2.clickCard(context.millenniumFalcon);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['pantoran-starship-thief', 'traitorous']);
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player2);
                expect(context.millenniumFalcon.getPower()).toBe(4);

                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(context.pantoranStarshipThief);
                context.player1.clickCard(context.omicronStrikeCraft);

                expect(context.millenniumFalcon).toHaveExactUpgradeNames(['traitorous']);
                expect(context.millenniumFalcon).toBeInZone('spaceArena', context.player1);
                expect(context.millenniumFalcon.getPower()).toBe(3);
                expect(context.omicronStrikeCraft).toHaveExactUpgradeNames(['pantoran-starship-thief']);
                expect(context.omicronStrikeCraft).toBeInZone('spaceArena', context.player2);
            });
        });
    });
});
