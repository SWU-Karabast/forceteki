describe('Finn, On the Run', function () {
    integration(function (contextRef) {
        it('Finn\'s ability should prevent 1 damage from any source to a unique unit', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'scout-bike-pursuer'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.finn, context.chewbacca]);
            context.player1.clickCard(context.chewbacca);

            // attack with battlefield marine, should do only 2 damage
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.chewbacca);

            expect(context.chewbacca.damage).toBe(2);
            context.player1.passAction();

            // attack on another unit, damage is not reduced
            context.player2.clickCard(context.scoutBikePursuer);
            context.player2.clickCard(context.finn);
            expect(context.finn.damage).toBe(1);
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (event + boba fett)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane']
                },
                player2: {
                    hand: ['daring-raid'],
                    leader: 'boba-fett#any-methods-necessary'
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            // use daring raid into chewbacca, should do only 1 damage
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.chewbacca);
            expect(context.chewbacca.damage).toBe(1);

            expect(context.player2).toHavePassAbilityPrompt('Exhaust this leader to deal 1 indirect damage to a player');
            context.player2.clickPrompt('Trigger');
            context.player2.clickPrompt('Deal indirect damage to opponent');

            context.player1.setDistributeIndirectDamagePromptState(new Map([
                [context.chewbacca, 1],
            ]));

            expect(context.player1).toBeActivePlayer();
            // indirect damage is unpreventable
            expect(context.chewbacca.damage).toBe(2);
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (shield not destroyed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', { card: 'chewbacca#pykesbane', upgrades: ['shield'] }]
                },
                player2: {
                    groundArena: ['scout-bike-pursuer'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            // scout bike pursuer attack chewbacca, does only 1 damage which is prevented, shield is not defeated
            context.player2.clickCard(context.scoutBikePursuer);
            context.player2.clickCard(context.chewbacca);

            expect(context.player1).toHaveExactPromptButtons([
                'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');
            expect(context.chewbacca.damage).toBe(0);
            expect(context.chewbacca).toHaveExactUpgradeNames(['shield']);
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (shield destroyed)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', { card: 'chewbacca#pykesbane', upgrades: ['shield'] }]
                },
                player2: {
                    groundArena: ['dryden-vos#offering-no-escape'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            // attack with dryden vos, shield is defeated after 1 damage was prevented
            context.player2.clickCard(context.drydenVos);
            context.player2.clickCard(context.chewbacca);

            context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');
            expect(context.chewbacca.damage).toBe(0);
            expect(context.chewbacca.isUpgraded()).toBeFalse();
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (next round)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            context.moveToNextActionPhase();

            context.player1.passAction();

            // next round, ability should be expired
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.chewbacca);
            expect(context.chewbacca.damage).toBe(3);
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (tarfful not triggering)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane', 'tarfful#kashyyyk-chieftain']
                },
                player2: {
                    groundArena: ['scout-bike-pursuer'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            // attack with 1 damage to chewbacca
            context.player2.clickCard(context.scoutBikePursuer);
            context.player2.clickCard(context.chewbacca);

            // no combat damage dealt, tarfful does not trigger
            expect(context.player1).toBeActivePlayer();
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (tarfful triggering)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane', 'tarfful#kashyyyk-chieftain']
                },
                player2: {
                    groundArena: ['battlefield-marine', 'atst'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            // attack with 1 damage to chewbacca
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.chewbacca);

            expect(context.player1).toBeAbleToSelectExactly([context.atst]);
            context.player1.clickCard(context.atst);

            expect(context.player1).toBeActivePlayer();
            expect(context.atst.damage).toBe(2);
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (maul redirect while attacking)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', {
                        card: 'chewbacca#pykesbane',
                        upgrades: ['shield']
                    }, 'maul#shadow-collective-visionary']
                },
                player2: {
                    groundArena: ['scout-bike-pursuer'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            context.player2.passAction();

            // maul attack scout bike pursuer, should take 1 damage, redirect it to chewbacca and finn ability prevent it
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.scoutBikePursuer);

            // maul prompt
            expect(context.player1).toHavePrompt('Choose another friendly Underworld unit. All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.');
            context.player1.clickCard(context.chewbacca);

            // finn replacement prompt
            expect(context.player1).toHaveExactPromptButtons([
                'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');
            expect(context.chewbacca.damage).toBe(0);
            expect(context.chewbacca).toHaveExactUpgradeNames(['shield']);
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (maul+finn reduce then redirect)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane', 'maul#shadow-collective-visionary']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.maul);

            context.player2.passAction();

            // maul attack scout bike pursuer, should take 1 damage, redirect it to chewbacca and finn ability prevent it
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.battlefieldMarine);

            // maul prompt
            expect(context.player1).toHavePrompt('Choose another friendly Underworld unit. All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.');
            context.player1.clickCard(context.chewbacca);

            expect(context.player1).toHaveExactPromptButtons([
                'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                'Redirect combat damage to another Underworld unit',
            ]);

            // reduce damage before redirecting them
            context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');

            expect(context.player2).toBeActivePlayer();
            expect(context.chewbacca.damage).toBe(2);
        });

        it('Finn\'s ability should prevent 1 damage from any source to a unique unit (maul+finn redirect before reduce)', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane', 'maul#shadow-collective-visionary']
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.maul);

            context.player2.passAction();

            // maul attack scout bike pursuer, should take 1 damage, redirect it to chewbacca and finn ability prevent it
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.battlefieldMarine);

            // maul prompt
            expect(context.player1).toHavePrompt('Choose another friendly Underworld unit. All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.');
            context.player1.clickCard(context.chewbacca);

            expect(context.player1).toHaveExactPromptButtons([
                'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                'Redirect combat damage to another Underworld unit',
            ]);

            // redirect damage, no damage dealt to maul, they're not reduce
            context.player1.clickPrompt('Redirect combat damage to another Underworld unit');

            expect(context.player2).toBeActivePlayer();
            expect(context.chewbacca.damage).toBe(3);
        });
    });
});
