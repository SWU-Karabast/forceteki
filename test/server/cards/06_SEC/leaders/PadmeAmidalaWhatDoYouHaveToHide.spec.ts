describe('Padmé Amidala, What Do You Have To Hide?', function() {
    integration(function(contextRef) {
        describe('Leader side ability', function() {
            const prompt = 'Exhaust Padmé Amidala to deal 1 damage to a unit';

            it('when a card is revealed from hand, exhaust Padmé to deal 1 damage to a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: ['salvage', 'isb-agent'],
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player ISB Agent to reveal an event from hand
                context.player1.clickCard(context.isbAgent);
                expect(context.player1).toHavePrompt('Reveal an event from your hand. If you do, deal 1 damage to a unit');
                context.player1.clickCard(context.salvage);

                // Card is revealed to opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.salvage]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Deal 1 damage to a unit from ISB Agent's ability
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.consularSecurityForce.damage).toBe(1);

                // Padmé's ability triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Trigger');

                // All units are valid targets
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.isbAgent,
                    context.consularSecurityForce
                ]);

                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(2);
                expect(context.padmeAmidala.exhausted).toBe(true);
            });

            it('when a card is discarded from hand, exhaust Padmé to deal 1 damage to a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: ['battlefield-marine'],
                        groundArena: ['furtive-handmaiden']
                    },
                    player2: {
                        groundArena: ['consular-security-force'],
                    }
                });

                const { context } = contextRef;

                // Attack with Furtive Handmaiden to discard a card from hand
                context.player1.clickCard(context.furtiveHandmaiden);
                context.player1.clickCard(context.p2Base);

                // Discard Battlefield Marine from hand
                expect(context.player1).toHavePassAbilityPrompt('Discard a card from your hand. If you do, draw a card.');
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // Padmé's ability triggered
                expect(context.player1).toHavePassAbilityPrompt('Exhaust Padmé Amidala to deal 1 damage to a unit');
                context.player1.clickPrompt('Trigger');

                // All units are valid targets
                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.furtiveHandmaiden,
                    context.consularSecurityForce
                ]);

                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(1);
                expect(context.padmeAmidala.exhausted).toBe(true);
            });

            it('does not trigger when a card is revealed from the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        spaceArena: ['rickety-quadjumper'],
                        deck: ['furtive-handmaiden']
                    }
                });

                const { context } = contextRef;

                // Attack with Rickety Quadjumper to reveal a card from the deck
                context.player1.clickCard(context.ricketyQuadjumper);
                context.player1.clickCard(context.p2Base);

                // Reveal top card of deck
                expect(context.player1).toHavePassAbilityPrompt('Reveal a card. If it\'s not a unit, give an Experience token to another unit');
                context.player1.clickPrompt('Trigger');
                expect(context.player1).toHaveExactViewableDisplayPromptCards([context.furtiveHandmaiden]);
                expect(context.player1).toHaveEnabledPromptButton('Done');
                context.player1.clickDone();

                // Padmé's ability does not trigger, it is now Player 2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when a card is revealed and drawn from the deck simultaneously', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        groundArena: ['c3po#protocol-droid'],
                        deck: ['furtive-handmaiden']
                    }
                });

                const { context } = contextRef;

                // Attack with C-3PO to reveal a card from the deck
                context.player1.clickCard(context.c3po);
                context.player1.clickCard(context.p2Base);

                // Pick a number and reveal top card of deck
                context.player1.chooseListOption('1');
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.furtiveHandmaiden]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Reveal and Draw', 'Leave on Top']);
                context.player1.clickDisplayCardPromptButton(context.furtiveHandmaiden.uuid, 'reveal-draw');

                // Card is revealed to opponent and drawn
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.furtiveHandmaiden]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();
                expect(context.furtiveHandmaiden).toBeInZone('hand', context.player1);

                // Padmé's ability does not trigger, it is now Player 2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when a card is revealed from the resource zone', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide'
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['scanning-officer']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Scanning Officer to reveal 3 of Player 1's resources
                context.player2.clickCard(context.scanningOfficer);
                expect(context.player2).toHavePrompt('View cards for Scanning Officer ability');
                context.player2.clickPrompt('Done');

                // Padmé's ability does not trigger, it is now Player 1's turn
                expect(context.player1).toBeActivePlayer();
            });

            it('does not trigger for \'look at\' effects', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: ['furtive-handmaiden'],
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['viper-probe-droid'],
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Viper Probe Droid to look at Player 1's hand
                context.player2.clickCard(context.viperProbeDroid);
                expect(context.player2).toHavePrompt('View cards for Viper Probe Droid ability');
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.furtiveHandmaiden]);
                context.player2.clickPrompt('Done');

                // Padmé's ability does not trigger, it is now Player 1's turn
                expect(context.player1).toBeActivePlayer();
            });

            it('does not trigger when a card is discarded from the deck', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        deck: ['furtive-handmaiden'],
                        groundArena: ['greedo#slow-on-the-draw']
                    },
                    player2: {
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Attack with Greedo to defeat him and discard a card from the deck
                context.player1.clickCard(context.greedo);
                context.player1.clickCard(context.consularSecurityForce);
                expect(context.player1).toHavePassAbilityPrompt('Discard a card from your deck. If it\'s not a unit, deal 2 damage to a ground unit.');
                context.player1.clickPrompt('Trigger');

                // Padmé's ability does not trigger, it is now Player 2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('does not trigger when a card is discarded from the opponent\'s hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#what-do-you-have-to-hide', deployed: true },
                        hand: ['jam-communications']
                    },
                    player2: {
                        hand: ['no-bargain'],
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player 1 plays Jam Communications to make Player 2 discard a card from hand
                context.player1.clickCard(context.jamCommunications);
                context.player1.clickCardInDisplayCardPrompt(context.noBargain);
                expect(context.noBargain).toBeInZone('discard', context.player2);

                // Padmé's ability does not trigger, it is now Player 2's turn
                expect(context.player2).toBeActivePlayer();
            });

            it('works if cards are revealed from Disclose abilities', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: [
                            'command',
                            'c3po#protocol-droid',
                        ],
                        groundArena: ['mina-bonteri#stop-this-war'],
                    },
                    player2: {
                        groundArena: ['reinforcement-walker']
                    }
                });

                const { context } = contextRef;

                // Attack with Mina Bonteri to defeat her
                context.player1.clickCard(context.minaBonteri);
                context.player1.clickCard(context.reinforcementWalker);

                // Prompt to disclose required aspects
                expect(context.player1).toHavePrompt('Disclose Command, Command, Heroism to draw a card');
                expect(context.player1).toBeAbleToSelectExactly([
                    context.command,
                    context.c3poProtocolDroid
                ]);

                // // Disclose Command from hand
                context.player1.clickCard(context.command);
                context.player1.clickCard(context.c3poProtocolDroid);
                context.player1.clickPrompt('Done');

                // // Cards are revealed to opponent
                expect(context.player2).toHaveExactViewableDisplayPromptCards([
                    context.command,
                    context.c3poProtocolDroid
                ]);
                expect(context.player2).toHaveEnabledPromptButton('Done');
                context.player2.clickDone();

                // Padmé's ability triggered
                expect(context.player1).toHavePassAbilityPrompt('Exhaust Padmé Amidala to deal 1 damage to a unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.reinforcementWalker]);
                context.player1.clickCard(context.reinforcementWalker);

                expect(context.reinforcementWalker.damage).toBe(3); // 2 from Mina, 1 from Padmé
                expect(context.padmeAmidala.exhausted).toBe(true);
            });

            it('works if an opponent\'s card effect discards from your hand', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: ['battlefield-marine', 'furtive-handmaiden']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['spark-of-rebellion'],
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Spark of Rebellion to make Player 1 discard a card from hand
                context.player2.clickCard(context.sparkOfRebellion);
                expect(context.player2).toHaveExactSelectableDisplayPromptCards([context.battlefieldMarine, context.furtiveHandmaiden]);
                context.player2.clickCardInDisplayCardPrompt(context.battlefieldMarine);
                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                // Padmé's ability triggered
                expect(context.player1).toHavePassAbilityPrompt('Exhaust Padmé Amidala to deal 1 damage to a unit');
                context.player1.clickPrompt('Trigger');

                expect(context.player1).toHavePrompt('Deal 1 damage to a unit');
                expect(context.player1).toBeAbleToSelectExactly([context.consularSecurityForce]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(1);
                expect(context.padmeAmidala.exhausted).toBe(true);
            });

            it('can be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'padme-amidala#what-do-you-have-to-hide',
                        hand: ['furtive-handmaiden'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['no-bargain'],
                    }
                });

                const { context } = contextRef;

                // Player 2 plays No Bargain to make Player 1 discard a card from hand
                context.player2.clickCard(context.noBargain);
                context.player1.clickCard(context.furtiveHandmaiden);
                expect(context.furtiveHandmaiden).toBeInZone('discard', context.player1);

                // Padmé's ability triggered
                expect(context.player1).toHavePassAbilityPrompt(prompt);
                context.player1.clickPrompt('Pass');

                expect(context.battlefieldMarine.damage).toBe(0);
                expect(context.padmeAmidala.exhausted).toBe(false);
                expect(context.player1).toBeActivePlayer();
            });
        });

        describe('Unit side ability', function() {
            const prompt = 'Deal 1 damage to a unit';

            it('when a card is revealed from hand, deal 1 damage to a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#what-do-you-have-to-hide', deployed: true },
                        hand: ['battlefield-marine', 'furtive-handmaiden']
                    },
                    player2: {
                        hasInitiative: true,
                        spaceArena: ['chimaera#flagship-of-the-seventh-fleet']
                    }
                });

                const { context } = contextRef;

                // Player 2 attacks with Chimaera to reveal Player 1's hand
                context.player2.clickCard(context.chimaera);
                context.player2.clickCard(context.p1Base);
                context.player2.chooseListOption('Favorable Delegate'); // Not a card in hand

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.battlefieldMarine, context.furtiveHandmaiden]);
                context.player2.clickDone();

                // Padmé's ability triggered
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.chimaera,
                    context.padmeAmidala
                ]);
                context.player1.clickCard(context.chimaera);

                expect(context.chimaera.damage).toBe(1);
            });

            it('when a card is discarded from hand, deal 1 damage to a unit', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#what-do-you-have-to-hide', deployed: true },
                        hand: ['furtive-handmaiden']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['no-bargain'],
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays No Bargain to make Player 1 discard a card from hand
                context.player2.clickCard(context.noBargain);
                context.player1.clickCard(context.furtiveHandmaiden);
                expect(context.furtiveHandmaiden).toBeInZone('discard');

                // Padmé's ability triggered
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.consularSecurityForce,
                    context.padmeAmidala
                ]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(1);
            });

            it('only triggers once when two cards are discarded simultaneously', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#what-do-you-have-to-hide', deployed: true },
                        hand: ['furtive-handmaiden', 'favorable-delegate']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['pillage'],
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays Pillage to make Player 1 discard two cards from hand
                context.player2.clickCard(context.pillage);
                context.player2.clickPrompt('Opponent discards');
                context.player1.clickCard(context.furtiveHandmaiden);
                context.player1.clickCard(context.favorableDelegate);
                context.player1.clickPrompt('Done');
                expect(context.furtiveHandmaiden).toBeInZone('discard', context.player1);
                expect(context.favorableDelegate).toBeInZone('discard', context.player1);

                // Padmé's ability triggered once
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.padmeAmidala,
                    context.consularSecurityForce
                ]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(1);
            });

            it('can be used multiple times in the same phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#what-do-you-have-to-hide', deployed: true },
                        hand: ['furtive-handmaiden', 'commandeer']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['no-bargain', 'jam-communications'],
                        groundArena: ['consular-security-force']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays No Bargain to make Player 1 discard a card from hand
                context.player2.clickCard(context.noBargain);
                context.player1.clickCard(context.furtiveHandmaiden);
                expect(context.furtiveHandmaiden).toBeInZone('discard', context.player1);

                // Padmé's ability triggered
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.consularSecurityForce,
                    context.padmeAmidala
                ]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(1);

                context.player1.passAction();

                // Player 2 plays Jam Communications to make Player 1 discard a card from hand
                context.player2.clickCard(context.jamCommunications);
                context.player2.clickCardInDisplayCardPrompt(context.commandeer);
                expect(context.commandeer).toBeInZone('discard', context.player1);

                // Padmé's ability triggered again
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([
                    context.consularSecurityForce,
                    context.padmeAmidala
                ]);
                context.player1.clickCard(context.consularSecurityForce);

                expect(context.consularSecurityForce.damage).toBe(2);
            });

            it('can be passed', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: { card: 'padme-amidala#what-do-you-have-to-hide', deployed: true },
                        hand: ['furtive-handmaiden']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['no-bargain']
                    }
                });

                const { context } = contextRef;

                // Player 2 plays No Bargain to make Player 1 discard a card from hand
                context.player2.clickCard(context.noBargain);
                context.player1.clickCard(context.furtiveHandmaiden);
                expect(context.furtiveHandmaiden).toBeInZone('discard', context.player1);

                // Padmé's ability triggered
                expect(context.player1).toHavePrompt(prompt);
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.padmeAmidala]);
                context.player1.clickPrompt('Pass');

                expect(context.padmeAmidala.damage).toBe(0);
                expect(context.player1).toBeActivePlayer();
            });
            // TODO: Padme does not work correctly with Profundity due to collectiveTrigger logic bug
            // it('can trigger and resolve twice if two cards are discarded sequentially ("then")', async function() {
            //     await contextRef.setupTestAsync({
            //         phase: 'action',
            //         player1: {
            //             leader: { card: 'padme-amidala#what-do-you-have-to-hide', deployed: true },
            //             hand: ['furtive-handmaiden', 'favorable-delegate']
            //         },
            //         player2: {
            //             hasInitiative: true,
            //             hand: ['profundity#we-fight']
            //         }
            //     });

            //     const { context } = contextRef;

            //     // Player 2 plays Profundity to make Player 1 discard a card, then discard another card
            //     context.player2.clickCard(context.profundity);
            //     context.player2.clickPrompt('Opponent discards');

            //     context.player1.clickCard(context.furtiveHandmaiden);
            //     expect(context.furtiveHandmaiden).toBeInZone('discard', context.player1);
            //     context.player1.clickCard(context.favorableDelegate);
            //     expect(context.favorableDelegate).toBeInZone('discard', context.player1);

            //     // Padmé's ability triggered twice
            //     expect(context.player1).toHavePrompt(prompt);
            //     expect(context.player1).toHavePassAbilityButton();
            //     expect(context.player1).toBeAbleToSelectExactly([
            //         context.profundity,
            //         context.padmeAmidala
            //     ]);
            //     context.player1.clickCard(context.profundity);

            //     expect(context.profundity.damage).toBe(1);

            //     // Resolve second trigger
            //     expect(context.player1).toHavePrompt(prompt);
            //     expect(context.player1).toHavePassAbilityButton();
            //     expect(context.player1).toBeAbleToSelectExactly([
            //         context.profundity,
            //         context.padmeAmidala
            //     ]);
            //     context.player1.clickCard(context.profundity);

            //     expect(context.profundity.damage).toBe(2);
            // });
        });
    });
});
