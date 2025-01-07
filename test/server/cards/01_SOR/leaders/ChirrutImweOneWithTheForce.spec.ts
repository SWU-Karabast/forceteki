describe('Chirrut Îmwe, One with the Force', function() {
    integration(function(contextRef) {
        it('Chirrut\'s undeployed ability', function() {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    leader: 'chirrut-imwe#one-with-the-force',
                    groundArena: ['death-star-stormtrooper'],
                    resources: 4
                },
                player2: {
                    spaceArena: ['tieln-fighter'],
                    hand: ['daring-raid']
                }
            });

            const { context } = contextRef;

            // apply +2/+2 effect to Death Star Stormtrooper
            context.player1.clickCard(context.chirrutImwe);
            expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.tielnFighter]);
            context.player1.clickCard(context.deathStarStormtrooper);

            expect(context.deathStarStormtrooper.getPower()).toBe(3);
            expect(context.deathStarStormtrooper.getHp()).toBe(3);
            expect(context.tielnFighter.getPower()).toBe(2);
            expect(context.tielnFighter.getHp()).toBe(1);
            expect(context.chirrutImwe.exhausted).toBeTrue();

            // deal 2 damage to stormtrooper so it will be defeated when the effect expires
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.deathStarStormtrooper);

            // give the +2 effect to the TIE/LN Fighter as well
            context.chirrutImwe.exhausted = false;
            context.player1.clickCard(context.chirrutImwe);
            expect(context.player1).toBeAbleToSelectExactly([context.deathStarStormtrooper, context.tielnFighter]);
            context.player1.clickCard(context.tielnFighter);

            expect(context.deathStarStormtrooper.getPower()).toBe(3);
            expect(context.deathStarStormtrooper.getHp()).toBe(3);
            expect(context.tielnFighter.getPower()).toBe(2);
            expect(context.tielnFighter.getHp()).toBe(3);
            expect(context.chirrutImwe.exhausted).toBeTrue();

            // move to regroup phase, confirm effects have expired
            context.moveToRegroupPhase();
            expect(context.deathStarStormtrooper).toBeInZone('discard');
            expect(context.tielnFighter.getPower()).toBe(2);
            expect(context.tielnFighter.getHp()).toBe(1);
        });

        describe('Chirrut\'s deployed ability', function() {
            it('prevents him from being defeated by damage during the action phase', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['repair'],
                        leader: { card: 'chirrut-imwe#one-with-the-force', deployed: true }
                    },
                    player2: {
                        groundArena: ['mercenary-company'],
                        hand: ['daring-raid']
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

            it('prevents him from being defeated by HP reduction effects during the action phase', function () {
                contextRef.setupTest({
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

                // TODO: once Luke is implemented, try his effect to send Chirrut max HP below 0 and confirm he still survives
            });
        });
    });
});
