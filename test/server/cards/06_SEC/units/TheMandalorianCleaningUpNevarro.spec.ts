describe('The Mandalorian, Cleaning Up Nevarro', function() {
    integration(function(contextRef) {
        describe('The Mandalorian, Cleaning Up Nevarro\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['the-mandalorian#cleaning-up-nevarro'],
                        groundArena: ['battlefield-marine']
                    },
                    player2: {
                        groundArena: ['wampa', 'mandalorian-warrior', 'atst', 'atat-suppressor'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    }
                });
            });

            it('may capture a unit if he attacks and defeats a unit', function () {
                const { context } = contextRef;

                // CASE 1: Mando ambush kills a unit
                context.player1.clickCard(context.theMandalorianCleaningUpNevarro);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.wampa);
                expect(context.wampa).toBeInZone('discard');
                expect(context.theMandalorianCleaningUpNevarro.damage).toBe(4);
                expect(context.player1).toBeAbleToSelectExactly([context.mandalorianWarrior, context.atst, context.atatSuppressor]);
                context.player1.clickCard(context.mandalorianWarrior);
                context.player1.clickPrompt('Done');
                expect(context.mandalorianWarrior).toBeCapturedBy(context.theMandalorianCleaningUpNevarro);
            });

            it('will not trigger if the attack does not defeat', function () {
                const { context } = contextRef;

                // CASE 2: Mando attacks and does not defeat, ability does not trigger
                context.player1.clickCard(context.theMandalorianCleaningUpNevarro);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.atst);
                expect(context.atst.damage).toBe(6);
                expect(context.theMandalorianCleaningUpNevarro.damage).toBe(6);
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.mandalorianWarrior).toBeInZone('groundArena', context.player2);
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.atatSuppressor).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('will not trigger if and enemy unit attacks Mando and dies', function () {
                const { context } = contextRef;

                // CASE 3: Enemy attacks into Mando and dies, ability doesn't trigger
                context.player1.clickCard(context.theMandalorianCleaningUpNevarro);
                context.player1.clickPrompt('Pass');
                context.player2.clickCard(context.mandalorianWarrior);
                context.player2.clickCard(context.theMandalorianCleaningUpNevarro);
                expect(context.mandalorianWarrior).toBeInZone('discard');
                expect(context.theMandalorianCleaningUpNevarro.damage).toBe(3);
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.atatSuppressor).toBeInZone('groundArena', context.player2);
                expect(context.player1).toBeActivePlayer();
                expect(context.player1).toBeAbleToSelectNoneOf([context.wampa, context.atst, context.atatSuppressor, context.lukeSkywalkerFaithfulFriend]);
            });

            it('will not trigger if the attack comes from a friendly unit', function () {
                const { context } = contextRef;

                // CASE 4: friendly unit trades with enemy unit, Mando ability does not trigger
                context.player1.clickCard(context.theMandalorianCleaningUpNevarro);
                context.player1.clickPrompt('Pass');
                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.mandalorianWarrior);
                expect(context.battlefieldMarine).toBeInZone('discard');
                expect(context.mandalorianWarrior).toBeInZone('discard');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.atatSuppressor).toBeInZone('groundArena', context.player2);
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });

            it('will not trigger if Mando dies while attacking', function () {
                const { context } = contextRef;

                // CASE 5: Mando dies while attacking, ability fizzles
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickCard(context.atatSuppressor);
                context.player2.clickPrompt('Pass');
                context.player1.clickCard(context.theMandalorianCleaningUpNevarro);
                context.player1.clickPrompt('Trigger');
                context.player1.clickCard(context.atatSuppressor);
                expect(context.theMandalorianCleaningUpNevarro).toBeInZone('discard');
                expect(context.atatSuppressor).toBeInZone('discard');
                context.player1.clickCard(context.wampa);
                context.player1.clickPrompt('Done');
                expect(context.wampa).toBeInZone('groundArena', context.player2);
                expect(context.mandalorianWarrior).toBeInZone('groundArena', context.player2);
                expect(context.atst).toBeInZone('groundArena', context.player2);
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('The Mandalorian, Cleaning Up Nevarro\'s triggered ability', function() {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        groundArena: [{ card: 'the-mandalorian#cleaning-up-nevarro', upgrades: ['vambrace-flamethrower'] }]
                    },
                    player2: {
                        groundArena: ['jawa-scavenger', 'battlefield-marine']
                    }
                });
            });

            it('will allow capture if the unit is defeated by an on-attack ability', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.theMandalorianCleaningUpNevarro);
                context.player1.clickCard(context.jawaScavenger);
                context.player1.clickPrompt('Trigger');

                // trigger flamethrower damage
                context.player1.setDistributeDamagePromptState(new Map([
                    [context.jawaScavenger, 3],
                ]));

                expect(context.jawaScavenger).toBeInZone('discard');
                expect(context.theMandalorianCleaningUpNevarro.damage).toBe(0);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine]);
                context.player1.clickCard(context.battlefieldMarine);
                context.player1.clickPrompt('Done');
                expect(context.battlefieldMarine).toBeCapturedBy(context.theMandalorianCleaningUpNevarro);
            });
        });
    });
});