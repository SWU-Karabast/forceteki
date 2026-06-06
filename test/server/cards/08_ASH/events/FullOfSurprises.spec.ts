describe('Full of Surprises', function() {
    integration(function(contextRef) {
        it('Full of Surprises\'s ability return an upgrade that costs 2 or less to its owner\'s hand and give a Shield token to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['full-of-surprises'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['craving-power'] }],
                    spaceArena: [{ card: 'mynock', upgrades: ['sneaking-suspicion'] }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['experience'] }],
                    spaceArena: [{ card: 'awing', upgrades: ['nimble-prowess'] }],
                }
            });
            const { context } = contextRef;

            context.p2Tokens = {
                experience: context.player2.findCardByName('experience'),
            };

            context.player1.clickCard(context.fullOfSurprises);

            expect(context.player1).toHavePrompt('Return an upgrade that costs 2 or less to its owner\'s hand');
            expect(context.player1).toBeAbleToSelectExactly([context.p2Tokens.experience, context.nimbleProwess, context.sneakingSuspicion]);
            context.player1.clickCard(context.sneakingSuspicion);

            expect(context.player1).toHavePrompt('Give a Shield token to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.mynock, context.grandInquisitor, context.atst, context.awing]);
            context.player1.clickCard(context.grandInquisitor);

            expect(context.sneakingSuspicion).toBeInZone('hand', context.player1);
            expect(context.grandInquisitor).toHaveExactUpgradeNames(['shield']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['craving-power']);
            expect(context.mynock).toHaveExactUpgradeNames([]);
            expect(context.atst).toHaveExactUpgradeNames(['experience']);
            expect(context.awing).toHaveExactUpgradeNames(['nimble-prowess']);

            expect(context.player2).toBeActivePlayer();
        });

        it('Full of Surprises\'s ability return a token upgrade and give a Shield token to a unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['full-of-surprises'],
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['craving-power'] }],
                    spaceArena: [{ card: 'mynock', upgrades: ['sneaking-suspicion'] }],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['experience'] }],
                    spaceArena: [{ card: 'awing', upgrades: ['nimble-prowess'] }],
                }
            });
            const { context } = contextRef;

            context.p2Tokens = {
                experience: context.player2.findCardByName('experience'),
            };

            context.player1.clickCard(context.fullOfSurprises);

            expect(context.player1).toHavePrompt('Return an upgrade that costs 2 or less to its owner\'s hand');
            expect(context.player1).toBeAbleToSelectExactly([context.p2Tokens.experience, context.nimbleProwess, context.sneakingSuspicion]);
            context.player1.clickCard(context.p2Tokens.experience);

            expect(context.player1).toHavePrompt('Give a Shield token to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.mynock, context.grandInquisitor, context.atst, context.awing]);
            context.player1.clickCard(context.grandInquisitor);

            expect(context.grandInquisitor).toHaveExactUpgradeNames(['shield']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames(['craving-power']);
            expect(context.mynock).toHaveExactUpgradeNames(['sneaking-suspicion']);
            expect(context.atst).toHaveExactUpgradeNames([]);
            expect(context.awing).toHaveExactUpgradeNames(['nimble-prowess']);

            expect(context.player2).toBeActivePlayer();
        });

        it('Full of Surprises\'s should return an upgrade and not break if no units remain', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['full-of-surprises'],
                },
                player2: {
                    groundArena: [{ card: 'atst', upgrades: ['experience'], damage: 7 }],
                }
            });
            const { context } = contextRef;

            context.p2Tokens = {
                experience: context.player2.findCardByName('experience'),
            };

            context.player1.clickCard(context.fullOfSurprises);

            expect(context.player1).toHavePrompt('Return an upgrade that costs 2 or less to its owner\'s hand');
            expect(context.player1).toBeAbleToSelectExactly([context.p2Tokens.experience]);
            context.player1.clickCard(context.p2Tokens.experience);

            context.player1.clickCard(context.atst);

            expect(context.atst).toBeInZone('discard');

            expect(context.player2).toBeActivePlayer();
        });

        it('Full of Surprises\'s should give a Shield even if there are no upgrades to return', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['full-of-surprises'],
                    groundArena: ['battlefield-marine'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                },
            });
            const { context } = contextRef;

            context.player1.clickCard(context.fullOfSurprises);

            expect(context.player1).toHavePrompt('Give a Shield token to a unit');
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandInquisitor]);
            context.player1.clickCard(context.grandInquisitor);

            expect(context.grandInquisitor).toHaveExactUpgradeNames(['shield']);
            expect(context.battlefieldMarine).toHaveExactUpgradeNames([]);

            expect(context.player2).toBeActivePlayer();
        });
    });
});