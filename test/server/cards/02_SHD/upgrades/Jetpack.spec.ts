
describe('Jetpack', function() {
    integration(function(contextRef) {
        describe('Jetpack\'s when played ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jetpack', 'jetpack'],
                        groundArena: ['battlefield-marine', { card: 'jawa-scavenger', upgrades: ['shield'] }, 'snowspeeder'],
                    },
                    player2: {
                        groundArena: ['wampa'],
                        hand: ['daring-raid']
                    }
                });

                const { context } = contextRef;

                const [jetpack1, jetpack2] = context.player1.findCardsByName('jetpack');
                context.jetpack1 = jetpack1;
                context.jetpack2 = jetpack2;

                context.scavengerOriginalShield = context.player1.findCardByName('shield');
            });

            it('creates a shield and then defeats it at the beginning of the regroup phase', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jetpack1);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jetpack', 'shield']);

                context.moveToRegroupPhase();

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jetpack']);
            });

            it('creates a shield which will be automatically defeated before any other shields', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jetpack1);
                context.player1.clickCard(context.jawaScavenger);

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield', 'shield']);

                const jetpackShield = context.player1.findCardsByName('shield').filter((shield) => shield !== context.scavengerOriginalShield)[0];

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.jawaScavenger);

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield']);
                expect(jetpackShield).toBeInZone('outsideTheGame');

                context.moveToRegroupPhase();

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield']);
            });
        });
    });
});