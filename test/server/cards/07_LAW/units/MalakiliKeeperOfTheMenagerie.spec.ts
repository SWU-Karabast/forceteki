describe('Malakili, Keeper of the Menagerie\'s constant ability', function () {
    integration(function (contextRef) {
        describe('Friendly Creature units in play', function () {
            it('gain the Underworld trait for the purposes of targeting effects (SHD Maul)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['maul#shadow-collective-visionary'],
                        groundArena: ['malakili#keeper-of-the-menagerie', 'wampa']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                // P1 plays Maul to ambush Battlefield Marine
                context.player1.clickCard(context.maul);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.battlefieldMarine);

                // Maul's ability triggers to redirect combat damage to another Underworld unit
                expect(context.player1).toHavePrompt('Choose another friendly Underworld unit. All combat damage that would be dealt to this unit during this attack is dealt to the chosen unit instead.');
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.malakili]);
                context.player1.clickCard(context.wampa);
                expect(context.wampa.damage).toBe(3);
            });
        });

        describe('Friendly Creature units in hand', function () {
            it('have the Underworld trait when played (Cad Bane)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        leader: 'cad-bane#he-who-needs-no-introduction',
                        hand: ['tauntaun'],
                        groundArena: ['malakili#keeper-of-the-menagerie']
                    },
                    player2: {
                        groundArena: [
                            'battlefield-marine'
                        ]
                    }
                });

                const { context } = contextRef;

                // P1 plays Tauntaun
                context.player1.clickCard(context.tauntaun);

                // Cad Bane's leader ability triggers due to playing an Underworld card
                expect(context.player1).toHavePassAbilityPrompt('Exhaust this leader to deal 1 damage to a unit controlled by the opponent');
                context.player1.clickPrompt('Trigger');
                context.player2.clickCard(context.battlefieldMarine);
                expect(context.battlefieldMarine.damage).toBe(1);
            });

            it('have the Underworld trait when targeted for play card effects (Now There Are Two of Them)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['now-there-are-two-of-them', 'krayt-dragon'],
                        groundArena: ['malakili#keeper-of-the-menagerie']
                    }
                });

                const { context } = contextRef;

                // P1 plays Now There Are Two of Them, targeting Krayt Dragon in hand because it shares the Underworld trait with Malakili
                context.player1.clickCard(context.nowThereAreTwoOfThem);
                context.player1.clickCard(context.kraytDragon);

                expect(context.kraytDragon).toBeInZone('groundArena', context.player1);
            });
        });

        describe('Friendly Creature units in the discard pile', function () {
            it('gain the Underworld trait for the purposes of targeting effects (Street Gang Recruiter)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['street-gang-recruiter'],
                        groundArena: ['malakili#keeper-of-the-menagerie'],
                        discard: ['krayt-dragon']
                    }
                });

                const { context } = contextRef;

                // P1 plays Street Gang Recruiter
                context.player1.clickCard(context.streetGangRecruiter);

                // Ability triggers to return an Underworld card from discard to hand
                expect(context.player1).toBeAbleToSelectExactly([context.kraytDragon]);
                context.player1.clickCard(context.kraytDragon);
                expect(context.kraytDragon).toBeInZone('hand', context.player1);
            });

            it('keep the Underworld trait when they are discarded from deck (LAW Doctor Aphra)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['malakili#keeper-of-the-menagerie', 'doctor-aphra#digging-for-answers'],
                        deck: ['lothcat', 'graceful-purrgil', 'porg']
                    }
                });

                const { context } = contextRef;

                // P1 attacks with Doctor Aphra
                context.player1.clickCard(context.doctorAphra);
                context.player1.clickCard(context.p2Base);

                // Ability triggers to discard top 3 cards of deck
                expect(context.player1.discard.length).toBe(3);
                expect(context.player1.deck.length).toBe(0);

                // Prompt to return an Underworld card discarded this way to hand
                expect(context.player1).toBeAbleToSelectExactly([context.lothcat, context.gracefulPurrgil, context.porg]);
                context.player1.clickCard(context.gracefulPurrgil);
                expect(context.gracefulPurrgil).toBeInZone('hand', context.player1);
            });
        });

        describe('Friendly Creature units in the deck', function () {
            it('have the Underworld trait when played from top of deck (Ezra Bridger)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [
                            'malakili#keeper-of-the-menagerie',
                            'lady-proxima#white-worm-matriarch',
                            'ezra-bridger#resourceful-troublemaker'
                        ],
                        deck: ['rampaging-wampa']
                    }
                });

                const { context } = contextRef;

                // P1 attacks with Ezra Bridger
                context.player1.clickCard(context.ezraBridger);
                context.player1.clickCard(context.p2Base);

                // Ability triggers to look at & play the top card of deck
                expect(context.player1).toHaveExactSelectableDisplayPromptCards([context.rampagingWampa]);
                expect(context.player1).toHaveExactDisplayPromptPerCardButtons(['Play it', 'Discard it', 'Leave it on top of your deck']);
                context.player1.clickDisplayCardPromptButton(context.rampagingWampa.uuid, 'play');

                // Lady Proxima's ability triggered because we played an Underworld card
                expect(context.player1).toHavePrompt('Deal 1 damage to a base.');
                context.player1.clickCard(context.p2Base);
            });

            it('has the Underworld trait for the purposes of deck search effects (Psychometry)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['psychometry'],
                        groundArena: ['malakili#keeper-of-the-menagerie'],
                        deck: ['atst', 'nightsister-warrior', 'krayt-dragon'],
                        discard: ['ma-klounkee']
                    }
                });

                const { context } = contextRef;

                // P1 plays Psychometry, choosing Ma Klounkee from discard
                context.player1.clickCard(context.psychometry);
                context.player1.clickCard(context.maKlounkee);

                // Now we search the deck for an Underworld card
                expect(context.player1).toHaveExactDisplayPromptCards({
                    selectable: [context.kraytDragon],
                    invalid: [context.atst, context.nightsisterWarrior]
                });
                context.player1.clickCardInDisplayCardPrompt(context.kraytDragon);

                expect(context.getChatLogs(2)).toContain('player1 takes Krayt Dragon');
                expect(context.kraytDragon).toBeInZone('hand', context.player1);
            });
        });

        // TODO: If there are ever any effects that care about traits in the resource zone, add tests for that too

        describe('Enemy Creature units', function () {
            it('do not have the Underworld trait unless they change control and become friendly', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['traitorous'],
                        groundArena: ['malakili#keeper-of-the-menagerie'],
                        spaceArena: ['xanadu-blood#cad-banes-reward']
                    },
                    player2: {
                        hasInitiative: true,
                        hand: ['ma-klounkee'],
                        groundArena: ['lothwolf']
                    }
                });

                const { context } = contextRef;

                // P2 attempts to play Ma Klounkee, but they have no legal targets since Loth-Wolf is not Underworld
                context.player2.clickCard(context.maKlounkee);
                expect(context.player2).toHavePrompt('Playing Ma Klounkee will have no effect. Are you sure you want to play it?');
                context.player2.clickPrompt('Play anyway');
                expect(context.maKlounkee).toBeInZone('discard', context.player2);

                // P1 plays Traitorous to gain control of Loth-Wolf
                context.player1.clickCard(context.traitorous);
                context.player1.clickCard(context.lothwolf);
                expect(context.lothwolf).toBeInZone('groundArena', context.player1);

                context.player2.passAction();

                // P1 attacks with Xanadu Blood, triggering its ability to target an Underworld unit
                context.player1.clickCard(context.xanaduBlood);
                context.player1.clickCard(context.p2Base);
                expect(context.player1).toBeAbleToSelectExactly([context.lothwolf, context.malakili]);
                context.player1.clickCard(context.lothwolf);

                // Loth-Wolf is returned to P2's hand and P2 exhausts a resource
                expect(context.lothwolf).toBeInZone('hand', context.player2);
                expect(context.player2.exhaustedResourceCount).toBe(2);
            });

            it('do not have the Underworld trait when played (Cad Bane)', async function () {
                await contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: ['malakili#keeper-of-the-menagerie']
                    },
                    player2: {
                        hasInitiative: true,
                        leader: 'cad-bane#he-who-needs-no-introduction',
                        hand: ['porg']
                    }
                });

                const { context } = contextRef;

                // P2 plays Porg
                context.player2.clickCard(context.porg);
                expect(context.porg).toBeInZone('groundArena', context.player2);

                // Cad Bane's leader ability does not trigger since Porg is not Underworld
                expect(context.player1).toBeActivePlayer();
            });
        });
    });
});