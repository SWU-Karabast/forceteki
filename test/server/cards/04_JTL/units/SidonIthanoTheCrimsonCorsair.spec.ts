describe('Sidon Ithano, The Crimson Corsair', function () {
    integration(function (contextRef) {
        describe('Sidon Ithano\'s when played ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['sidon-ithano#the-crimson-corsair'],
                    },
                    player2: {
                        spaceArena: [
                            'omicron-strike-craft',
                            { card: 'cartel-spacer', upgrades: ['bb8#happy-beeps'] },
                        ],
                    }
                });
            });

            it('allows to attach it as an upgrade to an enemy vehicle unit without a pilot on it', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sidonIthano);

                expect(context.player1).toHavePrompt('Attach Sidon Ithano as an upgrade to an enemy Vehicle unit without a Pilot on it');
                expect(context.player1).toBeAbleToSelectExactly([context.omicronStrikeCraft]);

                context.player1.clickCard(context.omicronStrikeCraft);

                expect(context.omicronStrikeCraft).toHaveExactUpgradeNames(['sidon-ithano#the-crimson-corsair']);
                expect(context.omicronStrikeCraft.getPower()).toBe(0);
                expect(context.omicronStrikeCraft.getHp()).toBe(1);
            });

            it('can be played as a unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.sidonIthano);

                expect(context.player1).toHavePrompt('Attach Sidon Ithano as an upgrade to an enemy Vehicle unit without a Pilot on it');
                expect(context.player1).toHavePassAbilityButton();

                context.player1.clickPrompt('Pass');

                expect(context.sidonIthano).toBeInZone('groundArena');
            });
        });
    });
});
