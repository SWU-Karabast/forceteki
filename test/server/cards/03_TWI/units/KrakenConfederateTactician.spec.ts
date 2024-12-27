describe('Kraken Confederate Tactician', function () {
    integration(function (contextRef) {
        it('Kraken Confederate Tactician\'s ability create 2 battle droid tokens when played and should give +1/+1 to friendly tokens unit on attack', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    hand: ['drop-in', 'kraken#confederate-tactician'],
                    groundArena: ['clone-trooper'],
                },
                player2: {
                    groundArena: ['battlefield-marine', 'battle-droid'],
                }
            });

            const { context } = contextRef;

            // We play Kraken, it creates 2 battle droids
            context.player1.clickCard(context.kraken);

            let battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.length).toBe(2);
            expect(battleDroids).toAllBeInZone('groundArena');
            expect(battleDroids.every((battleDroid) => battleDroid.exhausted)).toBeTrue();
            expect(battleDroids.every((battleDroid) => battleDroid.getHp() === 1)).toBeTrue();
            expect(battleDroids.every((battleDroid) => battleDroid.getPower() === 1)).toBeTrue();
            context.moveToNextActionPhase();

            // Kraken attack gives +1/+1 to all friendly tokens
            context.player1.clickCard(context.kraken);
            context.player1.clickCard(context.p2Base);
            const cloneTrooper = context.player1.findCardByName('clone-trooper');
            expect(cloneTrooper.getPower()).toBe(3);
            expect(cloneTrooper.getHp()).toBe(3);

            // Opponent's token units are not impacted
            const opponentBattleDroids = context.player2.findCardByName('battle-droid');
            expect(opponentBattleDroids.getPower()).toBe(1);
            expect(opponentBattleDroids.getHp()).toBe(1);

            battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.every((battleDroid) => battleDroid.getHp() === 2)).toBeTrue();
            expect(battleDroids.every((battleDroid) => battleDroid.getPower() === 2)).toBeTrue();

            context.player2.clickCard('battlefield-marine');
            context.player2.clickCard(cloneTrooper);

            // But newly created token units are not impacted
            context.player1.clickCard(context.dropIn);
            const cloneTroopers = context.player1.findCardsByName('clone-trooper').filter((cloneTrooper) => cloneTrooper.zoneName === 'groundArena');
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.getPower() === 2)).toBeTrue();
            expect(cloneTroopers.every((cloneTrooper) => cloneTrooper.getHp() === 2)).toBeTrue();

            // It remains active for the battle droids
            battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.every((battleDroid) => battleDroid.getPower() === 2)).toBeTrue();
            expect(battleDroids.every((battleDroid) => battleDroid.getHp() === 2)).toBeTrue();

            // It stops at the end of the phase
            context.moveToNextActionPhase();
            battleDroids = context.player1.findCardsByName('battle-droid');
            expect(battleDroids.every((battleDroid) => battleDroid.getPower() === 1)).toBeTrue();
            expect(battleDroids.every((battleDroid) => battleDroid.getHp() === 1)).toBeTrue();
        });
    });
});
