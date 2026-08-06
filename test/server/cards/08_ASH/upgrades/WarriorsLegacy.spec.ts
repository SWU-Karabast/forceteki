describe('Warrior\'s Legacy', function() {
    integration(function(contextRef) {
        it('Warrior\'s Legacy should create a Mandalorian token when attached unit is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['warriors-legacy'] }],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['rivals-fall'],
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeActivePlayer();

            const mandalorian = context.player1.findCardByName('mandalorian');

            expect(mandalorian).toBeInZone('groundArena', context.player1);
            expect(mandalorian.exhausted).toBeTrue();
        });

        it('Warrior\'s Legacy should create a Mandalorian token when attached unit is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['warriors-legacy'] }],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['no-glory-only-results'],
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.noGloryOnlyResults);
            context.player2.clickCard(context.battlefieldMarine);

            expect(context.player1).toBeActivePlayer();

            const mandalorian = context.player2.findCardByName('mandalorian');

            expect(mandalorian).toBeInZone('groundArena', context.player2);
            expect(mandalorian.exhausted).toBeTrue();
        });

        it('Warrior\'s Legacy should create a Mandalorian token when attached unit is defeated', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'battlefield-marine', upgrades: ['warriors-legacy'] }],
                },
                player2: {
                    hasInitiative: true,
                    hand: ['outer-rim-constable'],
                },
            });

            const { context } = contextRef;

            context.player2.clickCard(context.outerRimConstable);
            context.player2.clickCard(context.warriorsLegacy);

            expect(context.player1).toBeActivePlayer();
            expect(() => context.player1.findCardByName('mandalorian')).toThrowError('Could not find any cards matching name mandalorian');
        });
    });
});
