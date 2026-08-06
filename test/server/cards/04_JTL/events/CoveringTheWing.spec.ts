describe('Covering The Wing', function() {
    integration(function(contextRef) {
        describe('Covering The Wing\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['covering-the-wing'],
                        groundArena: ['wampa'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['red-three#unstoppable']
                    }
                });
            });

            it('should create a X-wing token unit and give a shield token to another unit', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.coveringTheWing);

                // Create an X-Wing token and assert it is exhausted
                const xwings = context.player1.findCardsByName('xwing');
                expect(xwings.length).toBe(1);
                expect(xwings).toAllBeInZone('spaceArena');
                expect(xwings.every((token) => token.exhausted)).toBeTrue();

                // Give a Shield token to another unit
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHavePrompt('Give a Shield token to another unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.redThree, context.allianceXwing]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });
        });

        describe('with Moff Jerjerrod', function() {
            it('should create 2 X-wing tokens and not allow either to be shielded', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['covering-the-wing'],
                        groundArena: ['wampa', 'moff-jerjerrod#we-shall-redouble-our-efforts'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['red-three#unstoppable']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.coveringTheWing);
                expect(context.player1).toHavePassAbilityPrompt('Defeat Moff Jerjerrod to create 2 X-Wing tokens instead');
                context.player1.clickPrompt('Trigger');

                const xwings = context.player1.findCardsByName('xwing', 'spaceArena');
                expect(context.moffJerjerrod).toBeInZone('discard');
                expect(xwings.length).toBe(2);
                expect(xwings).toAllBeInZone('spaceArena');

                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHavePrompt('Give a Shield token to another unit');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.redThree, context.allianceXwing]);
                expect(context.player1).not.toBeAbleToSelect(xwings[0]);
                expect(context.player1).not.toBeAbleToSelect(xwings[1]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
                expect(xwings[0]).not.toHaveExactUpgradeNames(['shield']);
                expect(xwings[1]).not.toHaveExactUpgradeNames(['shield']);
            });
        });
    });
});
