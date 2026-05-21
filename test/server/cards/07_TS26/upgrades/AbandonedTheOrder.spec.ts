describe('Abandoned the Order', function() {
    integration(function(contextRef) {
        describe('constant ability', function() {
            it('should remove the Jedi trait and grant Restore 1 to attached unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['knights-saber'],
                        base: { card: 'dagobah-swamp', damage: 5 },
                        groundArena: [{ card: 'jedi-guardian', upgrades: ['abandoned-the-order'] }],
                    },
                    player2: {
                        groundArena: ['wampa'],
                    }
                });
                const { context } = contextRef;

                // Jedi Guardian normally has Jedi trait; with upgrade it should lose it
                expect(context.jediGuardian.hasSomeTrait('jedi')).toBeFalse();

                // Knight's Saber requires a Jedi non-Vehicle unit — Jedi Guardian lost the trait, so saber is not playable
                expect(context.player1).not.toBeAbleToSelect(context.knightsSaber);

                // Should have Restore 1 from the upgrade
                expect(context.jediGuardian.hasSomeKeyword('restore')).toBeTrue();

                // Attack to trigger Restore 1 — should heal 1 damage from base
                context.player1.clickCard(context.jediGuardian);
                context.player1.clickCard(context.p2Base);

                expect(context.p1Base.damage).toBe(4);
            });
        });

        describe('when played ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['abandoned-the-order'],
                        groundArena: ['wampa'],
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        base: 'dagobah-swamp',
                        resources: 6,
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                    }
                });
            });

            it('should optionally return a non-leader unit to its owner\'s hand', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.abandonedTheOrder);
                context.player1.clickCard(context.wampa);

                // Should only be able to select non-leader units (not Luke leader)
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce).toBeInZone('hand', context.player2);
            });

            it('should allow declining the bounce ability', function() {
                const { context } = contextRef;

                context.player1.clickCard(context.abandonedTheOrder);
                context.player1.clickCard(context.wampa);

                // Player can pass instead of selecting a target
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.consularSecurityForce]);
                context.player1.clickPrompt('Pass');

                // No unit was returned
                expect(context.wampa).toBeInZone('groundArena');
                expect(context.consularSecurityForce).toBeInZone('groundArena');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
