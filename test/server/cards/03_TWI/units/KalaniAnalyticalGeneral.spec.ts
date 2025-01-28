describe('Kalani Analytical General ability\'s', function() {
    integration(function(contextRef) {
        it('Should, on attack, give +2/+2 to other units', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['yoda#old-master'],
                    groundArena: ['kalani#analytical-general', 'specforce-soldier', 'battlefield-marine'],
                    hasInitiative: true,
                },
                player2: {
                    groundArena: ['plo-koon#kohtoyah'],
                }
            });

            const { context } = contextRef;

            // We have initiative, so we can select 2 units to give +2/+2
            context.player1.clickCard(context.kalani);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.specforceSoldier, context.ploKoon]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickCard(context.specforceSoldier);
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCardNonChecking(context.ploKoon);
            context.player1.clickPrompt('Done');
            expect(context.specforceSoldier.getHp()).toBe(4);
            expect(context.specforceSoldier.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(5);
            expect(context.battlefieldMarine.getPower()).toBe(5);
            expect(context.kalani.getHp()).toBe(7);
            expect(context.kalani.getPower()).toBe(5);

            context.player2.clickCard(context.ploKoon);
            context.player2.clickCard(context.battlefieldMarine);
            expect(context.battlefieldMarine.damage).toBe(3);
            expect(context.ploKoon.damage).toBe(5);

            context.player1.clickCard(context.yoda);
            context.player2.claimInitiative();
            context.moveToNextActionPhase();

            // At the end of the phase the +2/+2 buff should be removed
            expect(context.battlefieldMarine).toBeInZone('discard');
            expect(context.specforceSoldier.getHp()).toBe(2);
            expect(context.specforceSoldier.getPower()).toBe(2);

            expect(context.player2).toBeActivePlayer();
            context.player2.passAction();

            // 2nd kalani's attack without initiative, should be able to select only 1 unit
            context.player1.clickCard(context.kalani);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly([context.specforceSoldier, context.ploKoon, context.yoda]);
            context.player1.clickCard(context.ploKoon);
            context.player1.clickCardNonChecking(context.specforceSoldier);
            context.player1.clickCardNonChecking(context.yoda);
            context.player1.clickPrompt('Done');
            expect(context.ploKoon.getHp()).toBe(8);
            expect(context.ploKoon.getPower()).toBe(5);
            expect(context.ploKoon.damage).toBe(5);
            expect(context.specforceSoldier.getHp()).toBe(2);
            expect(context.specforceSoldier.getPower()).toBe(2);

            context.player2.clickCard(context.ploKoon);
            context.player2.clickCard(context.specforceSoldier);
            expect(context.ploKoon.damage).toBe(7);
            expect(context.specforceSoldier).toBeInZone('discard');
            context.moveToNextActionPhase();

            expect(context.ploKoon).toBeInZone('discard');
            context.player2.passAction();

            // 3rd kalani's attack we can select no unit
            context.player1.clickCard(context.kalani);
            context.player1.clickCard(context.p2Base);
            expect(context.player1).toBeAbleToSelectExactly([context.yoda]);
            expect(context.player1).toHaveChooseNoTargetButton();
            context.player1.clickPrompt('Done');
            expect(context.yoda.getHp()).toBe(4);
            expect(context.yoda.getPower()).toBe(2);
        });
    });
});
