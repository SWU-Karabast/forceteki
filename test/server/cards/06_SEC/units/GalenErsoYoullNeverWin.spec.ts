describe('Galen Erso - You\'ll Never Win', function() {
    integration(function(contextRef) {
        it('should be playable using Plot and should name a card', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    leader: 'luke-skywalker#faithful-friend',
                    resources: ['galen-erso#youll-never-win', 'wampa', 'wampa', 'wampa', 'wampa', 'wampa'],
                    deck: ['moisture-farmer']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.lukeSkywalker);
            context.player1.clickPrompt('Deploy Luke Skywalker');

            expect(context.player1).toHavePassAbilityPrompt('Play Galen Erso using Plot');
            context.player1.clickPrompt('Trigger');
            expect(context.galenErso).toBeInZone('groundArena');
            expect(context.moistureFarmer).toBeInZone('resource');
            expect(context.player1).toHaveExactDropdownListOptions(context.getAllCardTitles());
            context.player1.chooseListOption('Luke Skywalker');
        });

        describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play, named enemy leader', function() {
            it('cards should not be blanked when their title is named', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                    },
                    player2: {
                        leader: 'luke-skywalker#faithful-friend',
                        hand: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.clickCard(context.battlefieldMarine);
                context.player1.passAction();
                context.player2.clickCard(context.lukeSkywalker);
                context.player2.clickPrompt('Give a shield to a heroism unit you played this phase');
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });

            it('units should not be blanked when their title is named', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                    },
                    player2: {
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true },
                        groundArena: ['battlefield-marine'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.clickCard(context.lukeSkywalker);
                context.player2.clickCard(context.p1Base);

                // Give Shield to Battlefield Marine - ability is not blanked
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine).toHaveExactUpgradeNames(['shield']);
            });

            it('pilots should not be blanked when their title is named', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'luke-skywalker#hero-of-yavin',
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: ['wampa'],
                    }
                });

                const { context } = contextRef;

                // Deploy Luke Skywalker as a Pilot
                context.player1.clickCard(context.lukeSkywalker);
                context.player1.clickPrompt('Deploy Luke Skywalker as a Pilot');
                context.player1.clickCard(context.allianceXwing);

                context.player2.clickCard(context.galenErso);
                context.player2.chooseListOption('Luke Skywalker');

                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHavePrompt('Deal 3 damage to a unit');
                expect(context.player1).toHavePassAbilityButton();
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.allianceXwing, context.galenErso]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
            });
        });

        describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play, named enemy non-leader units', function() {
            it('that are Pilots should not be playable using Piloting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                    },
                    player2: {
                        hand: ['luke-skywalker#you-still-with-me'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.clickCard(context.lukeSkywalkerYouStillWithMe);
                expect(context.lukeSkywalkerYouStillWithMe).toBeInZone('groundArena');
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger When Playeds', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        spaceArena: ['alliance-xwing']
                    },
                    player2: {
                        hand: ['imperial-interceptor']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Imperial Interceptor');

                context.player2.clickCard(context.imperialInterceptor);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger When Defeateds', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                    },
                    player2: {
                        groundArena: ['nightsister-warrior'],
                        hand: ['daring-raid'],
                        deck: ['moisture-farmer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Nightsister Warrior');

                context.player2.clickCard(context.daringRaid);
                context.player2.clickCard(context.nightsisterWarrior);
                expect(context.nightsisterWarrior).toBeInZone('discard');
                expect(context.moistureFarmer).toBeInZone('deck');
                expect(context.player1).toBeActivePlayer();
            });

            it('should not trigger abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                    },
                    player2: {
                        groundArena: ['c3po#protocol-droid']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('C-3PO');

                context.player2.clickCard(context.c3po);
                context.player2.clickCard(context.p1Base);
                expect(context.player1).toBeActivePlayer();
            });

            it('should not gain abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                        hand: ['jedi-lightsaber']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.clickCard(context.jediLightsaber);
                context.player2.clickCard(context.lukeSkywalkerJediKnight);

                context.player1.passAction();

                context.player2.clickCard(context.lukeSkywalkerJediKnight);
                context.player2.clickCard(context.villageProtectors);

                expect(context.villageProtectors).toBeInZone('groundArena');
            });

            it('should lose gained abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['jedi-lightsaber'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.clickCard(context.lukeSkywalkerJediKnight);
                context.player2.clickCard(context.villageProtectors);

                expect(context.villageProtectors).toBeInZone('groundArena');
            });

            it('should lose Keywords', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                        base: { card: 'kestro-city', damage: 4 }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.clickCard(context.lukeSkywalkerJediKnight);
                context.player2.clickCard(context.p1Base);

                expect(context.p2Base.damage).toBe(4);
            });

            it('should be blanked if owned by the opponent even if controlled by Galen\'s owner', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win', 'change-of-heart'],
                        base: { card: 'kestro-city', damage: 4 }
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.passAction();

                context.player1.clickCard(context.changeOfHeart);
                context.player1.clickCard(context.lukeSkywalkerJediKnight);

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalkerJediKnight);
                context.player1.clickCard(context.p2Base);
                expect(context.p1Base.damage).toBe(4);
            });
        });

        describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play, named friendly non-leader units', function() {
            it('that are Pilots should be playable using Piloting', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win', 'luke-skywalker#you-still-with-me'],
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalkerYouStillWithMe);
                expect(context.player1).toHaveExactPromptButtons(['Play Luke Skywalker with Piloting', 'Play Luke Skywalker', 'Cancel']);
                context.player1.clickPrompt('Play Luke Skywalker with Piloting');
                context.player1.clickCard(context.allianceXwing);
                expect(context.lukeSkywalkerYouStillWithMe).toBeInZone('spaceArena');
                expect(context.lukeSkywalkerYouStillWithMe).toBeAttachedTo(context.allianceXwing);
            });

            it('should trigger When Playeds', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win', 'imperial-interceptor']
                    },
                    player2: {
                        spaceArena: ['alliance-xwing']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Imperial Interceptor');

                context.player2.passAction();

                context.player1.clickCard(context.imperialInterceptor);
                context.player1.clickCard(context.allianceXwing);
                expect(context.allianceXwing).toBeInZone('discard');
            });

            it('should trigger When Defeateds', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win', 'daring-raid'],
                        groundArena: ['nightsister-warrior'],
                        deck: ['moisture-farmer']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Nightsister Warrior');

                context.player2.passAction();

                context.player1.clickCard(context.daringRaid);
                context.player1.clickCard(context.nightsisterWarrior);
                expect(context.nightsisterWarrior).toBeInZone('discard');
                expect(context.moistureFarmer).toBeInZone('hand');
            });

            it('should trigger abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: ['c3po#protocol-droid'],
                        deck: ['wampa']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('C-3PO');

                context.player2.passAction();

                context.player1.clickCard(context.c3po);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toHaveExactDropdownListOptions(Array.from({ length: 21 }, (x, i) => `${i}`));
                context.player1.chooseListOption('5');
                context.player1.clickDone();
            });

            it('should be able to gain abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win', 'jedi-lightsaber'],
                        groundArena: ['luke-skywalker#jedi-knight']
                    },
                    player2: {
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.passAction();

                context.player1.clickCard(context.jediLightsaber);
                context.player1.clickCard(context.lukeSkywalkerJediKnight);

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalkerJediKnight);
                context.player1.clickCard(context.villageProtectors);
                context.player1.clickPrompt('Give the defender -2/-2 for this phase');

                expect(context.villageProtectors).toBeInZone('discard');
            });

            it('should not lose gained abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['jedi-lightsaber'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalkerJediKnight);
                context.player1.clickCard(context.villageProtectors);
                context.player1.clickPrompt('Give the defender -2/-2 for this phase');

                expect(context.villageProtectors).toBeInZone('discard');
            });

            it('should not lose Keywords', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: ['luke-skywalker#jedi-knight'],
                        base: { card: 'kestro-city', damage: 4 }
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalkerJediKnight);
                context.player1.clickCard(context.p2Base);

                // Ensure Restore was not active
                expect(context.p1Base.damage).toBe(1);
            });

            it('should not be blanked even if controlled by Galen\'s opponent', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: ['luke-skywalker#jedi-knight']
                    },
                    player2: {
                        hand: ['change-of-heart'],
                        base: { card: 'kestro-city', damage: 4 },
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Luke Skywalker');

                context.player2.clickCard(context.changeOfHeart);
                context.player2.clickCard(context.lukeSkywalkerJediKnight);

                context.player1.passAction();

                context.player2.clickCard(context.lukeSkywalkerJediKnight);
                context.player2.clickCard(context.p1Base);
                expect(context.p2Base.damage).toBe(1);
            });
        });

        describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play, named enemy upgrades', function() {
            it('should not grant abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: ['luke-skywalker#jedi-knight'],
                        hand: ['jedi-lightsaber']
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Jedi Lightsaber');

                context.player2.clickCard(context.jediLightsaber);
                context.player2.clickCard(context.lukeSkywalkerJediKnight);

                context.player1.passAction();

                context.player2.clickCard(context.lukeSkywalkerJediKnight);
                context.player2.clickCard(context.villageProtectors);

                expect(context.villageProtectors).toBeInZone('groundArena');
            });

            it('should stop granting gained abilities to the attached unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    },
                    player2: {
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['jedi-lightsaber'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Jedi Lightsaber');

                context.player2.clickCard(context.lukeSkywalkerJediKnight);
                context.player2.clickCard(context.villageProtectors);

                expect(context.villageProtectors).toBeInZone('groundArena');
            });

            it('should not remove stat bonuses granted by upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                    },
                    player2: {
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['jedi-lightsaber'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Jedi Lightsaber');

                expect(context.lukeSkywalkerJediKnight.getPower()).toBe(9);
                expect(context.lukeSkywalkerJediKnight.getHp()).toBe(10);
            });

            it('should stop granting gained abilities to the attached unit if the upgrade is a Pilot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win']
                    },
                    player2: {
                        spaceArena: [{ card: 'alliance-xwing', upgrades: ['independent-smuggler'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Independent Smuggler');

                context.player2.clickCard(context.allianceXwing);
                context.player2.clickCard(context.p1Base);

                expect(context.p1Base.damage).toBe(3); // Would be 4 if Raid 1 was still active
            });

            it('should not remove stat increases granted by pilot upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win']
                    },
                    player2: {
                        spaceArena: [{ card: 'alliance-xwing', upgrades: ['independent-smuggler'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Independent Smuggler');

                expect(context.allianceXwing.getPower()).toBe(3);
                expect(context.allianceXwing.getHp()).toBe(4);
            });
        });

        describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play, named friendly upgrades', function() {
            it('should grant abilities', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win', 'jedi-lightsaber'],
                        groundArena: ['luke-skywalker#jedi-knight'],
                    },
                    player2: {
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Jedi Lightsaber');

                context.player2.passAction();

                context.player1.clickCard(context.jediLightsaber);
                context.player1.clickCard(context.lukeSkywalkerJediKnight);

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalkerJediKnight);
                context.player1.clickCard(context.villageProtectors);

                context.player1.clickPrompt('Give the defender -2/-2 for this phase');

                expect(context.villageProtectors).toBeInZone('discard');
            });

            it('should not stop granting gained abilities to the attached unit', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['jedi-lightsaber'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'village-protectors', upgrades: ['shield'] }]
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Jedi Lightsaber');

                context.player2.passAction();

                context.player1.clickCard(context.lukeSkywalkerJediKnight);
                context.player1.clickCard(context.villageProtectors);

                context.player1.clickPrompt('Give the defender -2/-2 for this phase');

                expect(context.villageProtectors).toBeInZone('discard');
            });

            it('should not remove stat bonuses granted by upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['jedi-lightsaber'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Jedi Lightsaber');

                expect(context.lukeSkywalkerJediKnight.getPower()).toBe(9);
                expect(context.lukeSkywalkerJediKnight.getHp()).toBe(10);
            });

            it('should not stop granting gained abilities to the attached unit if the upgrade is a Pilot', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win'],
                        spaceArena: [{ card: 'alliance-xwing', upgrades: ['independent-smuggler'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Independent Smuggler');

                context.player2.passAction();

                context.player1.clickCard(context.allianceXwing);
                context.player1.clickCard(context.p2Base);

                expect(context.p2Base.damage).toBe(4);
            });

            it('should not remove stat increases granted by pilot upgrades', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['galen-erso#youll-never-win']
                    },
                    player2: {
                        spaceArena: [{ card: 'alliance-xwing', upgrades: ['independent-smuggler'] }],
                    }
                });

                const { context } = contextRef;

                context.player1.clickCard(context.galenErso);
                context.player1.chooseListOption('Independent Smuggler');

                expect(context.allianceXwing.getPower()).toBe(3);
                expect(context.allianceXwing.getHp()).toBe(4);
            });
        });

        // describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play,', function() {
        //     it('named events should be blanked when played from hand', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //             },
        //         });

        //         const { context } = contextRef;
        //         expect(context.player1).toBeActivePlayer();
        //     });

        //     it('named events should be blanked when played with Smuggle', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //             },
        //         });

        //         const { context } = contextRef;
        //         expect(context.player1).toBeActivePlayer();
        //     });

        //     it('named events should be blanked when played with Plot', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //             },
        //         });

        //         const { context } = contextRef;
        //         expect(context.player1).toBeActivePlayer();
        //     });
        // });

        // describe('Galen Erso - You\'ll Never Win\'s ability should name a card. While he is in play,', function() {
        //     it('named bases should lose Epic Actions', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //             },
        //         });

        //         const { context } = contextRef;
        //         expect(context.player1).toBeActivePlayer();
        //     });

        //     it('named bases should lose abilities', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //             },
        //         });

        //         const { context } = contextRef;
        //         expect(context.player1).toBeActivePlayer();
        //     });

        //     it('named bases that have a deckbuilding restriction should not cause a game loss', async function () {
        //         await contextRef.setupTestAsync({
        //             phase: 'action',
        //             player1: {
        //             },
        //         });

        //         const { context } = contextRef;
        //         expect(context.player1).toBeActivePlayer();
        //     });
    });
});