describe('Chirrut Îmwe, One with the Force', function() {
    integration(function(contextRef) {
        describe('Chirrut\'s undeployed ability', function() {
            beforeEach(function() {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'chirrut-imwe#one-with-the-force',
                        groundArena: ['death-star-stormtrooper'],
                        resources: 4
                    },
                    player2: {
                        hand: ['daring-raid'],
                        spaceArena: ['tieln-fighter'],
                    }
                });
            });

            it('should give +0/+2 to unit for the phase (can die at the end of phase if unit takes more damage than printed hp)', function() {
                const { context } = contextRef;

                // apply +0/+2 effect to Death Star Stormtrooper
                context.player1.clickCard(context.chirrutImwe);
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.tielnFighter]);
                context.player1.clickCard(context.deathStarStormtrooper);

                expect(context.deathStarStormtrooper.getPower()).toBe(3);
                expect(context.deathStarStormtrooper.getHp()).toBe(3);
                expect(context.chirrutImwe.exhausted).toBeTrue();

                // deal 2 damage to stormtrooper so it will be defeated when the effect expires
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.deathStarStormtrooper);

                // move to regroup phase, confirm effects have expired
                context.moveToRegroupPhase();
                expect(context.deathStarStormtrooper).toBeInZone('discard');
            });

            it('should give +0/+2 to unit for the phase (enemy unit)', function () {
                const { context } = contextRef;

                // apply +0/+2 effect to Tie/LN Fighter
                context.player1.clickCard(context.chirrutImwe);
                expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.tielnFighter]);
                context.player1.clickCard(context.tielnFighter);

                expect(context.tielnFighter.getPower()).toBe(2);
                expect(context.tielnFighter.getHp()).toBe(3);
                expect(context.chirrutImwe.exhausted).toBeTrue();

                // move to regroup phase, confirm effects have expired
                context.moveToRegroupPhase();
                expect(context.tielnFighter.getPower()).toBe(2);
                expect(context.tielnFighter.getHp()).toBe(1);
            });
        });

        describe('Chirrut\'s deployed ability', function() {
            it('prevents him from being defeated by damage during the action phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        hand: ['daring-raid'],
                        groundArena: ['mercenary-company'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.mercenaryCompany);
                expect(context.chirrutImwe).toBeInZone('groundArena');
                expect(context.chirrutImwe.damage).toBe(5);

                // add some non-combat damage
                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.chirrutImwe);
                expect(context.chirrutImwe).toBeInZone('groundArena');
                expect(context.chirrutImwe.damage).toBe(7);

                // heal back down below max HP before the phase ends
                context.player1.clickCard(context.repair);
                context.player1.clickCard(context.chirrutImwe);
                expect(context.chirrutImwe).toBeInZone('groundArena');
                expect(context.chirrutImwe.damage).toBe(4);

                context.moveToNextActionPhase();
                expect(context.chirrutImwe).toBeInZone('groundArena');

                context.player1.passAction();

                // attack Mercenary Company into Chirrut, overwhelm should not happen
                context.player2.clickCard(context.mercenaryCompany);
                context.player2.clickCard(context.chirrutImwe);
                expect(context.chirrutImwe).toBeInZone('groundArena');
                expect(context.chirrutImwe.damage).toBe(9);
                expect(context.p1Base.damage).toBe(0);

                // Chirrut is defeated at the end of the phase
                context.moveToRegroupPhase();
                expect(context.chirrutImwe).toBeInZone('base');
            });

            it('prevents him from being defeated by HP reduction effects during the action phase', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        groundArena: ['escort-skiff'],
                        hand: ['make-an-opening', 'supreme-leader-snoke#shadow-ruler']
                    }
                });

                const { context } = contextRef;

                // deal 4 damage to Chirrut
                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.escortSkiff);

                // apply -2/-2 for the phase
                context.player2.clickCard(context.makeAnOpening);
                context.player2.clickCard(context.chirrutImwe);

                // Chirrut should survive because the -2/-2 effect expires in the same window as his prevention effect
                context.moveToNextActionPhase();
                expect(context.chirrutImwe).toBeInZone('groundArena');

                // deal 4 damage to Chirrut
                context.player1.clickCard(context.chirrutImwe);
                context.player1.clickCard(context.escortSkiff);

                // apply permanent -2/-2 with Snoke
                context.player2.clickCard(context.supremeLeaderSnokeShadowRuler);

                // Chirrut is defeated at the end of the phase
                context.moveToRegroupPhase();
                expect(context.chirrutImwe).toBeInZone('base');
            });

            it('prevents him from being defeated by HP reduction effects during the action phase (-6-/-6 from luke skywalker)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        hand: ['luke-skywalker#jedi-knight'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;
                context.player1.clickCard(context.takedown);
                context.player1.clickCard(context.battlefieldMarine);

                context.player2.clickCard(context.lukeSkywalker);
                context.player2.clickCard(context.chirrutImwe);

                expect(context.chirrutImwe).toBeInZone('groundArena');
                expect(context.chirrutImwe.getPower()).toBe(0);
                expect(context.chirrutImwe.getHp()).toBe(0);

                context.moveToRegroupPhase();
                expect(context.chirrutImwe).toBeInZone('groundArena');
                expect(context.chirrutImwe.getPower()).toBe(3);
                expect(context.chirrutImwe.getHp()).toBe(5);
            });
        });
    });
});
