describe('Vigilance', function() {
    integration(function(contextRef) {
        describe('Vigilance\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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
                expect(context.getChatLogs(1)).toContain('player1 uses Vigilance to defeat Viper Probe Droid');

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
                expect(context.getChatLogs(1)).toContain('player1 uses Vigilance to heal 5 damage from their base');
            });
        });
        describe('Vigilance\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
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

            it('discarding 6 cards from an opponent\'s empty deck and healing damage from a base with full HP does nothing.',
                function () {
                    const { context } = contextRef;
                    context.player1.clickCard(context.vigilance);

                    // Discard 6 cards from opponents deck
                    expect(context.player1).toHaveEnabledPromptButtons([
                        'Discard 6 cards from an opponent\'s deck.',
                        'Heal 5 damage from a base.',
                        '(No effect) Defeat a unit with 3 or less remaining HP.',
                        '(No effect) Give a Shield token to a unit.'
                    ]);
                    context.player1.clickPrompt('Discard 6 cards from an opponent\'s deck.');

                    // check board state
                    expect(context.p2Base.damage).toEqual(0);
                    expect(context.player1).toHaveEnabledPromptButtons([
                        '(No effect) Defeat a unit with 3 or less remaining HP.',
                        'Heal 5 damage from a base.',
                        '(No effect) Give a Shield token to a unit.'
                    ]);

                    // heal 0 damage from base
                    context.player1.clickPrompt('Heal 5 damage from a base.');
                    // both base are not damaged, no base selectable
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
                        '(No effect) Defeat a unit with 3 or less remaining HP.',
                        '(No effect) Give a Shield token to a unit.'
                    ]);
                    context.player1.clickPrompt('(No effect) Defeat a unit with 3 or less remaining HP.');
                    expect(context.player1).toHaveEnabledPromptButtons([
                        '(No effect) Defeat a unit with 3 or less remaining HP.',
                        'Heal 5 damage from a base.',
                        '(No effect) Give a Shield token to a unit.'
                    ]);

                    context.player1.clickPrompt('(No effect) Give a Shield token to a unit.');
                    expect(context.player2).toBeActivePlayer();
                });
        });

        describe('Vigilance\'s modal prompt', function() {
            it('shows each option as a card button for Vigilance', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilance'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.vigilance);

                expect(context.player1).toHavePrompt('Choose 2 effects for Vigilance');

                const prompt = context.player1.currentPrompt();
                expect(prompt.promptType).toBe('modalEffectSelection');
                expect(prompt.promptDescription).toBe('Each option can only be chosen once.');
                expect(prompt.buttons.map((button) => button.sourceCard?.uuid)).toEqual(Array(4).fill(context.vigilance.uuid));
                expect(prompt.buttons.map((button) => button.hasLegalEffects)).toEqual([true, true, false, false]);

                context.player1.clickPrompt('(No effect) Defeat a unit with 3 or less remaining HP.');
                context.player1.clickPrompt('(No effect) Give a Shield token to a unit.');
                expect(context.player2).toBeActivePlayer();
            });

            it('re-evaluates whether each option has an effect after the first option resolves', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vigilance'],
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.vigilance);
                expect(context.player1).toHaveExactPromptButtons([
                    'Discard 6 cards from an opponent\'s deck.',
                    'Heal 5 damage from a base.',
                    'Defeat a unit with 3 or less remaining HP.',
                    'Give a Shield token to a unit.'
                ]);

                context.player1.clickPrompt('Defeat a unit with 3 or less remaining HP.');
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // the only unit in play was defeated, so there is no longer a unit to give a Shield token to
                expect(context.player1).toHavePrompt('Choose 1 effect for Vigilance');
                expect(context.player1).toHaveExactPromptButtons([
                    'Discard 6 cards from an opponent\'s deck.',
                    'Heal 5 damage from a base.',
                    '(No effect) Give a Shield token to a unit.'
                ]);

                context.player1.clickPrompt('(No effect) Give a Shield token to a unit.');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
