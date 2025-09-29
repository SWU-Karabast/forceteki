describe('One in a Million', function () {
    integration(function (contextRef) {
        it('One in a Million defeat ability should be able to defeat a unit which have power and remaining HP equal to ready resource we control', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'luke-skywalker#jedi-knight', upgrades: ['academy-training'], damage: 1 }],
                    spaceArena: ['raddus#holdos-final-command'],
                    deck: ['wampa'],
                    leader: 'chewbacca#walking-carpet',
                    // 9 resources including one-in-a-million
                    resources: ['one-in-a-million', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst', 'atst']
                },
                player2: {
                    groundArena: [{ card: 'cad-bane#hostage-taker', upgrades: ['experience'] }],
                    spaceArena: ['avenger#hunting-star-destroyer'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.chewbacca);
            context.player1.clickPrompt('Deploy Chewbacca');
            expect(context.player1).toHavePassAbilityPrompt('Play One in a Million using Plot');
            context.player1.clickPrompt('Trigger');

            expect(context.player1.readyResourceCount).toBe(8);
            expect(context.player1).toBeAbleToSelectExactly([context.lukeSkywalker, context.cadBane, context.avenger]);

            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.avenger).toBeInZone('discard', context.player2);
        });

        it('One in a Million can\'t be played from hand', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-in-a-million'],
                    resources: 9
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer'],
                }
            });

            const { context } = contextRef;
            expect(context.oneInAMillion).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('One in a Million can\'t be played from hand with a Relentless on board', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-in-a-million'],
                    resources: 9
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer', 'relentless#konstantines-folly'],
                }
            });

            const { context } = contextRef;
            expect(context.oneInAMillion).not.toHaveAvailableActionWhenClickedBy(context.player1);
        });

        it('One in a Million can\'t be played from hand with modified actions', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['one-in-a-million', 'resupply'],
                    groundArena: ['bib-fortuna#jabbas-majordomo'],
                    resources: 8
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.bibFortuna);
            context.player1.clickPrompt('Play an event from your hand. It costs 1 less.');
            expect(context.oneInAMillion).not.toHaveAvailableActionWhenClickedBy(context.player1);
            context.player1.clickCard(context.resupply);
        });

        it('One in a Million can be played from resources with Smuggle', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['tech#source-of-insight'],
                    leader: 'chewbacca#walking-carpet',
                    deck: ['wampa'],
                    // need to have x-8 = 1+2 => x=11 resources
                    resources: ['vulture-interceptor-wing', 'vulture-interceptor-wing',
                        'vulture-interceptor-wing', 'vulture-interceptor-wing',
                        'vulture-interceptor-wing', 'vulture-interceptor-wing',
                        'vulture-interceptor-wing', 'vulture-interceptor-wing',
                        'vulture-interceptor-wing', 'vulture-interceptor-wing',
                        'one-in-a-million'],
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.oneInAMillion);
            context.player1.clickPrompt('');
            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.avenger).toBeInZone('discard', context.player2);
        });

        it('One in a Million can be played from deck with Ezra Bridger completed attack ability', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    groundArena: ['ezra-bridger#resourceful-troublemaker'],
                    deck: ['one-in-a-million'],
                    leader: 'chewbacca#walking-carpet',
                    // need to have x-8 = 1+2 => x=11 resources
                    resources: 9
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.ezraBridger);
            context.player1.clickCard(context.p2Base);
            context.player1.clickDisplayCardPromptButton(context.oneInAMillion.uuid, 'play');
            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.avenger).toBeInZone('discard', context.player2);
        });

        it('One in a Million can be played from deck with You\'re my Only Hope', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['youre-my-only-hope'],
                    deck: ['one-in-a-million'],
                    leader: 'chewbacca#walking-carpet',
                    resources: 11,
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.youreMyOnlyHope);
            context.player1.clickDisplayCardPromptButton(context.oneInAMillion.uuid, 'play-discount');
            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.avenger).toBeInZone('discard', context.player2);
        });

        it('One in a Million can be played from discard with Aid From Innocent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['aid-from-the-innocent'],
                    deck: ['one-in-a-million', 'youre-my-only-hope', 'wampa', 'atst', 'bamboozle', 'battlefield-marine'],
                    leader: 'chewbacca#walking-carpet',
                    base: 'administrators-tower',
                    resources: 13,
                },
                player2: {
                    spaceArena: ['avenger#hunting-star-destroyer'],
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.aidFromTheInnocent);
            context.player1.clickCardInDisplayCardPrompt(context.oneInAMillion);
            context.player1.clickCardInDisplayCardPrompt(context.bamboozle);
            context.player1.clickDone();

            expect(context.oneInAMillion).toBeInZone('discard', context.player1);

            context.player2.passAction();

            context.player1.clickCard(context.oneInAMillion);
            context.player1.clickCard(context.avenger);

            expect(context.player2).toBeActivePlayer();
            expect(context.avenger).toBeInZone('discard', context.player2);
        });
    });
});
