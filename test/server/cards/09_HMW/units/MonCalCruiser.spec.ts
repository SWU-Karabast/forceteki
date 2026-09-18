describe('Mon Cal Cruiser', function() {
    integration(function(contextRef) {
        it('Mon Cal Cruiser\'s ability should attack with a unit and give it +2/+0 for the attack', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mon-cal-cruiser'],
                    groundArena: ['gungan-warrior', 'battlefield-marine']
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                    groundArena: ['peppi-bow#shaak-herder']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.monCalCruiser);

            expect(context.player1).toHaveExactPromptButtons([
                'Attack with a unit',
                'Look at an opponent\'s hand',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('Attack with a unit');

            expect(context.player1).toBeAbleToSelectExactly([context.gunganWarrior, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.p2Base.damage).toBe(5);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mon Cal Cruiser\'s ability should allow choosing attack if there are no units to attack with', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mon-cal-cruiser'],
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                    groundArena: ['peppi-bow#shaak-herder']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.monCalCruiser);

            expect(context.player1).toHaveExactPromptButtons([
                '(No effect) Attack with a unit',
                'Look at an opponent\'s hand',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('(No effect) Attack with a unit');

            expect(context.p2Base.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });

        it('Mon Cal Cruiser\'s ability should discard a card from the opponent and have them draw a card', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mon-cal-cruiser'],
                    groundArena: ['gungan-warrior', 'battlefield-marine']
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                    groundArena: ['peppi-bow#shaak-herder'],
                    deck: ['resupply']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.monCalCruiser);

            expect(context.player1).toHaveExactPromptButtons([
                'Attack with a unit',
                'Look at an opponent\'s hand',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('Look at an opponent\'s hand');

            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                context.rebelPathfinder
            ]);
            context.player1.clickCardInDisplayCardPrompt(context.rebelPathfinder);

            expect(context.rebelPathfinder).toBeInZone('discard', context.player2);
            expect(context.resupply).toBeInZone('hand', context.player2);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mon Cal Cruiser\'s ability should choose discard and pass the discard', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mon-cal-cruiser'],
                    groundArena: ['gungan-warrior', 'battlefield-marine']
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                    groundArena: ['peppi-bow#shaak-herder'],
                    deck: ['resupply']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.monCalCruiser);

            expect(context.player1).toHaveExactPromptButtons([
                'Attack with a unit',
                'Look at an opponent\'s hand',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('Look at an opponent\'s hand');

            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                context.rebelPathfinder
            ]);
            context.player1.clickPrompt('Take nothing');

            expect(context.rebelPathfinder).toBeInZone('hand', context.player2);
            expect(context.resupply).toBeInZone('deck', context.player2);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mon Cal Cruiser\'s ability should discard a card from the opponent and have them take damage with empty deck', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mon-cal-cruiser'],
                    groundArena: ['gungan-warrior', 'battlefield-marine']
                },
                player2: {
                    hand: ['rebel-pathfinder'],
                    groundArena: ['peppi-bow#shaak-herder'],
                    deck: []
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.monCalCruiser);

            expect(context.player1).toHaveExactPromptButtons([
                'Attack with a unit',
                'Look at an opponent\'s hand',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('Look at an opponent\'s hand');

            expect(context.player1).toHaveEnabledPromptButton('Take nothing');
            expect(context.player1).toHaveExactSelectableDisplayPromptCards([
                context.rebelPathfinder
            ]);
            context.player1.clickCardInDisplayCardPrompt(context.rebelPathfinder);

            expect(context.rebelPathfinder).toBeInZone('discard', context.player2);
            expect(context.p2Base.damage).toBe(3);

            expect(context.player2).toBeActivePlayer();
        });

        it('Mon Cal Cruiser\'s ability should allow choosing look at hand with empty hand', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['mon-cal-cruiser'],
                    groundArena: ['gungan-warrior', 'battlefield-marine']
                },
                player2: {
                    hand: [],
                    groundArena: ['peppi-bow#shaak-herder'],
                    deck: ['resupply']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.monCalCruiser);

            expect(context.player1).toHaveExactPromptButtons([
                'Attack with a unit',
                '(No effect) Look at an opponent\'s hand',
            ]);
            expect(context.player1).not.toHavePassAbilityButton();
            context.player1.clickPrompt('(No effect) Look at an opponent\'s hand');

            expect(context.player2).toBeActivePlayer();
        });
    });
});