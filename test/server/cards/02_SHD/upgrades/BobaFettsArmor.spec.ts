describe('Boba Fett\'s Armor', function () {
    integration(function (contextRef) {
        it('Boba Fett\'s Armor prevents 2 damage when attacked with > 2 power', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'boba-fett#disintegrator', upgrades: ['boba-fetts-armor'] }]
                }
            });

            const { context } = contextRef;

            // initial check
            expect(context.bobaFett.getPower()).toBe(5);
            expect(context.bobaFett.getHp()).toBe(7);

            // attack base and power up other unit
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.bobaFett);
            expect(context.bobaFett.damage).toBe(1);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('Boba Fett\'s Armor prevents 2 damage when attacked with 2 power and ping ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['sabine-wren#explosives-artist']
                },
                player2: {
                    leader: { card: 'boba-fett#collecting-the-bounty', upgrades: ['boba-fetts-armor'], deployed: true },
                }
            });

            const { context } = contextRef;

            // initial check
            expect(context.bobaFett.getPower()).toBe(6);
            expect(context.bobaFett.getHp()).toBe(9);

            // attack base and power up other unit
            context.player1.clickCard(context.sabineWren);
            context.player1.clickCard(context.bobaFett);
            expect(context.player1).toBeAbleToSelectExactly([context.bobaFett, context.p1Base, context.p2Base]);
            context.player1.clickCard(context.bobaFett);
            expect(context.bobaFett.damage).toBe(0);
        });

        it('Boba Fett\'s Armor prevents 2 damage from event', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine'],
                    hand: ['bombing-run'],
                },
                player2: {
                    leader: { card: 'boba-fett#daimyo', upgrades: ['boba-fetts-armor'], deployed: true },
                }
            });

            const { context } = contextRef;

            // initial check
            expect(context.bobaFett.getPower()).toBe(6);
            expect(context.bobaFett.getHp()).toBe(9);

            // play bombing run
            context.player1.clickCard(context.bombingRun);
            context.player1.clickPrompt('Ground');
            expect(context.bobaFett.damage).toBe(1);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });

        it('Boba Fett\'s Armor prevents 0 damage if not Boba Fett', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    groundArena: [{ card: 'sabine-wren#explosives-artist', upgrades: ['boba-fetts-armor'] }]
                }
            });

            const { context } = contextRef;

            // initial check
            expect(context.sabineWren.getPower()).toBe(4);
            expect(context.sabineWren.getHp()).toBe(5);

            // attack base and power up other unit
            context.player1.clickCard(context.battlefieldMarine);
            context.player1.clickCard(context.sabineWren);
            expect(context.sabineWren.damage).toBe(3);
            expect(context.battlefieldMarine).toBeInZone('discard');
        });
    });
});