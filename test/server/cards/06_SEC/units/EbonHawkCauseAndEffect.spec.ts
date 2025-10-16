describe('Ebon Hawk, Cause and Effect', function() {
    integration(function(contextRef) {
        describe('Ebon Hawk\'s on-attack ability', function() {
            const prompt = 'Disclose Heroism to give this unit +2/+0 and/or Villainy to give the defending unit -4/-0 for this attack';

            it('gives Ebon Hawk +2/+0 and the defending unit -4/-0 if both Heroism and Villainy are disclosed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'medal-ceremony',       // Heroism
                            'super-battle-droid',   // Villainy
                            'battlefield-marine',   // Command | Heroism
                            'wampa',                // Aggression
                            'restock',              // [No aspects]
                            'isb-agent'             // Cunning | Villainy
                        ],
                        spaceArena: [
                            'ebon-hawk#cause-and-effect' // Base stats 3/3
                        ],
                    },
                    player2: {
                        spaceArena: [
                            'munificent-frigate' // Base stats 4/7
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack Munificent Frigate with Ebon Hawk
                context.player1.clickCard(context.ebonHawk);
                context.player1.clickCard(context.munificentFrigate);

                // Prompt to disclose Heroism and/or Villainy
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHaveEnabledPromptButton('Choose nothing');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.medalCeremony,
                    context.superBattleDroid,
                    context.battlefieldMarine,
                    context.isbAgent
                ]);

                // Choose Heroism card
                context.player1.clickCard(context.medalCeremony);

                // Done button is enabled after disclosing at least one aspect
                expect(context.player1).toHaveEnabledPromptButton('Done');
                expect(context.player1).toBeAbleToSelectExactly([
                    // Heroism is satisfied, only Villainy cards are selectable now
                    context.superBattleDroid,
                    context.isbAgent,
                    context.medalCeremony, // Avalable for deselection
                ]);

                // Choose Villainy card
                context.player1.clickCard(context.superBattleDroid);
                context.player1.clickPrompt('Done');

                // Cards are revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([
                    context.medalCeremony,
                    context.superBattleDroid
                ]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Attack is resolved
                expect(context.ebonHawk.damage).toBe(0);
                expect(context.munificentFrigate.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('gives Ebon Hawk +2/+0 for the attack if Heroism is disclosed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'medal-ceremony',
                            'super-battle-droid',
                            'wampa',
                            'restock'
                        ],
                        spaceArena: [
                            'ebon-hawk#cause-and-effect' // Base stats 3/3
                        ],
                    },
                    player2: {
                        spaceArena: [
                            'graceful-purrgil' // Base stats 2/7
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack Graceful Purrgil with Ebon Hawk
                context.player1.clickCard(context.ebonHawk);
                context.player1.clickCard(context.gracefulPurrgil);

                // Prompt to disclose Heroism and/or Villainy
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.medalCeremony,
                    context.superBattleDroid
                ]);

                // Choose Heroism card only
                context.player1.clickCard(context.medalCeremony);
                context.player1.clickPrompt('Done');

                // Card is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.medalCeremony]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Attack is resolved
                expect(context.ebonHawk.damage).toBe(2);
                expect(context.gracefulPurrgil.damage).toBe(5);
                expect(context.player2).toBeActivePlayer();
            });

            it('gives the defending unit -4/-0 for the attack if Villainy is disclosed', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'medal-ceremony',
                            'super-battle-droid',
                            'wampa',
                            'restock'
                        ],
                        spaceArena: [
                            'ebon-hawk#cause-and-effect'
                        ],
                    },
                    player2: {
                        spaceArena: [
                            'munificent-frigate'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack Munificent Frigate with Ebon Hawk
                context.player1.clickCard(context.ebonHawk);
                context.player1.clickCard(context.munificentFrigate);

                // Prompt to disclose Heroism and/or Villainy
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.medalCeremony,
                    context.superBattleDroid
                ]);

                // Choose Villainy card only
                context.player1.clickCard(context.superBattleDroid);
                context.player1.clickPrompt('Done');

                // Card is revealed to the opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.superBattleDroid]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Attack is resolved
                expect(context.ebonHawk.damage).toBe(0);
                expect(context.munificentFrigate.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('does not buff or debuff if the player chooses to disclose nothing', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'medal-ceremony',
                            'super-battle-droid',
                            'wampa'
                        ],
                        spaceArena: [
                            'ebon-hawk#cause-and-effect'
                        ],
                    },
                    player2: {
                        spaceArena: [
                            'graceful-purrgil'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack Graceful Purrgil with Ebon Hawk
                context.player1.clickCard(context.ebonHawk);
                context.player1.clickCard(context.gracefulPurrgil);

                // Prompt to disclose Heroism and/or Villainy
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toBeAbleToSelectExactly([
                    context.medalCeremony,
                    context.superBattleDroid
                ]);

                // Choose nothing
                context.player1.clickPrompt('Choose nothing');

                // Attack is resolved
                expect(context.ebonHawk.damage).toBe(2);
                expect(context.gracefulPurrgil.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });

            it('is automatically skipped if the player has no Heroism or Villainy cards in hand', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: [
                            'wampa',
                            'restock'
                        ],
                        spaceArena: [
                            'ebon-hawk#cause-and-effect'
                        ],
                    },
                    player2: {
                        spaceArena: [
                            'graceful-purrgil'
                        ]
                    }
                });

                const { context } = contextRef;

                // Attack Graceful Purrgil with Ebon Hawk
                context.player1.clickCard(context.ebonHawk);
                context.player1.clickCard(context.gracefulPurrgil);

                // Attack resolves immediately
                expect(context.ebonHawk.damage).toBe(2);
                expect(context.gracefulPurrgil.damage).toBe(3);
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});