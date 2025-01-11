describe('Chancellor Palpatine Wartime Chancellor', function() {
    integration(function(contextRef) {
        it('Chancellor Palpatine\'s ability should ready token units we create', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['captain-rex#lead-by-example', 'daring-raid', 'kraken#confederate-tactician'],
                    groundArena: ['chancellor-palpatine#wartime-chancellor', 'aggrieved-parliamentarian'],
                },
                player2: {
                    hand: ['droid-deployment'],
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['vanguard-droid-bomber']

                }
            });

            const { context } = contextRef;

            // Clone troopers should enter play ready
            context.player1.clickCard(context.captainRex);
            let cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.ready)).toBeTrue();

            context.player2.passAction();
            context.player1.clickCard(context.chancellorPalpatine);
            context.player1.clickCard(context.p2Base);

            // Not unit left play this phase, so no clone trooper should be created
            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.ready)).toBeTrue();

            // If unit left play Palpatine attack should create a clone trooper
            context.moveToNextActionPhase();
            context.player1.passAction();
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.aggrievedParliamentarian);
            context.player1.clickCard(context.chancellorPalpatine);
            context.player1.clickCard(context.p2Base);

            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(3);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.ready)).toBeTrue();

            // Even if it's an opponent unit
            context.moveToNextActionPhase();
            context.player1.clickCard(context.daringRaid);
            context.player1.clickCard(context.vanguardDroidBomber);
            context.player2.passAction();
            context.player1.clickCard(context.chancellorPalpatine);
            context.player1.clickCard(context.battlefieldMarine);
            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(4);

            // let's make sure we do not look at units that left play during previous phases
            context.moveToNextActionPhase();
            context.player1.clickCard(context.chancellorPalpatine);
            context.player1.clickCard(context.p2Base);
            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(4);

            // Opponent token units should not enter play ready
            context.player2.clickCard(context.droidDeployment);
            const opponentBattleDroids = context.player2.findCardsByName('battle-droid');
            expect(opponentBattleDroids.length).toBe(2);
            expect(opponentBattleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();

            // Even battle droids played by chancellor palpatine controller should enter play ready
            context.player1.clickCard(context.kraken);
            const controllerBattleDroids = context.player1.findCardsByName('battle-droid');
            expect(controllerBattleDroids.length).toBe(2);
            expect(controllerBattleDroids.every((battleDroid) => battleDroid.ready)).toBeTrue();
        });
    });
});
