describe('Lurking TIE Phantom', function() {
    integration(function(contextRef) {
        it('Lurking TIE Phantom\'s ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['cassian-andor#rebellions-are-built-on-hope', 'fifth-brother#fear-hunter'],
                    spaceArena: ['punishing-one#dengars-jumpmaster'],
                    hand: ['relentless-pursuit', 'daring-raid', 'imperial-interceptor', 'takedown', 'make-an-opening',
                        'devastating-gunship', 'power-of-the-dark-side', 'mercenary-gunship', 'overwhelming-barrage', 'force-lightning'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: false },
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['lurking-tie-phantom'],
                    hand: ['open-fire', 'rivals-fall', 'devastator#inescapable', 'count-dooku#darth-tyranus'],
                }
            });

            const { context } = contextRef;

            // Case 1: Cannot be captured by enemeny effects
            context.player1.clickCard(context.relentlessPursuit);
            expect(context.player1).toBeAbleToSelectExactly([context.cassianAndor, context.punishingOne, context.fifthBrother]);
            context.player1.clickCard(context.cassianAndor);
            expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine]);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');

            context.player2.passAction();

            // Case 2: can be defated/damaged from attack
            context.player1.clickCard(context.punishingOne);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('discard');

            context.player2.moveCard(context.lurkingTiePhantom, 'spaceArena');
            context.player2.passAction();

            // Case 3: Cannot be damaged by oppenent's event
            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.lurkingTiePhantom.damage).toBe(0);

            context.player2.passAction();

            // Case 4: Cannot be damaged by enemy unit ability
            context.player1.clickCard(context.imperialInterceptor);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.lurkingTiePhantom.damage).toBe(0);

            context.player2.passAction();

            // Case 5: Cannot be defeated by opponent's event that says defeat
            context.player1.clickCard(context.takedown);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');

            context.player2.passAction();
            context.player1.setResourceCount(12);
            context.setDamage(context.battlefieldMarine, 1);

            // Case 6: Cannot be defeated by opponent's unit that says defeat
            context.player1.clickCard(context.devastatingGunship);
            expect(context.player1).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine]);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');

            context.player2.passAction();
            context.player1.setResourceCount(6);

            // Case 7: Can be defeated by state based effects
            context.player1.clickCard(context.makeAnOpening);
            context.player1.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('discard');

            context.player2.moveCard(context.lurkingTiePhantom, 'spaceArena');

            // Case 8: Can be damaged by your own event
            context.player2.clickCard(context.openFire);
            context.player2.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('discard');

            context.player2.moveCard(context.lurkingTiePhantom, 'spaceArena');
            context.player1.passAction();

            // Case 9: Can be defeated by your own event
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('discard');

            context.player2.moveCard(context.lurkingTiePhantom, 'spaceArena');
            context.player1.passAction();
            context.player2.setResourceCount(14);

            // Case 10: Can be damaged by your own unit ability
            context.player2.clickCard(context.devastator);
            context.player2.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('discard');

            context.player2.moveCard(context.lurkingTiePhantom, 'spaceArena');
            context.player1.passAction();
            context.player2.setResourceCount(14);

            // Case 11: Can be defeated by your own unit that says defeat
            context.player2.clickCard(context.countDooku);
            context.player2.clickPrompt('Defeat a unit with 4 or less remaining HP');
            context.player2.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('discard');

            context.player2.moveCard(context.lurkingTiePhantom, 'spaceArena');
            context.player1.setResourceCount(14);

            // Case 12: Can not be defeated opponent event even if you pick
            context.player1.clickCard(context.powerOfTheDarkSide);
            expect(context.player2).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine, context.countDooku, context.devastator]);
            context.player2.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');

            context.player2.passAction();

            // Case 13: Can not be damaged by opponent ability even if you pick
            context.player1.clickCard(context.mercenaryGunship);
            context.player1.clickPrompt('Exhaust this leader');
            expect(context.player2).toBeAbleToSelectExactly([context.lurkingTiePhantom, context.battlefieldMarine, context.countDooku, context.devastator]);
            context.player2.clickCard(context.lurkingTiePhantom);
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.lurkingTiePhantom.damage).toBe(0);

            context.player2.passAction();
            context.player1.setResourceCount(14);

            // Case 14: Can not be damaged by opponent's overwhelming barrage
            context.player1.clickCard(context.overwhelmingBarrage);
            context.player1.clickCard(context.cassianAndor);
            context.player1.setDistributeDamagePromptState(new Map([
                [context.lurkingTiePhantom, 5]
            ]));
            expect(context.lurkingTiePhantom).toBeInZone('spaceArena');
            expect(context.lurkingTiePhantom.damage).toBe(0);

            context.player2.passAction();
            context.player1.setResourceCount(14);

            // Case 15: Can be damaged by opponent's force lightning
            // TODO Force Lightning currently not implemented
        });

        it('Lurking TIE Phantom should be immune to friendly Val\'s bounty', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['wampa'],
                },
                player2: {
                    groundArena: ['val#loyal-to-the-end'],
                    spaceArena: ['lurking-tie-phantom'],
                }
            });

            const { context } = contextRef;

            // kill val
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.val);

            // opponent give 2 experiences
            context.player1.clickPrompt('Opponent');
            context.player2.clickCard(context.lurkingTiePhantom);

            // collect bounty and try to deal 3 damage to Val
            context.player1.clickCard(context.lurkingTiePhantom);

            expect(context.lurkingTiePhantom.damage).toBe(0);
            expect(context.player2).toBeActivePlayer();
        });
    });
});
