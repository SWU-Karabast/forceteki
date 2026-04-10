describe('Support keyword', function() {
    integration(function(contextRef) {
        describe('When a unit with the Support keyword is played', function() {
            it('and there are no other units in play, the ability does nothing', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#the-force-is-all-i-need']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);

                // No other units in play, so Support does nothing
                expect(context.player2).toBeActivePlayer();
            });

            it('and all other friendly units are exhausted, the ability does nothing', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#the-force-is-all-i-need'],
                        groundArena: [
                            { card: 'wampa', exhausted: true },
                            { card: 'battlefield-marine', exhausted: true }
                        ]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);

                // All units are exhausted, so Support does nothing
                expect(context.player2).toBeActivePlayer();
            });

            it('it allows the player to attack with another unit which gains the source unit\'s abilities for the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#the-force-is-all-i-need'],
                        groundArena: [{ card: 'battlefield-marine', upgrades: ['experience'] }]
                    },
                    player2: {
                        groundArena: ['imperial-dark-trooper']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);

                // Support prompt shows available attackers directly
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);

                // Battlefield Marine attacks base so we can verify the gained On Attack ability separately
                context.player1.clickCard(context.p2Base);

                // Battlefield Marine gained Ezra's On Attack ability (give a unit -3/-0 for the phase)
                // Since Battlefield Marine is upgraded, the ability triggers
                expect(context.player1).toHavePassAbilityPrompt('Give a unit -3/-0 for the phase');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toBeAbleToSelectExactly([
                    context.ezraBridger,
                    context.battlefieldMarine,
                    context.imperialDarkTrooper,
                ]);
                context.player1.clickCard(context.imperialDarkTrooper);

                // Imperial Dark Trooper should have -3 power for the phase
                expect(context.imperialDarkTrooper.getPower()).toBe(0);
                expect(context.imperialDarkTrooper.getHp()).toBe(3);

                // Battlefield Marine (4 power with experience) attacked base
                expect(context.p2Base.damage).toBe(4);
                expect(context.player2).toBeActivePlayer();
            });

            it('and the player passes, the effect is skipped', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#the-force-is-all-i-need'],
                        groundArena: ['battlefield-marine']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.ezraBridger);

                // Player declines the Support attack
                context.player1.clickPrompt('Pass');

                expect(context.player2).toBeActivePlayer();
                expect(context.p2Base.damage).toBe(0);
            });
        });

        describe('When the Support unit gains keywords from another source', function() {
            it('the Support target gains Overwhelm for the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#the-force-is-all-i-need', 'overpower'],
                        groundArena: ['knight-of-ren'],
                        spaceArena: ['the-ghost#heart-of-the-family']
                    },
                    player2: {
                        groundArena: ['imperial-dark-trooper']
                    }
                });

                const { context } = contextRef;

                // Play Overpower on The Ghost to give it Overwhelm for the phase
                context.player1.clickCard(context.overpower);
                context.player1.clickCard(context.theGhost);
                context.player2.passAction();

                // Play Ezra, The Ghost shares Overwhelm with Ezra, Support grants it to the attacker
                context.player1.clickCard(context.ezraBridger);

                // Select Knight of Ren to attack with
                expect(context.player1).toBeAbleToSelectExactly([context.knightOfRen, context.theGhost]);
                context.player1.clickCard(context.knightOfRen);
                context.player1.clickCard(context.imperialDarkTrooper);

                // Imperial Dark Trooper is defeated and 1 damage overwhelms through to the base
                expect(context.knightOfRen.damage).toBe(3);
                expect(context.imperialDarkTrooper).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(1);
            });

            it('the Support target gains Restore for the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: { card: 'chopper-base', damage: 5 },
                        hand: ['ezra-bridger#the-force-is-all-i-need'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: [{ card: 'the-ghost#heart-of-the-family', upgrades: ['devotion'] }]
                    }
                });

                const { context } = contextRef;

                // Play Ezra, The Ghost shares Restore 2 with Ezra, Support grants it to the attacker
                context.player1.clickCard(context.ezraBridger);

                // Select Battlefield Marine to attack with
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.theGhost]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Two on-attack abilities trigger: Ezra's (no effect since Wampa is not upgraded) and Restore 2
                context.player1.clickPrompt('Restore 2');

                // Battlefield Marine should have healed 2 damage from base via Restore 2
                expect(context.p1Base.damage).toBe(3); // Healed 2
                expect(context.p2Base.damage).toBe(3); // Dealt 3
            });

            it('the Support target gains Raid from multiple sources', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#the-force-is-all-i-need'],
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['the-ghost#heart-of-the-family', 'red-three#unstoppable']
                    }
                });

                const { context } = contextRef;

                // Play Ezra
                context.player1.clickCard(context.ezraBridger);

                // Select Battlefield Marine (3 power, Heroism)
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.theGhost, context.redThree]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.p2Base);

                // Battlefield Marine should gain Raid 3 (1 from Red Three, 2 from Ezra via Support)
                expect(context.p2Base.damage).toBe(6);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When the Support unit gains triggered abilities from another source', function() {
            it('the Support target gains the triggered ability for the attack', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['ezra-bridger#the-force-is-all-i-need'],
                        groundArena: ['battlefield-marine', 'general-krell#heartless-tactician'],
                        deck: ['confiscate', 'restock']
                    },
                    player2: {
                        groundArena: ['imperial-dark-trooper']
                    }
                });

                const { context } = contextRef;

                // Play Ezra, Support grants a second instance of Krell's When Defeated ability to the attacker
                context.player1.clickCard(context.ezraBridger);

                // Select Battlefield Marine to attack with
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.generalKrell]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.imperialDarkTrooper);
                expect(context.battlefieldMarine).toBeInZone('discard');

                // Since Battlefield Marine has 2 instances of Krell's When Defeated ability
                // the player should be prompted to choose which one to trigger when it is defeated
                expect(context.player1).toHavePrompt('Choose an ability to resolve:');
                expect(context.player1).toHaveExactPromptButtons(['Draw a card', 'Draw a card']);
                context.player1.clickPrompt('Draw a card');

                // Ability is optional, so we click trigger once for each instance of the ability
                context.player1.clickPrompt('Trigger');
                context.player1.clickPrompt('Trigger');

                // Both resolve, so the player should have drawn 2 cards
                expect(context.player1.hand.length).toBe(2);
                expect(context.confiscate).toBeInZone('hand');
                expect(context.restock).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});
