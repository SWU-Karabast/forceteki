describe('Chancellor Palpatine Wartime Chancellor', function() {
    integration(function(contextRef) {
        it('Chancellor Palpatine\'s ability should ready token units we create', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['captain-rex#lead-by-example', 'daring-raid', 'kraken#confederate-tactician', 'dedicated-wingmen', 'kijimi-patrollers'],
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
            for (const trooper of cloneTroopers) {
                expect(trooper.exhausted).toBeFalse();
            }

            context.player2.passAction();

            // Not unit left play this phase, so no clone trooper should be created
            context.player1.clickCard(context.chancellorPalpatine);
            context.player1.clickCard(context.p2Base);
            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(2);
            for (const trooper of cloneTroopers) {
                expect(trooper.exhausted).toBeFalse();
            }

            // If unit left play Palpatine attack should create a clone trooper
            context.moveToNextActionPhase();
            context.player1.passAction();
            context.player2.clickCard(context.battlefieldMarine);
            context.player2.clickCard(context.aggrievedParliamentarian);
            context.player1.clickCard(context.chancellorPalpatine);
            context.player1.clickCard(context.p2Base);

            cloneTroopers = context.player1.findCardsByName('clone-trooper');
            expect(cloneTroopers.length).toBe(3);
            for (const trooper of cloneTroopers) {
                expect(trooper.exhausted).toBeFalse();
            }

            // Even if it's an opponent unit that left play, we should still create a clone trooper
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
            for (const droid of opponentBattleDroids) {
                expect(droid.exhausted).toBeTrue();
            }

            // Even battle droids played by chancellor palpatine controller should enter play ready
            context.player1.clickCard(context.kraken);
            const controllerBattleDroids = context.player1.findCardsByName('battle-droid');
            expect(controllerBattleDroids.length).toBe(2);
            for (const droid of controllerBattleDroids) {
                expect(droid.exhausted).toBeFalse();
            }

            // Not token units should not enter play ready
            expect(context.kraken.exhausted).toBeTrue();

            context.player2.passAction();

            // token unit from set 4 should enters ready too
            context.player1.clickCard(context.dedicatedWingmen);
            const controllerXwings = context.player1.findCardsByName('xwing');
            expect(controllerXwings.length).toBe(2);
            for (const xwing of controllerXwings) {
                expect(xwing.exhausted).toBeFalse();
            }

            context.player2.passAction();

            // token unit from set 4 should enters ready too
            context.player1.clickCard(context.kijimiPatrollers);
            const controllerTieFighter = context.player1.findCardByName('tie-fighter');
            expect(controllerTieFighter.exhausted).toBeFalse();
        });

        it('Chancellor Palpatine\'s ability should not ready token units created for the opponent', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['the-clone-wars'],
                    groundArena: ['chancellor-palpatine#wartime-chancellor'],
                },
            });

            const { context } = contextRef;

            context.player1.clickCard(context.theCloneWars);
            context.player1.chooseListOption('2');

            const cloneTroopers = context.player1.findCardsByName('clone-trooper');
            const battleDroids = context.player2.findCardsByName('battle-droid');
            expect(cloneTroopers.length).toBe(2);
            expect(battleDroids.length).toBe(2);
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.ready)).toBeTrue();
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
        });
    });
});
