
describe('Jetpack', function() {
    integration(function(contextRef) {
        describe('Jetpack\'s when played ability', function() {
            beforeEach(async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['jetpack', 'jetpack', 'survivors-gauntlet'],
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
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.jawaScavenger, context.wampa]); // can't target vehicles
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jetpack', 'shield']);

                context.moveToRegroupPhase();

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jetpack']);
            });

            it('creates a shield which will be automatically defeated before any other shields when damage is dealt by ability', function() {
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

            it('creates a shield which will be automatically defeated before any other shields  when damage is dealt by an attack', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jetpack1);
                context.player1.clickCard(context.jawaScavenger);

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield', 'shield']);

                const jetpackShield = context.player1.findCardsByName('shield').filter((shield) => shield !== context.scavengerOriginalShield)[0];

                context.player2.clickCard(context.wampa);
                context.player2.clickCard(context.jawaScavenger);

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield']);
                expect(jetpackShield).toBeInZone('outsideTheGame');

                context.moveToRegroupPhase();

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield']);
            });

            it('will stack shields correctly', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jetpack1);
                context.player1.clickCard(context.jawaScavenger);
                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield', 'shield']);
                const jetpackShield1 = context.player1.findCardsByName('shield').filter((shield) => shield !== context.scavengerOriginalShield)[0];

                context.player2.passAction();

                context.player1.clickCard(context.jetpack2);
                context.player1.clickCard(context.jawaScavenger);
                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'jetpack', 'shield', 'shield', 'shield']);
                const jetpackShield2 = context.player1.findCardsByName('shield').filter((shield) =>
                    shield !== context.scavengerOriginalShield && shield !== jetpackShield1
                )[0];

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.jawaScavenger);

                const [defeatedShield, notDefeatedShield] = jetpackShield1.zoneName === 'outsideTheGame'
                    ? [jetpackShield1, jetpackShield2]
                    : [jetpackShield2, jetpackShield1];

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'jetpack', 'shield', 'shield']);
                expect(defeatedShield).toBeInZone('outsideTheGame');
                expect(notDefeatedShield).toBeInZone('groundArena');

                context.moveToRegroupPhase();

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'jetpack', 'shield']);
                expect(defeatedShield).toBeInZone('outsideTheGame');
                expect(notDefeatedShield).toBeInZone('outsideTheGame');
            });

            it('created shield will still be defeated at end of phase if moved to another unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jetpack1);
                context.player1.clickCard(context.jawaScavenger);

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield', 'shield']);

                const jetpackShield = context.player1.findCardsByName('shield').filter((shield) => shield !== context.scavengerOriginalShield)[0];

                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(jetpackShield);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);

                context.moveToRegroupPhase();

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['jetpack', 'shield']);
                expect(context.battlefieldMarine.isUpgraded()).toBeFalse();
            });

            it('created shield will still be defeated at end of phase if moved to another unit', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.jetpack1);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jetpack', 'shield']);

                const jetpackShield = context.player1.findCardsByName('shield').filter((shield) => shield !== context.scavengerOriginalShield)[0];

                context.player2.passAction();

                context.player1.clickCard(context.survivorsGauntlet);
                context.player1.clickCard(jetpackShield);
                context.player1.clickCard(context.jawaScavenger);
                expect(context.jawaScavenger).toHaveExactUpgradeNames(['shield', 'shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jetpack']);

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.jawaScavenger);
                expect(context.jawaScavenger).toHaveExactUpgradeNames(['shield']);
                expect(jetpackShield).toBeInZone('outsideTheGame');

                context.moveToRegroupPhase();

                expect(context.jawaScavenger).toHaveExactUpgradeNames(['shield']);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['jetpack']);
            });
        });
    });
});