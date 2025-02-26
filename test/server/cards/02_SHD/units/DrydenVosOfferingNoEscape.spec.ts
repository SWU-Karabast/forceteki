describe('Dryden Voss, Offering No Escape', function() {
    integration(function(contextRef) {
        describe('Dryden Voss\'s when played ability', function() {
            it('should choose a captured card guarded by a unit you control. You may play it for free under your control, and its when played ability will trigger', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'i-have-the-high-ground'],
                        groundArena: [{ card: 'atst', capturedUnits: ['reckless-gunslinger'] }],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        hand: ['waylay'],
                        groundArena: [{ card: 'wampa', capturedUnits: ['swoop-racer'] }],
                        spaceArena: ['tieln-fighter', 'hwk290-freighter']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.drydenVosOfferingNoEscape);
                context.player1.clickPrompt('Shielded');
                expect(context.drydenVosOfferingNoEscape).toHaveExactUpgradeNames(['shield']);

                // Now selecting the captured card -- ensure it doesn't see an opponent's captured card
                expect(context.player1).toBeAbleToSelectExactly([context.recklessGunslinger]);
                context.player1.clickCard(context.recklessGunslinger);

                expect(context.player1.exhaustedResourceCount).toBe(7); // the captured card should play for free (only +7 for dryden)

                // Confirm that reckless-gunslinger triggered its when played ability
                expect(context.p1Base.damage).toBe(1);
                expect(context.p2Base.damage).toBe(1);

                context.player2.passAction();

                // Verify the reckless gunslinger is now under player 1's control
                // Can use the 'friendly feature' of I have the high ground to confirm
                context.player1.clickCard(context.iHaveTheHighGround);
                expect(context.player1).toBeAbleToSelectExactly([context.atst, context.drydenVosOfferingNoEscape, context.recklessGunslinger, context.greenSquadronAwing]);
                context.player1.clickCard(context.recklessGunslinger);
            });

            it('should choose ONE of the captured cards guarded by a unit you control. You may play it for free under your control, and its when-defeated ability should trigger when defeated', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape'],
                        spaceArena: [{ card: 'green-squadron-awing', capturedUnits: ['tieln-fighter', 'star-wing-scout'] }],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        hand: ['open-fire'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.drydenVosOfferingNoEscape);
                context.player1.clickPrompt('Shielded');
                expect(context.drydenVosOfferingNoEscape).toHaveExactUpgradeNames(['shield']);

                // Now selecting the captured card -- ensure it doesn't see an opponent's captured card
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.starWingScout]);
                context.player1.clickCard(context.starWingScout);

                expect(context.player1.exhaustedResourceCount).toBe(7); // the captured card should play for free (only +7 for dryden)

                // Lets test that star wing's scout when defeated ability triggers for player1
                expect(context.player1.handSize).toBe(0);

                context.player2.clickCard(context.openFire);
                context.player2.clickCard(context.starWingScout);

                expect(context.starWingScout).toBeInZone('discard');

                expect(context.player1.handSize).toBe(2);
            });

            it('should choose a captured cards guarded by a unit you control. You may play it for free under your control, and its constant ability should operate', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape'],
                        spaceArena: ['green-squadron-awing'],
                        groundArena: [{ card: 'atst', capturedUnits: ['general-dodonna#massassi-group-commander'] }],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.drydenVosOfferingNoEscape);
                context.player1.clickPrompt('Shielded');
                expect(context.drydenVosOfferingNoEscape).toHaveExactUpgradeNames(['shield']);

                expect(context.player1).toBeAbleToSelectExactly([context.generalDodonnaMassassiGroupCommander]);
                context.player1.clickCard(context.generalDodonnaMassassiGroupCommander);

                context.player2.passAction();

                // Now test the constant ability of the captured card
                context.player1.clickCard(context.greenSquadronAwing);
                context.player1.clickCard(context.p2Base);

                // 1 for Awing, 2 for Raid 2, and 1 for captured Dodonna
                expect(context.p2Base.damage).toBe(4);
            });
        });
    });
});

