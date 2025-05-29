describe('Mercenary Gunship', function() {
    integration(function(contextRef) {
        describe('Mercenary Gunship\'s ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        spaceArena: ['mercenary-gunship'],
                    }
                });
            });

            it('can be taken control of by either player', function () {
                const { context } = contextRef;

                const p1Resources = context.player1.readyResourceCount;
                const p2Resources = context.player1.readyResourceCount;

                // Check that both players can select it
                expect(context.player1).toBeAbleToSelectExactly([context.mercenaryGunship, context.player1.findCardByName('darth-vader#dark-lord-of-the-sith')]);
                context.player1.passAction();
                expect(context.player2).toBeAbleToSelectExactly([context.mercenaryGunship, context.player2.findCardByName('luke-skywalker#faithful-friend')]);

                // Check that Player 2 can take control
                context.player2.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player2);
                expect(context.player2.readyResourceCount).toBe(p2Resources - 4);

                // Check that Player 1 can take control back
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 4);

                context.player2.passAction();

                // Check that Player 1 can take control even if player 1 already has control
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Take control of this unit']);
                context.player1.clickPrompt('Take control of this unit');
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player1);
                expect(context.player1.readyResourceCount).toBe(p1Resources - 8);

                context.player2.passAction();

                // Check that Player 2 can take control even if the unit is exhausted
                context.player1.clickCard(context.mercenaryGunship);
                expect(context.player1).toHaveEnabledPromptButtons(['Attack', 'Take control of this unit']);
                context.player1.clickPrompt('Attack');
                context.player1.clickCard(context.p2Base);

                context.player2.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player2);
                expect(context.player2.readyResourceCount).toBe(p1Resources - 8);
            });
        });

        describe('Mercenary Gunship\'s interaction with Pilot leaders', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'darth-vader#victor-squadron-leader',
                        base: 'mos-eisley',
                        spaceArena: ['mercenary-gunship'],
                    },
                    player2: {
                        leader: 'kazuda-xiono#best-pilot-in-the-galaxy'
                    }
                });
            });

            it('if it becomes a leader unit due to piloting, it gets defeated inead of changing control', function () {
                const { context } = contextRef;

                // Player 1 deploys Darth Vader to pilot the Mercenary Gunship
                context.player1.clickCard(context.darthVader);
                context.player1.clickPrompt('Deploy Darth Vader as a Pilot');
                context.player1.clickCard(context.mercenaryGunship);

                expect(context.mercenaryGunship).toHaveExactUpgradeNames(['darth-vader#victor-squadron-leader']);
                expect(context.mercenaryGunship.isLeader()).toBeTrue();

                // Player 2 uses Mercenary Gunship's ability to take control
                context.player2.clickCard(context.mercenaryGunship);

                // Mercenary Gunship is defeated instead of changing control
                expect(context.mercenaryGunship).toBeInZone('discard', context.player1);
                expect(context.darthVader).toBeInZone('base', context.player1);
                expect(context.darthVader.exhausted).toBeTrue();
            });

            it('if it changes control, then becomes a leader unit, it gets defeated the next time its ability is used', function () {
                const { context } = contextRef;
                context.player1.passAction();

                // Player 2 uses Mercenary Gunship's ability to take control
                context.player2.clickCard(context.mercenaryGunship);
                expect(context.mercenaryGunship).toBeInZone('spaceArena', context.player2);

                context.player1.passAction();

                // Player 2 deploys Kazuda Xiono to pilot the Mercenary Gunship
                context.player2.clickCard(context.kazudaXiono);
                context.player2.clickPrompt('Deploy Kazuda Xiono as a Pilot');
                context.player2.clickCard(context.mercenaryGunship);

                expect(context.mercenaryGunship).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
                expect(context.mercenaryGunship.isLeader()).toBeTrue();

                // Player 1 uses Mercenary Gunship's ability to take control
                context.player1.clickCard(context.mercenaryGunship);

                // Mercenary Gunship is defeated instead of changing control
                expect(context.mercenaryGunship).toBeInZone('discard', context.player1);
                expect(context.kazudaXiono).toBeInZone('base', context.player2);
                expect(context.kazudaXiono.exhausted).toBeTrue();
            });
        });
    });
});
