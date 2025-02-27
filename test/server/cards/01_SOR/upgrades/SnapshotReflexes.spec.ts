describe('Snapshot Reflexes', function() {
    integration(function(contextRef) {
        describe('Snapshot Reflexes\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['battlefield-marine', { card: 'wampa', exhausted: true }],
                        hand: ['snapshot-reflexes']
                    },
                    player2: {
                        groundArena: ['specforce-soldier']
                    }
                });
            });

            it('initiates an attack when played', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.snapshotReflexes);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.player1).toHavePassAbilityPrompt('Attack with attached unit');

                context.player1.clickPrompt('Attack with attached unit');
                context.player1.clickCard(context.specforceSoldier);

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['snapshot-reflexes']);
                expect(context.battlefieldMarine.exhausted).toBe(true);
                expect(context.player2).toBeActivePlayer();
            });

            it('initiates an attack but player selects not to attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.snapshotReflexes);
                context.player1.clickCard(context.battlefieldMarine);

                context.player1.passAction();

                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['snapshot-reflexes']);
                expect(context.battlefieldMarine.exhausted).toBe(false);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not initiates an attack when played on a unit that is already exhausted', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.snapshotReflexes);
                context.player1.clickCard(context.wampa);

                expect(context.wampa).toHaveExactUpgradeNames(['snapshot-reflexes']);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
