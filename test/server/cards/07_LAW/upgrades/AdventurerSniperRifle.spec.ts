describe('Adventurer Sniper Rifle', function() {
    integration(function(contextRef) {
        it('Adventurer Sniper Rifle\'s ability should attach to a non-vehicle unit and give it the ability to exhaust to make an undamaged enemy non-leader ground units printed HP 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['adventurer-sniper-rifle'],
                    groundArena: ['rebel-pathfinder', 'wampa', { card: 'atst', damage: 2 }],
                    spaceArena: ['awing'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.adventurerSniperRifle);

            // cannot target vehicle unit
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa, context.battlefieldMarine, context.cadBane, context.grandInquisitor]);

            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Choose an undamaged non-leader ground unit. Its printed HP is considered to be 1 for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.battlefieldMarine);

            expect(context.battlefieldMarine.getHp()).toBe(1);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.cadBane.getHp()).toBe(8);
            expect(context.cadBane.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.atst.getHp()).toBe(7);
            expect(context.atst.getPower()).toBe(6);
            expect(context.awing.getHp()).toBe(2);
            expect(context.awing.getPower()).toBe(1);
            expect(context.grandInquisitor.getHp()).toBe(6);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.cartelSpacer.getHp()).toBe(3);
            expect(context.cartelSpacer.getPower()).toBe(2);

            context.player2.clickPrompt('Claim initiative');
            context.player1.passAction();

            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.cadBane.getHp()).toBe(8);
            expect(context.cadBane.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.atst.getHp()).toBe(7);
            expect(context.atst.getPower()).toBe(6);
            expect(context.awing.getHp()).toBe(2);
            expect(context.awing.getPower()).toBe(1);
            expect(context.grandInquisitor.getHp()).toBe(6);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.cartelSpacer.getHp()).toBe(3);
            expect(context.cartelSpacer.getPower()).toBe(2);
        });

        it('Adventurer Sniper Rifle\'s ability should attach to a non-vehicle unit and give it the ability to exhaust to make an undamaged friendly non-leader ground units printed HP 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['adventurer-sniper-rifle'],
                    groundArena: ['rebel-pathfinder', 'wampa', { card: 'atst', damage: 2 }],
                    spaceArena: ['awing'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.adventurerSniperRifle);

            // cannot target vehicle unit
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa, context.battlefieldMarine, context.cadBane, context.grandInquisitor]);

            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Choose an undamaged non-leader ground unit. Its printed HP is considered to be 1 for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.rebelPathfinder);

            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.cadBane.getHp()).toBe(8);
            expect(context.cadBane.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.rebelPathfinder.getHp()).toBe(1);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.atst.getHp()).toBe(7);
            expect(context.atst.getPower()).toBe(6);
            expect(context.awing.getHp()).toBe(2);
            expect(context.awing.getPower()).toBe(1);
            expect(context.grandInquisitor.getHp()).toBe(6);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.cartelSpacer.getHp()).toBe(3);
            expect(context.cartelSpacer.getPower()).toBe(2);

            context.player2.clickPrompt('Claim initiative');
            context.player1.passAction();

            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.cadBane.getHp()).toBe(8);
            expect(context.cadBane.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.atst.getHp()).toBe(7);
            expect(context.atst.getPower()).toBe(6);
            expect(context.awing.getHp()).toBe(2);
            expect(context.awing.getPower()).toBe(1);
            expect(context.grandInquisitor.getHp()).toBe(6);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.cartelSpacer.getHp()).toBe(3);
            expect(context.cartelSpacer.getPower()).toBe(2);
        });

        it('Adventurer Sniper Rifle\'s ability should attach to a non-vehicle unit and give it the ability to exhaust to make its own printed HP 1', async function() {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['adventurer-sniper-rifle'],
                    groundArena: ['rebel-pathfinder', 'wampa', { card: 'atst', damage: 2 }],
                    spaceArena: ['awing'],
                    leader: { card: 'cad-bane#he-who-needs-no-introduction', deployed: true }
                },
                player2: {
                    groundArena: ['battlefield-marine'],
                    spaceArena: ['cartel-spacer'],
                    leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true }
                }
            });

            const { context } = contextRef;

            context.player1.clickCard(context.adventurerSniperRifle);

            // cannot target vehicle unit
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa, context.battlefieldMarine, context.cadBane, context.grandInquisitor]);

            context.player1.clickCard(context.wampa);

            context.player2.passAction();

            context.player1.clickCard(context.wampa);
            context.player1.clickPrompt('Choose an undamaged non-leader ground unit. Its printed HP is considered to be 1 for this phase');
            expect(context.player1).toBeAbleToSelectExactly([context.rebelPathfinder, context.wampa, context.battlefieldMarine]);
            context.player1.clickCard(context.wampa);

            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.cadBane.getHp()).toBe(8);
            expect(context.cadBane.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(1);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.atst.getHp()).toBe(7);
            expect(context.atst.getPower()).toBe(6);
            expect(context.awing.getHp()).toBe(2);
            expect(context.awing.getPower()).toBe(1);
            expect(context.grandInquisitor.getHp()).toBe(6);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.cartelSpacer.getHp()).toBe(3);
            expect(context.cartelSpacer.getPower()).toBe(2);

            context.player2.clickPrompt('Claim initiative');
            context.player1.passAction();

            expect(context.battlefieldMarine.getHp()).toBe(3);
            expect(context.battlefieldMarine.getPower()).toBe(3);
            expect(context.cadBane.getHp()).toBe(8);
            expect(context.cadBane.getPower()).toBe(2);
            expect(context.wampa.getHp()).toBe(5);
            expect(context.wampa.getPower()).toBe(4);
            expect(context.rebelPathfinder.getHp()).toBe(3);
            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.atst.getHp()).toBe(7);
            expect(context.atst.getPower()).toBe(6);
            expect(context.awing.getHp()).toBe(2);
            expect(context.awing.getPower()).toBe(1);
            expect(context.grandInquisitor.getHp()).toBe(6);
            expect(context.grandInquisitor.getPower()).toBe(3);
            expect(context.cartelSpacer.getHp()).toBe(3);
            expect(context.cartelSpacer.getPower()).toBe(2);
        });
    });
});