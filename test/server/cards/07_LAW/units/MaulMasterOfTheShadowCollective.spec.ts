describe('Maul, Master of the Shadow Collective', function() {
    integration(function(contextRef) {
        describe('Maul\'s on attack ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    attackRulesVersion: 'cr7',
                    player1: {
                        hand: ['bravado'],
                        groundArena: ['maul#master-of-the-shadow-collective', 'battlefield-marine'],
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: ['atat-suppressor', 'wampa', 'atst', 'ravenous-rathtar'],
                        leader: { card: 'han-solo#worth-the-risk', deployed: true }
                    }
                });
            });

            it('should take control of an enemy non-leader unit until Maul leaves the arena (via defeat) if he dealt combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atatSuppressor, context.atst, context.ravenousRathtar]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.controller).toBe(context.player1Object);

                // defeat Maul and confirm that control returns to the opponent
                context.player2.clickCard(context.atatSuppressor);
                context.player2.clickCard(context.maul);

                expect(context.wampa.controller).toBe(context.player2Object);
            });

            it('should take control of an enemy non-leader unit until Maul leaves the arena (via return to hand) if he dealt combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.atatSuppressor, context.atst, context.ravenousRathtar]);
                context.player1.clickCard(context.wampa);

                expect(context.wampa.controller).toBe(context.player1Object);

                // return Maul to hand and confirm that control returns to the opponent
                context.player2.clickCard(context.waylay);
                context.player2.clickCard(context.maul);

                expect(context.wampa.controller).toBe(context.player2Object);
            });

            it('should take control of an enemy non-leader unit if he dealt combat damage to a base via Overwhelm', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.wampa);

                expect(context.player1).toBeAbleToSelectExactly([context.atatSuppressor, context.atst, context.ravenousRathtar]);
                context.player1.clickCard(context.atatSuppressor);

                expect(context.atatSuppressor.controller).toBe(context.player1Object);
            });

            it('should not trigger if he did not deal combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.atst);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if he dealt combat damage to a base on a previous attack', function () {
                const { context } = contextRef;

                // first attack - damage a base
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.atatSuppressor, context.ravenousRathtar]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.controller).toBe(context.player1Object);

                // re-ready Maul
                context.player2.passAction();
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.maul);

                // second attack - no base damage
                context.player2.passAction();
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.atst);
                expect(context.player2).toBeActivePlayer();
            });

            it('should take control of multiple units on multiple attacks and return all of them when he leaves play', function () {
                const { context } = contextRef;

                // first attack - take Wampa
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);

                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.wampa, context.atatSuppressor, context.ravenousRathtar]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.controller).toBe(context.player1Object);

                // re-ready Maul
                context.player2.passAction();
                context.player1.clickCard(context.bravado);
                context.player1.clickCard(context.maul);

                // second attack - take AT-ST
                context.player2.passAction();
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.p2Base);
                context.player1.clickCard(context.atst);
                expect(context.atst.controller).toBe(context.player1Object);

                // move to next action phase to ready him again
                context.moveToNextActionPhase();

                // third attack - dies to AT-AT Suppressor, confirm that both Wampa and AT-ST return to opponent's control
                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.atatSuppressor);
                expect(context.atst.controller).toBe(context.player2Object);
                expect(context.wampa.controller).toBe(context.player2Object);
            });

            it('should not trigger if he is defeated during the attack', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.maul);
                context.player1.clickCard(context.ravenousRathtar);

                expect(context.p2Base.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger if another friendly unit deals combat damage to a base', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('Maul\'s on attack ability should take control of an enemy unit if he dealt combat damage to a base via "direct" Overwhelm', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    groundArena: [{ card: 'maul#master-of-the-shadow-collective', damage: 2, upgrades: ['vambrace-flamethrower'] }],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'wampa'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.battlefieldMarine);

            // trigger flamethrower to defeat Battlefield Marine and at "on attack" step
            context.player1.setDistributeDamagePromptState(new Map([
                [context.battlefieldMarine, 3],
            ]));

            expect(context.player1).toBeAbleToSelectExactly([context.wampa]);
            context.player1.clickCard(context.wampa);
            expect(context.wampa.controller).toBe(context.player1Object);
        });

        it('Maul\'s on attack ability should defeat the stolen unit instead of returning it if it has become a leader unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                attackRulesVersion: 'cr7',
                player1: {
                    leader: 'asajj-ventress#i-work-alone',
                    groundArena: ['maul#master-of-the-shadow-collective'],
                },
                player2: {
                    spaceArena: ['mc30-assault-frigate'],
                    groundArena: ['atat-suppressor'],
                }
            });

            const { context } = contextRef;

            // steal MC-30 Assault Frigate with Maul's ability
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.mc30AssaultFrigate);
            expect(context.mc30AssaultFrigate.controller).toBe(context.player1Object);

            context.player2.passAction();

            // deploy Asajj Ventress onto it to make it a leader
            context.player1.clickCard(context.asajjVentress);
            context.player1.clickPrompt('Deploy Asajj Ventress as a Pilot');
            context.player1.clickCard(context.mc30AssaultFrigate);

            // move to next action phase to ready Maul
            context.moveToNextActionPhase();

            // attack with Maul and confirm that the MC-30 is defeated instead of returning to opponent's control
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.atatSuppressor);
            expect(context.mc30AssaultFrigate).toBeInZone('discard', context.player2);
            expect(context.asajjVentress).toBeInZone('base');
        });
    });
});
