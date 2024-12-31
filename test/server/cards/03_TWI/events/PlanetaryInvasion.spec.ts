describe('Planetary Invasion', function () {
    integration(function (contextRef) {
        it('Planetary Invasion\'s ability should ready and give +1/+0 and Overwhelm (for the phase) to up to 3 units', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['planetary-invasion'],
                    groundArena: [
                        { card: 'battlefield-marine', exhausted: true },
                        'wampa',
                        { card: 'atst', exhausted: true },
                    ]
                },
                player2: {
                    groundArena: ['specforce-soldier', 'battle-droid', 'clone-trooper']
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.planetaryInvasion);
            context.player1.clickPrompt('Play Planetary Invasion');
            expect(context.player1).toBeAbleToSelectExactly([
                context.battlefieldMarine,
                context.wampa,
                context.atst,
                context.specforceSoldier,
                context.battleDroid,
                context.cloneTrooper
            ]);
            expect(context.player1).toHaveChooseNoTargetButton();

            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.wampa);
            context.player1.clickCard(context.specforceSoldier);
            context.player1.clickCardNonChecking(context.atst);
            context.player1.clickPrompt('Done');

            expect(context.battlefieldMarine.exhausted).toBeFalse();
            expect(context.battlefieldMarine.getPower()).toBe(4);
            expect(context.battlefieldMarine.getHp()).toBe(3);

            expect(context.atst.exhausted).toBeTrue();
            expect(context.atst.getPower()).toBe(6);
            expect(context.atst.getHp()).toBe(7);

            expect(context.wampa.getPower()).toBe(5);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.specforceSoldier.getPower()).toBe(3);
            expect(context.specforceSoldier.getHp()).toBe(2);

            // test Overwhelm
            context.player2.passAction();
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.battleDroid);
            expect(context.p2Base.damage).toBe(3);

            // move to next phase and confirm the effects have fallen off
            context.moveToNextActionPhase();

            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.specforceSoldier.getPower()).toBe(2);
            expect(context.specforceSoldier.getHp()).toBe(2);

            // check Overwhelm is gone
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.cloneTrooper);
            expect(context.p2Base.damage).toBe(3);
        });
    });
});
