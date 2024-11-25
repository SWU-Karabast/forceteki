describe('Vigilance', function() {
    integration(function(contextRef) {
        describe('Vigilance\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vigilance'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer'],
                        groundArena: [{ card: 'wampa', damage: 2 }, 'battlefield-marine'],
                        spaceArena: [{ card: 'restored-arc170', upgrades: ['entrenched'] }],
                        base: { card: 'echo-base', damage: 6 },

                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        deck: ['atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                    }
                });
            });

            it('discards 6 cards from an opponent\'s deck and gives a shield token to a unit', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.vigilance);

                // Discard 6 cards from opponents deck
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Discard 6 cards from an opponent\'s deck.',
                    'Heal 5 damage from a base.',
                    'Defeat a unit with 3 or less remaining HP.',
                    'Give a Shield token to a unit.'
                ]);
                context.player1.clickPrompt('Discard 6 cards from an opponent\'s deck.');

                // check board state
                expect(context.player2.deck.length).toBe(1);
                expect(context.player2.discard.length).toBe(6);
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Defeat a unit with 3 or less remaining HP.',
                    'Heal 5 damage from a base.',
                    'Give a Shield token to a unit.'
                ]);

                // give a shield token to a unit
                context.player1.clickPrompt('Give a shield token to a unit.');

                // check available selectors
                expect(context.player1).toBeAbleToSelectExactly([
                    context.wampa,
                    context.viperProbeDroid,
                    context.darthVader,
                    context.battlefieldMarine,
                    context.restoredArc170,
                ]);
                context.player1.clickCard(context.wampa);

                // check board state
                expect(context.wampa).toHaveExactUpgradeNames(['shield']);
                expect(context.player2).toBeActivePlayer();
            });

            it('defeats a unit with 3 or less remaining HP and heals the base for 5 HP', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.vigilance);

                // Defeat a unit with 3 or less remaining HP
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Discard 6 cards from an opponent\'s deck.',
                    'Heal 5 damage from a base.',
                    'Defeat a unit with 3 or less remaining HP.',
                    'Give a Shield token to a unit.'
                ]);
                context.player1.clickPrompt('Defeat a unit with 3 or less remaining HP.');
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.battlefieldMarine, context.wampa]);
                context.player1.clickCard(context.viperProbeDroid);

                // check board state
                expect(context.viperProbeDroid).toBeInZone('discard');

                // heal 5 damage from a base
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Discard 6 cards from an opponent\'s deck.',
                    'Heal 5 damage from a base.',
                    'Give a Shield token to a unit.'
                ]);

                context.player1.clickPrompt('Heal 5 damage from a base.');
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p1Base);

                // check board state
                expect(context.p1Base.damage).toEqual(1);
            });
        });
        describe('Vigilance\'s ability', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['vigilance'],
                        deck: ['foundling', 'pyke-sentinel', 'atst', 'cartel-spacer'],
                        base: { card: 'echo-base', damage: 0 }
                    },
                    player2: {
                        deck: []
                    }
                });
            });

            it('discards 6 cards from an opponent\'s deck dealing 0 damage to his base and heal 0 damage from base.',
                function () {
                    const { context } = contextRef;
                    context.player1.clickCard(context.vigilance);

                    // Discard 6 cards from opponents deck
                    expect(context.player1).toHaveEnabledPromptButtons([
                        'Discard 6 cards from an opponent\'s deck.',
                        'Heal 5 damage from a base.',
                        'Defeat a unit with 3 or less remaining HP.',
                        'Give a Shield token to a unit.'
                    ]);
                    context.player1.clickPrompt('Discard 6 cards from an opponent\'s deck.');

                    // check board state
                    expect(context.p2Base.damage).toEqual(0);
                    expect(context.player1).toHaveEnabledPromptButtons([
                        'Defeat a unit with 3 or less remaining HP.',
                        'Heal 5 damage from a base.',
                        'Give a Shield token to a unit.'
                    ]);

                    // heal 0 damage from base
                    context.player1.clickPrompt('Heal 5 damage from a base.');
                    context.player1.clickCard(context.p1Base);
                    expect(context.p1Base.damage).toEqual(0);
                    expect(context.player2).toBeActivePlayer();
                });

            it('will not trigger any actions when no possible target is available',
                function () {
                    const { context } = contextRef;
                    context.player1.clickCard(context.vigilance);

                    expect(context.player1).toHaveEnabledPromptButtons([
                        'Discard 6 cards from an opponent\'s deck.',
                        'Heal 5 damage from a base.',
                        'Defeat a unit with 3 or less remaining HP.',
                        'Give a Shield token to a unit.'
                    ]);
                    context.player1.clickPrompt('Defeat a unit with 3 or less remaining HP.');
                    expect(context.player1).toHaveEnabledPromptButtons([
                        'Defeat a unit with 3 or less remaining HP.',
                        'Heal 5 damage from a base.',
                        'Give a Shield token to a unit.'
                    ]);

                    context.player1.clickPrompt('Give a Shield token to a unit.');
                    expect(context.player2).toBeActivePlayer();
                });
        });
    });
});
