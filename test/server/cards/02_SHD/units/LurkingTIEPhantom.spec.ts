describe('Lurking TIE Phantom', function() {
    integration(function(contextRef) {
        // it('cannot be captured by enemy effects', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             groundArena: ['cassian-andor#rebellions-are-built-on-hope', 'fifth-brother#fear-hunter'],
        //             spaceArena: ['punishing-one#dengars-jumpmaster'],
        //             hand: ['relentless-pursuit'],
        //         },
        //         player2: {
        //             groundArena: ['battlefield-marine'],
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.relentlessPursuit);
        //     expect(context.player1).toBeAbleToSelectExactly([context.cassianAndor, context.punishingOne, context.fifthBrother]);
        //     context.player1.clickCard(context.cassianAndor);
        //     expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine]);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        // });

        // it('can be defeated/damaged from attack', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             groundArena: ['cassian-andor#rebellions-are-built-on-hope', 'fifth-brother#fear-hunter'],
        //             spaceArena: ['punishing-one#dengars-jumpmaster'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.punishingOne);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });

        it('cannot be damaged by opponent\'s event', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['daring-raid'],
                },
                player2: {
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;
            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.lurkingTiePhantom.damage).toBe(0);
        });

        // it('cannot be damaged by enemy unit ability', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['imperial-interceptor'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.imperialInterceptor);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        //     expect(context.lurkingTiePhantom.damage).toBe(0);
        // });

        // it('cannot be defeated by opponent\'s event that says defeat', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['takedown'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.takedown);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        // });

        // it('cannot be defeated by opponent\'s unit that says defeat', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['devastating-gunship'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.devastatingGunship);
        //     expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom]);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        // });

        // it('can be defeated by state based effects', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['make-an-opening'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.makeAnOpening);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });

        // it('can be damaged by your own event', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['open-fire'],
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.openFire);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });

        // it('can be defeated by your own event', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['rivals-fall'],
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.rivalsFall);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });

        // it('can be damaged by your own unit ability', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['devastator#inescapable'],
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.devastator);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });

        // it('can be defeated by your own unit that says defeat', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['count-dooku#darth-tyranus'],
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.countDooku);
        //     context.player1.clickPrompt('Defeat a unit with 4 or less remaining HP');
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });

        // it('cannot be defeated by opponent event even if you pick', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['power-of-the-dark-side'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom', 'devastator#inescapable'],
        //             groundArena: ['battlefield-marine', 'count-dooku#darth-tyranus'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.powerOfTheDarkSide);
        //     expect(context.player2).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine, context.countDooku, context.devastator]);
        //     context.player2.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        // });

        // it('cannot be damaged by opponent ability even if you pick', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['power-of-the-dark-side'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom', 'devastator#inescapable'],
        //             groundArena: ['battlefield-marine', 'count-dooku#darth-tyranus'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.powerOfTheDarkSide);
        //     expect(context.player2).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine, context.countDooku, context.devastator]);
        //     context.player2.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        // });

        // it('cannot be damaged by opponent\'s overwhelming barrage', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['overwhelming-barrage'],
        //             groundArena: ['cassian-andor#rebellions-are-built-on-hope'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.overwhelmingBarrage);
        //     context.player1.clickCard(context.cassianAndor);
        //     context.player1.setDistributeDamagePromptState(new Map([
        //         [context.lurkingTiePhantom, 5]
        //     ]));
        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        //     expect(context.lurkingTiePhantom.damage).toBe(0);
        // });

        // it('can be defeated by Force Lightning', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['force-lightning'],
        //             groundArena: ['secretive-sage'],
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;

        //     context.player1.clickCard(context.forceLightning);
        //     expect(context.player1).toBeAbleToSelectExactly([
        //         context.lurkingTiePhantom, context.secretiveSage
        //     ]);
        //     context.player1.clickCard(context.lurkingTiePhantom);

        //     context.player1.chooseListOption('1');

        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });


        // it('is not prevented by Lurking Tie Phantom ability (indirect damage)', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             groundArena: ['first-order-stormtrooper'],
        //         },
        //         player2: {
        //             groundArena: ['wampa'],
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.firstOrderStormtrooper);
        //     context.player1.clickCard(context.wampa);

        //     context.player1.clickPrompt('Deal indirect damage to opponent');
        //     context.player2.setDistributeIndirectDamagePromptState(new Map([
        //         [context.lurkingTiePhantom, 1],
        //     ]));

        //     expect(context.lurkingTiePhantom.damage).toBe(1);

        //     context.player1.clickPrompt('Deal indirect damage to opponent');
        //     context.player2.setDistributeIndirectDamagePromptState(new Map([
        //         [context.lurkingTiePhantom, 1],
        //     ]));

        //     expect(context.lurkingTiePhantom).toBeInZone('discard');
        // });

        // it('should be immune to friendly Val\'s bounty', async function () {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             groundArena: ['wampa'],
        //         },
        //         player2: {
        //             groundArena: ['val#loyal-to-the-end'],
        //             spaceArena: ['lurking-tie-phantom'],
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.wampa);
        //     context.player1.clickCard(context.val);

        //     context.player1.clickPrompt('Opponent');
        //     context.player2.clickCard(context.lurkingTiePhantom);

        //     context.player1.clickCard(context.lurkingTiePhantom);

        //     expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
        //     expect(context.lurkingTiePhantom.damage).toBe(0);
        //     expect(context.player2).toBeActivePlayer();
        // });

        // it('can be defeated by an opponent\'s No Glory, Only Results', async function() {
        //     await contextRef.setupTestAsync({
        //         phase: 'action',
        //         player1: {
        //             hand: ['no-glory-only-results']
        //         },
        //         player2: {
        //             spaceArena: ['lurking-tie-phantom']
        //         }
        //     });

        //     const { context } = contextRef;
        //     context.player1.clickCard(context.noGloryOnlyResults);
        //     expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom]);
        //     context.player1.clickCard(context.lurkingTiePhantom);
        //     expect(context.lurkingTiePhantom).toBeInZone('discard', context.player2);
        // });
    });
});
