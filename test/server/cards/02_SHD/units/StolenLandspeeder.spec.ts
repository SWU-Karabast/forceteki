describe('Stolen Landspeeder', function () {
    integration(function (contextRef) {
        const bountyPrompt = 'Collect Bounty: If you own this unit, play it from your discard pile for free and give an Experience token to it';

        it('Stolen Landspeeder\'s ability should allow opponent to take control of it when played from hand and to play it for free when collecting the bounty', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['stolen-landspeeder'],
                    groundArena: ['super-battle-droid'],
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Player 1 plays Stolen Landspeeder from hand and opponent takes control of it
            context.player1.clickCard(context.stolenLandspeeder);
            expect(context.stolenLandspeeder).toBeInZone('groundArena', context.player2);

            // Player 2 passes
            context.player2.passAction();

            // Player 1 kills Stolen Landspeeder
            context.player1.clickCard(context.superBattleDroid);
            context.player1.clickCard(context.stolenLandspeeder);

            // and collects the bounty
            expect(context.player1).toHavePassAbilityPrompt(bountyPrompt);
            context.player1.clickPrompt(bountyPrompt);

            expect(context.stolenLandspeeder).toBeInZone('groundArena', context.player1);
            expect(context.stolenLandspeeder).toHaveExactUpgradeNames(['experience']);

            // Player 2 kills Stolen Landspeeder
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.stolenLandspeeder);

            // and collects the bounty
            expect(context.player2).toHavePassAbilityPrompt(bountyPrompt);
            context.player2.clickPrompt(bountyPrompt);

            // which does nothing
            expect(context.stolenLandspeeder).toBeInZone('discard', context.player1);
        });

        it('Stolen Landspeeder\'s ability should not allow opponent to take control of it when played from out of hand', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: [],
                    groundArena: ['tech#source-of-insight'],
                    resources: [
                        'stolen-landspeeder',
                        'wampa',
                        'moment-of-peace',
                        'battlefield-marine',
                        'collections-starhopper',
                        'resilient',
                        'mercenary-company'
                    ]
                },
                player2: {
                    groundArena: ['wampa']
                }
            });

            const { context } = contextRef;

            // Player 1 plays Stolen Landspeeder from with smuggle and opponent does not take control of it
            context.player1.clickCard(context.stolenLandspeeder);
            expect(context.stolenLandspeeder).toBeInZone('groundArena', context.player1);
        });
    });
});