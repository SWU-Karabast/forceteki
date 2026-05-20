describe('Foundling Rescue', function() {
    integration(function(contextRef) {
        describe('Foundling Rescue\'s ability', function () {
            beforeEach(function () {
                return contextRef.setupTestAsync({
                    phase: 'action',
                    player1: {
                        hand: ['foundling-rescue'],
                        spaceArena: ['blade-three#bane-of-the-devastator'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }],
                        leader: { card: 'grand-inquisitor#hunting-the-jedi', deployed: true, damage: 4 }
                    },
                    player2: {
                        hand: ['daring-raid', 'devastator#hunting-the-rebellion'],
                        groundArena: [{ card: 'atst', damage: 5 }, 'sabine-wren#explosives-artist', 'owen-lars#devoted-uncle'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true, damage: 6 }
                    }
                });
            });

            it('should defeat an enemy unit with 2 or less health and make a Mandalorian token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.foundlingRescue);
                expect(context.player1).toHavePrompt('Defeat a unit with 2 or less health');
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandInquisitor, context.atst, context.lukeSkywalker]);
                expect(context.player1).not.toHavePassAbilityButton();
                context.player1.clickCard(context.atst);

                expect(context.atst).toBeInZone('discard', context.player2);

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena');
                expect(mandalorians[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat a friendly unit with 2 or less health and make a Mandalorian token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.foundlingRescue);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandInquisitor, context.atst, context.lukeSkywalker]);
                context.player1.clickCard(context.battlefieldMarine);

                expect(context.battlefieldMarine).toBeInZone('discard', context.player1);

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena');
                expect(mandalorians[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat an enemy leader unit with 2 or less health and make a Mandalorian token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.foundlingRescue);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandInquisitor, context.atst, context.lukeSkywalker]);
                context.player1.clickCard(context.lukeSkywalker);

                expect(context.lukeSkywalker.deployed).toBeFalse();

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena');
                expect(mandalorians[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });

            it('should defeat a friendly leader unit with 2 or less health and make a Mandalorian token', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.foundlingRescue);
                expect(context.player1).toBeAbleToSelectExactly([context.battlefieldMarine, context.grandInquisitor, context.atst, context.lukeSkywalker]);
                context.player1.clickCard(context.grandInquisitor);

                expect(context.grandInquisitor.deployed).toBeFalse();

                const mandalorians = context.player1.findCardsByName('mandalorian');
                expect(mandalorians.length).toBe(1);
                expect(mandalorians[0]).toBeInZone('groundArena');
                expect(mandalorians[0].exhausted).toBeTrue();

                expect(context.player2).toBeActivePlayer();
            });
        });

        it('should still make a Mandalorian token even if there is nothing to defeat', async function () {
            await contextRef.setupTestAsync({
                phase: 'action',
                player1: {
                    hand: ['foundling-rescue'],
                    groundArena: ['battlefield-marine']
                },
                player2: {
                    hand: ['daring-raid', 'devastator#hunting-the-rebellion'],
                }
            });
            const { context } = contextRef;

            context.player1.clickCard(context.foundlingRescue);

            const mandalorians = context.player1.findCardsByName('mandalorian');
            expect(mandalorians.length).toBe(1);
            expect(mandalorians[0]).toBeInZone('groundArena');
            expect(mandalorians[0].exhausted).toBeTrue();

            expect(context.player2).toBeActivePlayer();
        });
    });
});