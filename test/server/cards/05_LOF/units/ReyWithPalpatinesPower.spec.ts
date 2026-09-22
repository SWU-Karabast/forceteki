describe('Rey, With Palpatine\'s Power', function() {
    integration(function(contextRef) {
        describe('Rey\'s ability', function() {
            describe('Aggression aspect condition', function() {
                it('should do nothing if no leader or base with Aggression aspect', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'luke-skywalker#faithful-friend',
                            base: 'dagobah-swamp',
                            hand: ['mission-briefing'],
                            deck: ['rey#with-palpatines-power', 'moisture-farmer'],
                            groundArena: ['wampa'],
                        }, player2: {
                            groundArena: ['battlefield-marine'],
                            spaceArena: ['concord-dawn-interceptors']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.missionBriefing);
                    context.player1.clickPrompt('You');
                    expect(context.rey).toBeInZone('hand');
                    expect(context.player2).toBeActivePlayer();
                });

                it('should deal 2 damage to a unit and base when revealed after being drawn in the action phase with an Aggression leader', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'rey#nobody',
                            base: 'dagobah-swamp',
                            hand: ['mission-briefing'],
                            deck: ['rey#with-palpatines-power', 'moisture-farmer'],
                            groundArena: ['wampa'],
                        }, player2: {
                            groundArena: ['battlefield-marine'],
                            spaceArena: ['concord-dawn-interceptors']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.missionBriefing);
                    context.player1.clickPrompt('You');

                    expect(context.player1).toHavePassAbilityPrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
                    context.player1.clickPrompt('Trigger');

                    // Rey is revealed
                    expect(context.player2).toHaveExactViewableDisplayPromptCards([context.reyWithPalpatinesPower]);
                    context.player2.clickDone();

                    expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.concordDawnInterceptors]);
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                    context.player1.clickCard(context.p2Base);

                    expect(context.battlefieldMarine.damage).toBe(2);
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.reyWithPalpatinesPower).toBeInZone('hand');
                    expect(context.player2).toBeActivePlayer();
                });

                it('should deal 2 damage to a unit and base when revealed after being drawn in the action phase with an Aggression base', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            base: 'kestro-city',
                            hand: ['mission-briefing'],
                            deck: ['rey#with-palpatines-power', 'moisture-farmer'],
                            groundArena: ['wampa'],
                        }, player2: {
                            groundArena: ['battlefield-marine'],
                            spaceArena: ['concord-dawn-interceptors']
                        }
                    });

                    const { context } = contextRef;

                    context.player1.clickCard(context.missionBriefing);
                    context.player1.clickPrompt('You');

                    expect(context.player1).toHavePassAbilityPrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
                    context.player1.clickPrompt('Trigger');

                    // Rey is revealed
                    expect(context.player2).toHaveExactViewableDisplayPromptCards([context.rey]);
                    context.player2.clickDone();

                    expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.concordDawnInterceptors]);
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                    context.player1.clickCard(context.p2Base);

                    expect(context.battlefieldMarine.damage).toBe(2);
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.rey).toBeInZone('hand');
                    expect(context.player2).toBeActivePlayer();
                });

                it('should count the Aggression aspect of a vehicle if it becomes a leader unit due to a leader pilot', async function() {
                    await contextRef.setupTestAsync({
                        phase: 'action',
                        player1: {
                            leader: 'kazuda-xiono#best-pilot-in-the-galaxy', // Cunning+Heroism
                            base: 'echo-base', // Command
                            hand: ['mission-briefing'],
                            deck: ['rey#with-palpatines-power', 'moisture-farmer'],
                            spaceArena: [
                                'red-five#running-the-trench' // Aggression+Heroism
                            ]
                        },
                        player2: {
                            groundArena: ['battlefield-marine']
                        }
                    });

                    const { context } = contextRef;

                    // Red Five is not a leader unit to start
                    expect(context.redFive.isLeader()).toBeFalse();

                    // Deploy Kazuda as a pilot on Red Five, making it a leader unit with the Aggression aspect
                    context.player1.clickCard(context.kazudaXiono);
                    context.player1.clickPrompt('Deploy Kazuda Xiono as a pilot');
                    context.player1.clickCard(context.redFive);

                    expect(context.redFive).toHaveExactUpgradeNames(['kazuda-xiono#best-pilot-in-the-galaxy']);
                    expect(context.redFive.isLeader()).toBeTrue();
                    context.player2.passAction();

                    // Play Mission Briefing to draw Rey and trigger the ability
                    context.player1.clickCard(context.missionBriefing);
                    context.player1.clickPrompt('You');

                    // Ability triggers because Red Five is now a leader unit with the Aggression aspect
                    expect(context.player1).toHavePassAbilityPrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
                    context.player1.clickPrompt('Trigger');

                    // Rey is revealed
                    expect(context.player2).toHaveExactViewableDisplayPromptCards([context.rey]);
                    context.player2.clickDone();

                    expect(context.player1).toBeAbleToSelectExactly([context.redFive, context.battlefieldMarine]);
                    context.player1.clickCard(context.battlefieldMarine);
                    expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                    context.player1.clickCard(context.p2Base);

                    expect(context.battlefieldMarine.damage).toBe(2);
                    expect(context.p2Base.damage).toBe(2);
                    expect(context.rey).toBeInZone('hand');
                    expect(context.player2).toBeActivePlayer();
                });
            });

            it('should do nothing if drawn during the regroup phase', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['mission-briefing'],
                        deck: ['rey#with-palpatines-power', 'moisture-farmer'],
                        groundArena: ['wampa'],
                    }, player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.claimInitiative();
                context.player2.passAction();

                context.player1.clickDone();
                context.player2.clickDone();

                expect(context.player1).toBeActivePlayer();
                expect(context.rey).toBeInZone('hand');
            });

            it('should do nothing if in hand and a different card is drawn', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['mission-briefing', 'rey#with-palpatines-power'],
                        deck: ['pyke-sentinel', 'moisture-farmer'],
                        groundArena: ['wampa'],
                    }, player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.missionBriefing);
                context.player1.clickPrompt('You');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be passable', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['mission-briefing'],
                        deck: ['rey#with-palpatines-power', 'moisture-farmer'],
                        groundArena: ['wampa'],
                    }, player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.missionBriefing);
                context.player1.clickPrompt('You');

                expect(context.player1).toHavePassAbilityPrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
                context.player1.clickPrompt('Pass');
                expect(context.player2).toBeActivePlayer();
            });

            it('should not trigger after being drawn and then immediately being discarded', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        deck: ['rey#with-palpatines-power'],
                        groundArena: ['wampa'],
                    }, player2: {
                        hand: ['battlefield-marine', 'lothal-insurgent']
                    }
                });

                const { context } = contextRef;

                context.player1.passAction();
                context.player2.clickCard(context.battlefieldMarine);

                context.player1.passAction();
                context.player2.clickCard(context.lothalInsurgent);

                expect(context.rey).toBeInZone('discard');
                expect(context.player1).not.toHavePrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
                expect(context.player1).toBeActivePlayer();
            });

            it('should be able to use ability for each Rey if two Reys are drawn together', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['mission-briefing'],
                        deck: ['rey#with-palpatines-power', 'rey#with-palpatines-power'],
                        groundArena: ['wampa'],
                    }, player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                const arrey = context.player1.findCardsByName('rey#with-palpatines-power');
                expect(arrey.length).toBe(2);

                context.player1.clickCard(context.missionBriefing);
                context.player1.clickPrompt('You');

                // the two identical Rey triggers are grouped, opening a resolution modal directly
                expect(context.player1).toHavePrompt('Resolve "Reveal Rey to deal 2 damage to a unit and 2 damage to a base"');
                expect(context.player1).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
                context.player1.clickPrompt('Resolve all (2)');

                // Activate the first Rey's trigger
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                // Rey is revealed
                context.player2.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.concordDawnInterceptors]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);

                // Now, the second Rey's trigger
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                // Rey is revealed
                context.player2.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.concordDawnInterceptors]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.p2Base.damage).toBe(4);

                expect(arrey[0]).toBeInZone('hand');
                expect(arrey[1]).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should be able to use ability for one Rey and pass the other if two Reys are drawn together', async function() {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        base: 'kestro-city',
                        hand: ['mission-briefing'],
                        deck: ['rey#with-palpatines-power', 'rey#with-palpatines-power'],
                        groundArena: ['wampa'],
                    }, player2: {
                        groundArena: ['battlefield-marine'],
                        spaceArena: ['concord-dawn-interceptors']
                    }
                });

                const { context } = contextRef;

                const arrey = context.player1.findCardsByName('rey#with-palpatines-power');
                expect(arrey.length).toBe(2);

                context.player1.clickCard(context.missionBriefing);
                context.player1.clickPrompt('You');

                // the two identical Rey triggers are grouped, opening a resolution modal directly
                expect(context.player1).toHavePrompt('Resolve "Reveal Rey to deal 2 damage to a unit and 2 damage to a base"');
                expect(context.player1).toHaveExactPromptButtons(['Resolve next', 'Resolve all (2)']);
                context.player1.clickPrompt('Resolve all (2)');

                // Pass on the first Rey's trigger
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Pass');

                // Now, the second Rey's trigger
                expect(context.player1).toHavePassAbilityButton();
                context.player1.clickPrompt('Trigger');

                // Rey is revealed
                context.player2.clickDone();

                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.battlefieldMarine, context.concordDawnInterceptors]);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.player1).toBeAbleToSelectExactly([context.p1Base, context.p2Base]);
                context.player1.clickCard(context.p2Base);

                expect(context.battlefieldMarine.damage).toBe(2);
                expect(context.p2Base.damage).toBe(2);

                expect(arrey[0]).toBeInZone('hand');
                expect(arrey[1]).toBeInZone('hand');
                expect(context.player2).toBeActivePlayer();
            });

            it('should interact correctly with a card that searches and draws Rey', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry'],
                        discard: ['yoda#old-master'],
                        deck: ['mystic-reflection', 'krayt-dragon', 'wampa', 'rey#with-palpatines-power', 'moisture-farmer']
                    }
                });
                const { context } = contextRef;

                context.player1.clickCard(context.psychometry);
                context.player1.clickCard(context.yoda);
                context.player1.clickCardInDisplayCardPrompt(context.rey);

                // P2 is prompted to see the revealed cards
                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.rey]);
                context.player2.clickDone();

                expect(context.getChatLog()).toContain('player1 uses Psychometry to reveal and draw Rey');

                expect(context.player1).toHavePassAbilityPrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
                context.player1.clickPrompt('Trigger');

                expect(context.player2).toHaveExactViewableDisplayPromptCards([context.reyWithPalpatinesPower]);
                context.player2.clickDone();

                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should trigger when the Plan claim token draws a card in FauxSuns format', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                format: 'fauxSuns',
                player1: {
                    leader: 'luke-skywalker#faithful-friend',
                    secondLeader: 'saw-gerrera#bring-down-the-empire',
                    base: 'kestro-city',   // kestro-city has the Aggression aspect
                    hand: ['wampa'],        // card already in hand to put on bottom, keeping Rey in hand
                    deck: ['rey#with-palpatines-power'],
                },
                player2: {
                    leader: 'darth-vader#dark-lord-of-the-sith',
                    base: 'administrators-tower',
                    groundArena: ['battlefield-marine'],
                }
            });

            const { context } = contextRef;

            context.player1.clickPrompt('Claim Plan');

            // The Plan counter's put-a-card-on-the-bottom prompt fires before Rey's triggered ability.
            // Player1 puts wampa on the bottom, keeping Rey in hand so her trigger can fire.
            expect(context.player1).toHavePrompt('Choose a card from your hand to put on the bottom of your deck');
            context.player1.clickCard(context.wampa);

            // Rey is still in hand — her triggered ability fires because player1 has an Aggression base
            expect(context.player1).toHavePassAbilityPrompt('Reveal Rey to deal 2 damage to a unit and 2 damage to a base');
            context.player1.clickPrompt('Trigger');

            // Rey is revealed to the opponent
            expect(context.player2).toHaveExactViewableDisplayPromptCards([context.reyWithPalpatinesPower]);
            context.player2.clickDone();

            // Deal 2 damage to a unit, then 2 damage to a base
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.p2Base);

            expect(context.battlefieldMarine.damage).toBe(2);
            expect(context.p2Base.damage).toBe(2);

            // Turn passes to player2
            expect(context.player2).toBeActivePlayer();
        });
    });
});