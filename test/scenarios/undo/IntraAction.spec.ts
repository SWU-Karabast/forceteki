
describe('Intra Action', function() {
    undoIntegration(function(contextRef) {
        it('should be able to rollback while an Attack is ongoing', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player2: {
                    base: {
                        card: 'data-vault',
                        damage: 11
                    },
                    groundArena: [
                        {
                            card: 'yoda#old-master',
                            damage: 0,
                            exhausted: true
                        },
                        {
                            card: 'yaddle#a-chance-to-make-things-right',
                            damage: 0,
                            exhausted: true
                        }
                    ],
                    hand: [
                        'takedown'
                    ],
                    hasForceToken: false,
                    hasInitiative: false,
                    resources: 9
                },
                player1: {
                    base: {
                        card: 'energy-conversion-lab',
                        damage: 5
                    },
                    hand: [
                        'annihilator#tagges-flagship',
                        'darth-vader#twilight-of-the-apprentice',
                        'director-krennic#on-the-verge-of-greatness',
                        'nightsister-warrior'
                    ],
                    hasForceToken: false,
                    hasInitiative: true,
                    leader: {
                        card: 'grand-admiral-thrawn#how-unfortunate',
                        exhausted: true
                    },
                    resources: [
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'atst',
                        'timely-intervention'
                    ],
                    spaceArena: [
                        {
                            card: 'chimaera#reinforcing-the-center',
                            damage: 0,
                            exhausted: true
                        }
                    ]
                }
            });

            const { context } = contextRef;

            rollback(contextRef, () => {
                context.player1.clickCard(context.timelyIntervention);
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Give a Shield token to a friendly unit and to an enemy unit');
                context.player1.clickCard(context.chimaera);
                context.player1.clickCard(context.yaddle);
                context.player1.clickPrompt('Trigger');

                // target Yoda for ambush
                context.player1.clickCard(context.yoda);

                // target Yaddle for defeat ability
                context.player1.clickCard(context.yaddle);
            });

            context.player2.clickPrompt('Done');
            expect(true).toBe(true);
        });
    });
});
