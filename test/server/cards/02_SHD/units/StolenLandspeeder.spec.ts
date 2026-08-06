describe('Stolen Landspeeder', function () {
    integration(function (contextRef) {
        const bountyPrompt = 'Collect Bounty: If you own this unit, play it from your discard pile for free and give an Experience token to it';

        it('Stolen Landspeeder\'s ability should allow opponent to take control of it when played from hand and to play it for free when collecting the bounty', async function () {
            await contextRef.setupTestAsync({
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
            context.player1.clickPrompt('Trigger');

            expect(context.stolenLandspeeder).toBeInZone('groundArena', context.player1);
            expect(context.stolenLandspeeder).toHaveExactUpgradeNames(['experience']);

            // Player 2 kills Stolen Landspeeder
            context.player2.clickCard(context.wampa);
            context.player2.clickCard(context.stolenLandspeeder);

            // and collects the bounty
            expect(context.player2).toHavePassAbilityPrompt(bountyPrompt);
            context.player2.clickPrompt('Trigger');

            // which does nothing
            expect(context.stolenLandspeeder).toBeInZone('discard', context.player1);
        });

        it('Stolen Landspeeder\'s ability should not allow opponent to take control of it when played from out of hand', async function () {
            await contextRef.setupTestAsync({
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

        // Ruling 2024 (Han2): when Han Solo (Worth the Risk) leader plays Stolen Landspeeder, his
        // "deal 2 damage to it" defeats the Landspeeder before its "an opponent takes control" When
        // Played trigger would resolve, so the opponent never takes control of it.
        it('is defeated by Han Solo (Worth the Risk) leader before the take-control trigger resolves', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: { card: 'han-solo#worth-the-risk', deployed: true },
                    hand: ['stolen-landspeeder'],
                    resources: 5
                },
                player2: {}
            });

            const { context } = contextRef;

            // Han Solo uses his leader ability to play Stolen Landspeeder (cost 1, -1 = free) and deal
            // 2 damage to it, defeating it (hp 2).
            context.player1.clickCard(context.hanSolo);
            context.player1.clickPrompt('Play a unit from your hand. It costs 1 resource less. Deal 2 damage to it.');
            context.player1.clickCard(context.stolenLandspeeder);

            // Defeating the Landspeeder leaves both the "opponent takes control" trigger (player1) and
            // the bounty trigger (player2) pending in the same window; resolve player1's first.
            context.player1.clickPrompt('You');

            // player2's bounty does nothing (they don't own the Landspeeder); pass on it
            context.player2.clickPrompt('Pass');

            // The Landspeeder was defeated before the take-control trigger could resolve, so control
            // never changed to player2 — it goes to its owner's (player1's) discard pile.
            expect(context.stolenLandspeeder).toBeInZone('discard', context.player1);
        });
    });
});