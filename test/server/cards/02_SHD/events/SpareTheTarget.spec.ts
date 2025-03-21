describe('Spare the Target', function() {
    integration(function(contextRef) {
        describe('Spare the Target\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['spare-the-target'],
                        groundArena: ['clone-deserter'],
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer', { card: 'wampa', upgrades: ['death-mark'] }],
                        spaceArena: ['tie-bomber', { card: 'cartel-turncoat', upgrades: ['public-enemy'] }],
                        leader: { card: 'the-mandalorian#sworn-to-the-creed', deployed: true, upgrades: ['top-target'] },
                    },
                });
            });

            it('can return a unit to its owner\'s hand and collect all bounties on the unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.spareTheTarget);
                expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.wampa, context.tieBomber, context.cartelTurncoat]);
                context.player1.clickCard(context.hylobonEnforcer);
                expect(context.hylobonEnforcer).toBeInZone('hand');
                expect(context.player1.handSize).toBe(1);
            });

            it('can return a unit to its owner\'s hand and collect a gained bounty on the unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.spareTheTarget);
                expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.wampa, context.tieBomber, context.cartelTurncoat]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('hand');
                expect(context.player1.handSize).toBe(2);
            });

            it('can return a unit with no bounties to its owner\'s hand', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.spareTheTarget);
                expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.wampa, context.tieBomber, context.cartelTurncoat]);
                context.player1.clickCard(context.tieBomber);
                expect(context.tieBomber).toBeInZone('hand');
            });

            it('will prompt for which bounty to resolve if there are multiple', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.spareTheTarget);
                expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.wampa, context.tieBomber, context.cartelTurncoat]);
                context.player1.clickCard(context.cartelTurncoat);

                expect(context.player1).toHavePrompt('Choose a Bounty ability to use');
                expect(context.player1).toHaveExactPromptButtons([
                    'Collect Bounty: Draw a card',
                    'Collect Bounty: Give a Shield token to a unit.'
                ]);

                context.player1.clickPrompt('Collect Bounty: Give a Shield token to a unit.');
                expect(context.player1).toBeAbleToSelectExactly([context.hylobonEnforcer, context.wampa, context.tieBomber, context.theMandalorian, context.cloneDeserter]);
                context.player1.clickCard(context.cloneDeserter);
                expect(context.cloneDeserter).toHaveExactUpgradeNames(['shield']);

                // card draw resolves automatically since these bounty collections aren't optional
                expect(context.player1.handSize).toBe(1);
            });
        });
    });
});
