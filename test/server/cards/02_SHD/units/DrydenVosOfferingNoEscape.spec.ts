describe('Dryden Voss, Offering No Escape', function() {
    integration(function(contextRef) {
        describe('Dryden Voss\'s when played ability', function() {
            it('should choose a captured card guarded by a unit you control. You may play it for free under your control, and its when played ability will trigger', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'take-captive', 'i-have-the-high-ground'],
                        groundArena: ['atst', 'swoop-racer'],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        hand: ['take-captive', 'waylay'],
                        groundArena: ['wampa', 'reckless-gunslinger'],
                        spaceArena: ['tieln-fighter', 'hwk290-freighter']
                    }
                });

                const { context } = contextRef;

                const player1TakeCaptive = context.player1.hand[1];
                const player2TakeCaptive = context.player2.hand[0];

                // Use take-captive to set up a captured card for player 1
                context.player1.clickCard(player1TakeCaptive);
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.recklessGunslinger]);
                context.player1.clickCard(context.recklessGunslinger);

                expect(context.player1.exhaustedResourceCount).toBe(3);

                const previousExhaustedResourceCount = context.player1.exhaustedResourceCount;

                // Use take-captive to set up a captured card for player 2
                // to make sure that unit is not selectable by player1
                context.player2.clickCard(player2TakeCaptive);
                context.player2.clickCard(context.wampa);
                expect(context.player2).toBeAbleToSelectExactly([context.atst, context.swoopRacer]);
                context.player2.clickCard(context.swoopRacer);

                context.player1.clickCard(context.drydenVosOfferingNoEscape);
                context.player1.clickPrompt('Shielded');
                expect(context.drydenVosOfferingNoEscape).toHaveExactUpgradeNames(['shield']);

                // Now selecting the captured card -- ensure it doesn't see an opponent's captured card
                expect(context.player1).toBeAbleToSelectExactly([context.recklessGunslinger]);
                context.player1.clickCard(context.recklessGunslinger);

                expect(context.player1.exhaustedResourceCount).toBe(previousExhaustedResourceCount + 7); // the captured card should play for free (only +7 for dryden)

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

            it('should choose ONE of the captured cards guarded by a unit you control. You may play it for free under your control, and its when-defeated ability should trigger when defeated', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'take-captive', 'take-captive'],
                        spaceArena: ['green-squadron-awing'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        hand: ['open-fire'],
                        spaceArena: ['tieln-fighter', 'star-wing-scout']
                    }
                });

                const { context } = contextRef;

                const takeCaptive1 = context.player1.hand[1];
                const takeCaptive2 = context.player1.hand[2];

                // Setting up two captured cards
                context.player1.clickCard(takeCaptive1);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.starWingScout]);
                context.player1.clickCard(context.tielnFighter);

                context.player2.passAction();

                // Use take-captive to set up a captured card for player 1
                context.player1.clickCard(takeCaptive2);
                context.player1.clickCard(context.greenSquadronAwing);
                expect(context.player1).toBeAbleToSelectExactly([context.starWingScout]);
                context.player1.clickCard(context.starWingScout);

                // Now test space arena, and multiple captured cards under one guard
                context.player1.readyResources(20);

                context.player2.passAction();

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

            it('should choose a captured cards guarded by a unit you control. You may play it for free under your control, and its constant ability should operate', function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['dryden-vos#offering-no-escape', 'take-captive'],
                        spaceArena: ['green-squadron-awing'],
                        groundArena: ['atst'],
                        leader: 'jabba-the-hutt#his-high-exaltedness',
                        base: 'jabbas-palace'
                    },
                    player2: {
                        groundArena: ['general-dodonna#massassi-group-commander'],
                    }
                });

                const { context } = contextRef;

                // Setting up two captured cards
                context.player1.clickCard(context.takeCaptive);
                context.player1.clickCard(context.atst);
                expect(context.player1).toBeAbleToSelectExactly([context.generalDodonnaMassassiGroupCommander]);
                context.player1.clickCard(context.generalDodonnaMassassiGroupCommander);

                context.player2.passAction();

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

