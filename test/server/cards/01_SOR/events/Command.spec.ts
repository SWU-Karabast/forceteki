describe('Command', function() {
    integration(function(contextRef) {
        describe('Command\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['command'],
                        groundArena: ['wampa', 'battlefield-marine'],
                        spaceArena: ['restored-arc170'],
                        discard: ['cartel-spacer', 'ruthlessness', 'daring-raid']
                    },
                    player2: {
                        groundArena: ['viper-probe-droid'],
                        spaceArena: ['ruthless-raider'],
                        leader: { card: 'darth-vader#dark-lord-of-the-sith', deployed: true },
                        discard: ['atst']
                    }
                });
            });

            it('Command can deal damage to a non-unique unit equal to a friendly unit\'s power and return a unit to hand from discard', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.command);
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Give 2 Experience tokens to a unit.',
                    'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
                    'Put this event into play as a resource.',
                    'Return a unit from your discard pile to your hand.'
                ]);

                context.player1.clickPrompt('A friendly unit deals damage equal to its power to a non-unique enemy unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.restoredArc170]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.viperProbeDroid, context.ruthlessRaider]);
                context.player1.clickCard(context.ruthlessRaider);

                expect(context.ruthlessRaider.damage).toBe(3);

                expect(context.player1).toHaveEnabledPromptButtons([
                    'Give 2 Experience tokens to a unit.',
                    'Put this event into play as a resource.',
                    'Return a unit from your discard pile to your hand.'
                ]);

                context.player1.clickPrompt('Return a unit from your discard pile to your hand.');
                expect(context.player1).toBeAbleToSelectExactly([context.cartelSpacer]);
                context.player1.clickCard(context.cartelSpacer);
                expect(context.cartelSpacer).toBeInZone('hand');

                expect(context.player2).toBeActivePlayer();
            });

            it('Command can give Experience and be put into play as a resource', function () {
                const { context } = contextRef;
                context.player1.clickCard(context.command);

                // Give 2 Experience tokens to a unit
                expect(context.player1).toHaveEnabledPromptButtons([
                    'Give 2 Experience tokens to a unit.',
                    'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
                    'Put this event into play as a resource.',
                    'Return a unit from your discard pile to your hand.'
                ]);
                context.player1.clickPrompt('Give 2 Experience tokens to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.restoredArc170, context.viperProbeDroid, context.darthVader, context.ruthlessRaider]);
                context.player1.clickCard(context.battlefieldMarine);

                // check board state
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['experience', 'experience']);

                expect(context.player1).toHaveEnabledPromptButtons([
                    'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
                    'Put this event into play as a resource.',
                    'Return a unit from your discard pile to your hand.'
                ]);

                const exhaustedResources = context.player1.exhaustedResourceCount;

                // Resource Command
                context.player1.clickPrompt('Put this event into play as a resource.');
                expect(context.player1.exhaustedResourceCount).toBe(exhaustedResources + 1);
                expect(context.command).toBeInZone('resource');
            });
        });

        it('Command\'s damage ability should fizzle if there is no legal enemy unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['command'],
                    groundArena: ['wampa']
                },
                player2: {
                    groundArena: ['luke-skywalker#jedi-knight']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.command);
            expect(context.player1).toHaveEnabledPromptButtons([
                'Give 2 Experience tokens to a unit.',
                'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
                'Put this event into play as a resource.',
                'Return a unit from your discard pile to your hand.'
            ]);

            context.player1.clickPrompt('A friendly unit deals damage equal to its power to a non-unique enemy unit.');

            expect(context.player1).toHaveEnabledPromptButtons([
                'Give 2 Experience tokens to a unit.',
                'Put this event into play as a resource.',
                'Return a unit from your discard pile to your hand.'
            ]);

            // since we only clicked one option
            context.ignoreUnresolvedActionPhasePrompts = true;
        });

        it('Command\'s damage ability should fizzle if there is no legal friendly unit', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['command']
                },
                player2: {
                    groundArena: ['atst']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.command);
            expect(context.player1).toHaveEnabledPromptButtons([
                'Give 2 Experience tokens to a unit.',
                'A friendly unit deals damage equal to its power to a non-unique enemy unit.',
                'Put this event into play as a resource.',
                'Return a unit from your discard pile to your hand.'
            ]);

            context.player1.clickPrompt('A friendly unit deals damage equal to its power to a non-unique enemy unit.');

            expect(context.player1).toHaveEnabledPromptButtons([
                'Give 2 Experience tokens to a unit.',
                'Put this event into play as a resource.',
                'Return a unit from your discard pile to your hand.'
            ]);

            // since we only clicked one option
            context.ignoreUnresolvedActionPhasePrompts = true;
        });
    });
});