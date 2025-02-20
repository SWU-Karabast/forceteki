describe('Bounty', function() {
    integration(function(contextRef) {
        describe('When a unit with a Bounty ability', function() {
            it('is defeated by the opponent, the ability should resolve under the opponent\'s control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hylobon-enforcer']
                    },
                    player2: {
                        groundArena: ['wampa']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.hylobonEnforcer);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player2.clickPrompt('Collect Bounty: Draw a card');

                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('gained from an effect is defeated, the ability should resolve under the opponent\'s control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['top-target'] },
                            { card: 'atst', damage: 5 }
                        ]
                    },
                    player2: {
                        groundArena: ['wampa']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.wampa);

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.wampa, context.atst]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.atst);
                expect(context.atst.damage).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('is defeated by the controller, the ability should resolve under the opponent\'s control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['vanquish'],
                        groundArena: ['hylobon-enforcer']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.clickCard(context.vanquish);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player2.clickPrompt('Collect Bounty: Draw a card');

                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(1);
                expect(context.player2).toBeActivePlayer();
            });

            it('is captured, the ability should resolve under the opponent\'s control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['hylobon-enforcer']
                    },
                    player2: {
                        hand: ['discerning-veteran']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.passAction();

                // capture Hylobon Enforced with Discerning Veteran
                context.player2.clickCard(context.discerningVeteran);
                expect(context.hylobonEnforcer).toBeCapturedBy(context.discerningVeteran);

                expect(context.player2).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player2.clickPrompt('Collect Bounty: Draw a card');

                expect(context.player1.handSize).toBe(0);
                expect(context.player2.handSize).toBe(1);

                expect(context.player1).toBeActivePlayer();
            });

            it('gained from an effect is captured, the ability should resolve under the opponent\'s control', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            { card: 'battlefield-marine', upgrades: ['top-target'] },
                            { card: 'atst', damage: 5 }
                        ]
                    },
                    player2: {
                        hand: ['discerning-veteran']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                context.player1.passAction();

                // capture Battlefield Marine with Discerning Veteran
                context.player2.clickCard(context.discerningVeteran);
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeCapturedBy(context.discerningVeteran);
                expect(context.topTarget).toBeInZone('discard');

                expect(context.player2).toBeAbleToSelectExactly([context.p1Base, context.p2Base, context.discerningVeteran, context.atst]);
                expect(context.player2).toHavePassAbilityButton();
                context.player2.clickCard(context.atst);
                expect(context.atst.damage).toBe(1);

                expect(context.player1).toBeActivePlayer();
            });

            it('is on the field, it should be targetable by abilities filtering for Bounty', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['covetous-rivals', 'waylay'],
                        groundArena: ['fugitive-wookiee', 'battlefield-marine', { card: 'atst', upgrades: ['wanted'] }]
                    },
                    player2: {
                        groundArena: ['wampa', 'hylobon-enforcer'],
                        spaceArena: ['cartel-turncoat']
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;

                // can target both printed and gained Bounty
                context.player1.clickCard(context.covetousRivals);
                expect(context.player1).toBeAbleToSelectExactly([context.fugitiveWookiee, context.hylobonEnforcer, context.cartelTurncoat, context.atst]);

                context.player1.clickCard(context.cartelTurncoat);
                expect(context.cartelTurncoat.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();

                context.player2.passAction();
                context.covetousRivals.exhausted = false;
            });

            it('leaves play it should not trigger the bounty twice', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['waylay'],
                        groundArena: [{ card: 'atst', upgrades: ['top-target'] }]
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer'],
                        hand: ['waylay'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                const { context } = contextRef;
                context.firstWaylay = context.player1.hand[0];
                context.secondWaylay = context.player2.hand[0];

                // check that the bounty isn't triggered when removed from play
                context.player1.clickCard(context.firstWaylay);
                context.player1.clickCard(context.hylobonEnforcer);

                // return atst to hand without collecting bounty
                expect(context.player2).toBeActivePlayer();
                context.player2.clickCard(context.secondWaylay);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger twice when removed from play', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['waylay'],
                        groundArena: ['atst']
                    },
                    player2: {
                        groundArena: ['hylobon-enforcer'],
                    },

                    // IMPORTANT: this is here for backwards compatibility of older tests, don't use in new code
                    autoSingleTarget: true
                });

                // We now defeat it to check it doesn't trigger twice.
                const { context } = contextRef;
                context.player1.clickCard(context.waylay);
                context.player1.clickCard(context.hylobonEnforcer);

                context.player2.clickCard(context.hylobonEnforcer);
                context.player1.clickCard(context.atst);
                context.player1.clickCard(context.hylobonEnforcer);

                expect(context.player1).toHavePassAbilityPrompt('Collect Bounty: Draw a card');
                context.player1.clickPrompt('Collect Bounty: Draw a card');

                expect(context.player1.handSize).toBe(1);
                expect(context.player2.handSize).toBe(0);
                expect(context.player2).toBeActivePlayer();
            });

            it('deals damage, the damage is attributed to the unit with the Bounty ability', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['takedown'],
                        groundArena: [
                            'val#loyal-to-the-end',
                            'atst'
                        ],
                        leader: 'jango-fett#concealing-the-conspiracy',
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: [
                            'val#loyal-to-the-end',
                            'consular-security-force',
                        ],
                    }
                });

                const { context } = contextRef;
                const p1Val = context.player1.findCardByName('val#loyal-to-the-end');
                const p2Val = context.player2.findCardByName('val#loyal-to-the-end');
                const p1Takedown = context.player1.findCardByName('takedown');
                const p2Takedown = context.player2.findCardByName('takedown');

                // CASE 1: P2's val is defeated, and bounty damage is dealt to another P2 unit
                //   Jango's ability does not trigger because the damage is not dealt by a friendly unit

                context.player1.clickCard(p1Takedown);
                context.player1.clickCard(p2Val);

                // Resolve bounty first
                context.player1.clickPrompt('You');
                context.player1.clickCard(context.consularSecurityForce);

                // Jango does not trigger
                expect(context.player1).not.toHavePassAbilityPrompt('Exhaust this leader');

                // Opponent resolves Experience tokens
                context.player2.clickCard(context.consularSecurityForce);

                // CASE 2: P1's Val is defeated, and bounty damage is dealt to a unit conrolled by P2
                //   Jango's ability triggers because the damage is dealt by a friendly unit

                context.player2.clickCard(p2Takedown);
                context.player2.clickCard(p1Val);

                // Resolve Experience tokens first
                context.player2.clickPrompt('Opponent');
                context.player1.clickCard(context.atst);

                // Resolve bounty
                context.player2.clickCard(context.consularSecurityForce);

                // Jango triggers
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');

                expect(context.consularSecurityForce.exhausted).toBe(true);
                expect(context.jangoFett.exhausted).toBe(true);
            });

            it('changes control, the bounty is still collected by the opposing player', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['change-of-heart'],
                        groundArena: [
                            'atst'
                        ],
                        leader: 'jango-fett#concealing-the-conspiracy',
                    },
                    player2: {
                        hand: ['takedown'],
                        groundArena: [
                            'val#loyal-to-the-end',
                            'consular-security-force',
                        ],
                    }
                });

                const { context } = contextRef;

                // P1 steals Val
                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.valLoyalToTheEnd);

                // P2 defeats Val using Takedown
                context.player2.clickCard(context.takedown);
                context.player2.clickCard(context.valLoyalToTheEnd);

                // Resolve Experience tokens first
                context.player2.clickPrompt('Opponent');
                context.player1.clickCard(context.atst);

                // P2 collects bounty and damages own unit
                context.player2.clickCard(context.consularSecurityForce);

                // Jango triggers
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader');
                context.player1.clickPrompt('Exhaust this leader');

                expect(context.consularSecurityForce.exhausted).toBe(true);
                expect(context.jangoFett.exhausted).toBe(true);
            });
        });
    });
});
