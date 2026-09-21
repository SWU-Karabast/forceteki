describe('Rex, Outserved His Purpose', function() {
    integration(function(contextRef) {
        describe('its constant ability', function() {
            it('should give a friendly unit with no abilities +1/+1, and remove the bonus when Rex leaves play', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose', 'battlefield-marine']
                    },
                    player2: {
                        hand: ['vanquish'],
                        hasInitiative: true
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine is printed 3/3, buffed to 4/4 by Rex
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(4);

                // Remove Rex from play
                context.player2.clickCard(context.vanquish);
                context.player2.clickCard(context.rex);
                expect(context.rex).toBeInZone('discard', context.player1);

                // Battlefield Marine reverts to its printed stats
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should not buff a friendly unit that has only a printed keyword', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose', 'armored-saber-tank']
                    }
                });

                const { context } = contextRef;

                // Armored Saber Tank has printed Sentinel, so Rex's bonus does not apply
                expect(context.armoredSaberTank.getPower()).toBe(5);
                expect(context.armoredSaberTank.getHp()).toBe(5);
            });

            it('should dynamically start buffing a unit once its only keyword is removed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['specforce-soldier'],
                        groundArena: ['rex#outserved-his-purpose', 'armored-saber-tank']
                    }
                });

                const { context } = contextRef;

                // Armored Saber Tank has printed Sentinel, so Rex's bonus does not apply
                expect(context.armoredSaberTank.getPower()).toBe(5);
                expect(context.armoredSaberTank.getHp()).toBe(5);

                // Play SpecForce Soldier, removing Sentinel from Armored Saber Tank for this phase
                context.player1.clickCard(context.specforceSoldier);
                context.player1.clickCard(context.armoredSaberTank);

                // Armored Saber Tank now has no keywords and no abilities, so it immediately gains Rex's bonus
                expect(context.armoredSaberTank.getPower()).toBe(6);
                expect(context.armoredSaberTank.getHp()).toBe(6);
            });

            it('should not buff a friendly unit that has a printed triggered ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose'],
                        spaceArena: ['imperial-interceptor']
                    }
                });

                const { context } = contextRef;

                // Imperial Interceptor has a printed When Played ability, so Rex's bonus does not apply
                // even though the ability isn't currently resolving and Imperial Interceptor has no keywords
                expect(context.imperialInterceptor.getPower()).toBe(3);
                expect(context.imperialInterceptor.getHp()).toBe(2);
            });

            it('should dynamically start buffing a unit once Kazuda Xiono strips all of its abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy',
                        groundArena: ['rex#outserved-his-purpose', 'wampa']
                    }
                });

                const { context } = contextRef;
                const removeAbilitiesPromptText = 'Remove all abilities from a friendly unit, then take another action';

                // Wampa has printed Overwhelm, so Rex's bonus does not apply
                expect(context.wampa.getPower()).toBe(4);
                expect(context.wampa.getHp()).toBe(5);

                // Use Kazuda's leader-side action ability to remove all abilities from a friendly unit
                context.player1.clickCard(context.kazudaXiono);
                expect(context.player1).toHaveEnabledPromptButton(removeAbilitiesPromptText);
                context.player1.clickPrompt(removeAbilitiesPromptText);

                // Choose Wampa as the target
                expect(context.player1).toBeAbleToSelectExactly([context.rex, context.wampa]);
                context.player1.clickCard(context.wampa);

                // Kazuda exhausts to pay for the action
                expect(context.kazudaXiono.exhausted).toBe(true);

                // Wampa immediately gains Rex's bonus without leaving play
                expect(context.wampa.getPower()).toBe(5);
                expect(context.wampa.getHp()).toBe(6);
            });

            it('should not buff enemy units', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose']
                    },
                    player2: {
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine is controlled by the opponent, so Rex's bonus does not apply
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });

            it('should not buff itself', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Rex has a constant ability, so his own bonus does not apply to himself
                expect(context.rex.getPower()).toBe(5);
                expect(context.rex.getHp()).toBe(6);
            });

            it('should still buff a unit that only has a stat-modifying token attached', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose', { card: 'battlefield-marine', upgrades: ['experience'] }]
                    }
                });

                const { context } = contextRef;

                // Experience grants no ability, so Battlefield Marine still gets Rex's bonus on top of Experience's own bonus
                // Printed 3/3, +1/+1 from Experience, +1/+1 from Rex = 5/5
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);
            });

            it('should still buff a unit that only has a Shield token attached', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose', { card: 'battlefield-marine', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                // A Shield token has an ability, but it's an ability on the token, not on the unit,
                // so Battlefield Marine still counts as having no abilities and gets Rex's bonus.
                // Printed 3/3, +0/+0 from Shield, +1/+1 from Rex = 4/4
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(4);
            });

            it('should still buff a unit after attaching an upgrade whose only ability is its own When Played (Durasteel Plating)', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['durasteel-plating'],
                        groundArena: ['rex#outserved-his-purpose', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Play Durasteel Plating, whose "When Played: Give a Shield token to attached unit" is
                // the upgrade's own ability and does not grant Battlefield Marine any ability
                context.player1.clickCard(context.durasteelPlating);
                context.player1.clickCard(context.battlefieldMarine);

                // The When Played resolved and gave a Shield token, but the Marine still has no abilities of its own
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['durasteel-plating', 'shield']);

                // Printed 3/3, +1/+1 from Durasteel Plating, +1/+1 from Rex = 5/5
                expect(context.battlefieldMarine.getPower()).toBe(5);
                expect(context.battlefieldMarine.getHp()).toBe(5);
            });

            it('should still buff a vehicle whose only upgrade is a Pilot that grants it no ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose'],
                        spaceArena: [{ card: 'desperate-nantex', upgrades: ['luke-skywalker#you-still-with-me'] }]
                    }
                });

                const { context } = contextRef;

                // Luke as a Pilot upgrade only provides stat modifiers and grants no ability to the vehicle,
                // so Desperate Nantex still counts as having no abilities and gets Rex's bonus.
                // Printed 2/3, +3/+2 from Luke, +1/+1 from Rex = 6/6
                expect(context.desperateNantex.getPower()).toBe(6);
                expect(context.desperateNantex.getHp()).toBe(6);
            });

            it('should buff a Beast token, which has no abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['rex#outserved-his-purpose', 'beast']
                    }
                });

                const { context } = contextRef;

                // A Beast token is a vanilla 3/3 with no abilities or keywords, so it gets Rex's bonus
                expect(context.beast.getPower()).toBe(4);
                expect(context.beast.getHp()).toBe(4);
            });

            it('should stop buffing a unit once it gains a real ability', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['targeted-for-removal'],
                        groundArena: ['rex#outserved-his-purpose', 'battlefield-marine']
                    }
                });

                const { context } = contextRef;

                // Battlefield Marine is printed 3/3, buffed to 4/4 by Rex
                expect(context.battlefieldMarine.getPower()).toBe(4);
                expect(context.battlefieldMarine.getHp()).toBe(4);

                // Attach Targeted for Removal, which grants Battlefield Marine a When Defeated
                // ability but has no power/HP modifier of its own
                context.player1.clickCard(context.targetedForRemoval);
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine now has an ability, so Rex's bonus no longer applies
                expect(context.battlefieldMarine.getPower()).toBe(3);
                expect(context.battlefieldMarine.getHp()).toBe(3);
            });
        });
    });
});
