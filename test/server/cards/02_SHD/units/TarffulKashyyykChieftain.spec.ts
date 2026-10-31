describe('Tarfful, Kashyyyk Chieftain', function() {
    integration(function(contextRef) {
        describe('Tarfful\'s ability', function() {
            it('when a wookie unit is damaged that unit deals that much damage to an enemy ground unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['tarfful#kashyyyk-chieftain', 'liberated-slaves', 'isb-agent'],
                    },
                    player2: {
                        groundArena: ['wampa', 'volunteer-soldier', 'wroshyr-tree-tender', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        leader: 'qira#i-alone-survived',
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // Scenario 1: a friendly wookie unit attacks
                context.player1.clickCard(context.liberatedSlaves);
                context.player1.clickCard(context.wroshyrTreeTender);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.volunteerSoldier, context.wroshyrTreeTender, context.atst]);
                context.player1.clickCard(context.volunteerSoldier);

                expect(context.volunteerSoldier.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                // Scenario 2: a friendly wookie unit is attacked and does not survive
                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.liberatedSlaves);

                expect(context.liberatedSlaves).toBeInZone('discard', context.player1);
                expect(context.player1).toBeActivePlayer();

                // Scenario 3: Tarfful attacks
                context.player1.clickCard(context.tarfful);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.volunteerSoldier, context.wroshyrTreeTender, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard', context.player2);
                expect(context.player2).toBeActivePlayer();

                // Scenario 4: a friendly non-wookie unit is attacked
                context.setDamage(context.wroshyrTreeTender, 0);
                context.player2.clickCard(context.wroshyrTreeTender);
                context.player2.clickCard(context.isbAgent);

                expect(context.isbAgent).toBeInZone('groundArena', context.player1);
                expect(context.player1).toBeActivePlayer();

                // Scenario 5: a friendly wookiee unit is attacked and survives
                context.player1.moveCard(context.liberatedSlaves, 'groundArena');
                context.player1.passAction();

                context.player2.moveCard(context.atst, 'groundArena');
                context.player2.clickCard(context.volunteerSoldier);
                context.player2.clickCard(context.liberatedSlaves);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.wroshyrTreeTender, context.atst]);
                context.player1.clickCard(context.atst);

                expect(context.atst.damage).toBe(3);

                // Scenario 6: non-combat damage does not trigger Tarfful's ability
                context.player1.passAction();

                context.player2.clickCard(context.qira);
                context.player2.clickPrompt('Deploy Qi\'ra');

                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toHavePrompt('Choose an action');
            });

            it('triggers once for each friendly wookiee unit when Darth Maul deals combat damage to multiple of them at the same time', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['tarfful#kashyyyk-chieftain', 'chewbacca#faithful-first-mate'],
                    },
                    player2: {
                        groundArena: ['darth-maul#revenge-at-last', 'wampa', 'atst'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.darthMaul);
                context.player2.clickCard(context.tarfful);
                context.player2.clickCard(context.chewbacca);
                context.player2.clickDone();

                expect(context.tarfful.damage).toBe(5);
                expect(context.chewbacca.damage).toBe(5);
                expect(context.darthMaul).toBeInZone('discard');

                // Tarfful's ability triggers once for each wookiee
                expect(context.player1).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
                context.player1.clickPrompt('Resolve all (2)');

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');

                expect(context.player1).toBeAbleToSelectExactly([context.atst]);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);

                expect(context.player1).toBeActivePlayer();
            });

            it('still triggers for another friendly wookiee unit that is dealt combat damage at the same time as Tarfful is defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'tarfful#kashyyyk-chieftain', damage: 5 }, 'chewbacca#faithful-first-mate'],
                    },
                    player2: {
                        groundArena: ['darth-maul#revenge-at-last', 'wampa', 'atst'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.darthMaul);
                context.player2.clickCard(context.tarfful);
                context.player2.clickCard(context.chewbacca);
                context.player2.clickDone();

                expect(context.tarfful).toBeInZone('discard');
                expect(context.chewbacca.damage).toBe(5);
                expect(context.darthMaul).toBeInZone('discard');

                // Tarfful was in play when the combat damage was dealt, so its ability still triggers for Chewbacca (but not for itself)
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atst]);
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(5);
                expect(context.wampa.damage).toBe(0);

                expect(context.player1).toBeActivePlayer();
            });

            it('deals no damage if a friendly wookiee unit is dealt no damage because of a shield', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['tarfful#kashyyyk-chieftain', { card: 'liberated-slaves', upgrades: ['shield'] }, 'isb-agent'],
                    },
                    player2: {
                        groundArena: ['wampa', 'volunteer-soldier', 'wroshyr-tree-tender', 'atst'],
                        spaceArena: ['cartel-spacer'],
                        hasInitiative: true,
                    },
                });

                const { context } = contextRef;

                context.player2.clickCard(context.atst);
                context.player2.clickCard(context.liberatedSlaves);

                expect(context.liberatedSlaves).toHaveExactUpgradeNames([]);
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});
