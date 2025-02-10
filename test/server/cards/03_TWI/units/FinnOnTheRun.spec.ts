describe('Finn, On the Run', function () {
    integration(function (contextRef) {
        it('Finn\'s ability should prevent 1 damage from any source to a unique unit', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['moment-of-peace', 'tarfful#kashyyyk-chieftain', 'change-of-heart'],
                    groundArena: ['finn#on-the-run', 'chewbacca#pykesbane', 'syndicate-lackeys']
                },
                player2: {
                    hand: ['daring-raid'],
                    groundArena: ['battlefield-marine', 'scout-bike-pursuer', 'maul#shadow-collective-visionary', 'dryden-vos#offering-no-escape'],
                }
            });

            const { context } = contextRef;

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);

            expect(context.player1).toBeAbleToSelectExactly([context.finn, context.chewbacca, context.maul, context.drydenVos]);
            context.player1.clickCard(context.chewbacca);

            // attack with battlefield marine, should do only 2 damage
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.chewbacca);

            expect(context.chewbacca.damage).toBe(2);

            context.setDamage(context.chewbacca, 0);
            context.player1.passAction();

            // attack on another unit, damage is not reduced
            context.player2.clickCard(context.scoutBikePursuer);
            context.player2.clickCard(context.finn);
            expect(context.finn.damage).toBe(1);

            context.player1.passAction();

            // use daring raid into yularen, should do only 1 damage
            context.player2.clickCard(context.daringRaid);
            context.player2.clickCard(context.chewbacca);
            expect(context.chewbacca.damage).toBe(1);

            // reset scout bike pursuer
            context.setDamage(context.chewbacca, 0);
            context.scoutBikePursuer.exhausted = false;
            context.setDamage(context.scoutBikePursuer, 0);

            // give yularen a shield
            context.player1.clickCard(context.momentOfPeace);
            context.player1.clickCard(context.chewbacca);

            // scout bike pursuer attack yularen, does only 1 damage which is prevented, shield is not defeated
            context.player2.clickCard(context.scoutBikePursuer);
            context.player2.clickCard(context.chewbacca);

            expect(context.player1).toHaveExactPromptButtons([
                'For this phase, if damage would be dealt to that unit, prevent 1 of that damage',
                'Defeat shield to prevent attached unit from taking damage'
            ]);
            context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');
            expect(context.chewbacca.damage).toBe(0);
            expect(context.chewbacca).toHaveExactUpgradeNames(['shield']);

            context.player1.passAction();

            // attack with dryden vos, shield is defeated after 1 damage was prevented
            context.player2.clickCard(context.drydenVos);
            context.player2.clickCard(context.chewbacca);
            context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');
            expect(context.chewbacca.damage).toBe(0);
            expect(context.chewbacca.isUpgraded()).toBeFalse();

            context.player1.moveCard(context.battlefieldMarine, 'groundArena');
            context.player2.moveCard(context.scoutBikePursuer, 'groundArena');
            context.setDamage(context.chewbacca, 0);
            context.setDamage(context.scoutBikePursuer, 0);

            context.moveToNextActionPhase();

            context.player1.passAction();

            // next action, ability should be expired
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.chewbacca);

            expect(context.chewbacca.damage).toBe(3);

            context.player1.clickCard(context.tarfful);
            context.player2.passAction();

            // trigger finn ability
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.chewbacca);

            // attack with 1 damage to chewbacca
            context.player2.clickCard(context.scoutBikePursuer);
            context.player2.clickCard(context.chewbacca);

            // no combat damage dealt, tarfful does not trigger
            expect(context.player1).toBeActivePlayer();

            // give a shield to chewbacca
            context.player1.moveCard(context.momentOfPeace, 'hand');
            context.player1.clickCard(context.momentOfPeace);
            context.player1.clickCard(context.chewbacca);
            context.player2.passAction();

            // take maul from player 2
            context.player1.clickCard(context.changeOfHeart);
            context.player1.clickCard(context.maul);

            context.player2.moveCard(context.scoutBikePursuer, 'groundArena');
            context.player2.passAction();

            // maul attack scout bike pursuer, should take 1 damage, redirect it to chewbacca and finn ability prevent it
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.scoutBikePursuer);
            context.player1.clickCard(context.chewbacca);
            context.player1.clickPrompt('For this phase, if damage would be dealt to that unit, prevent 1 of that damage');
            expect(context.chewbacca).toHaveExactUpgradeNames(['shield']);

            context.finn.exhausted = false;
            context.maul.exhausted = false;
            context.player2.passAction();

            // trigger finn ability for maul
            context.player1.clickCard(context.finn);
            context.player1.clickCard(context.p2Base);
            context.player1.clickCard(context.maul);

            context.player2.passAction();

            // maul attack battlefield marine, should take 2 damage (3-1) and redirect it to an underworld unit
            context.player1.clickCard(context.maul);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.syndicateLackeys);

            expect(context.syndicateLackeys.damage).toBe(2);
        });
    });
});
