describe('Gar Saxon, Viceroy of Mandalore', function() {
    integration(function(contextRef) {
        it('Gar Saxon\'s constant undeployed ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'ig11#i-cannot-be-captured', upgrades: ['shield'] }, 'wampa'],
                    leader: { card: 'gar-saxon#viceroy-of-mandalore' }
                },
                player2: {
                    groundArena: [{ card: 'rebel-pathfinder', upgrades: ['shield'] }]
                }
            });

            const { context } = contextRef;

            expect(context.ig11.getPower()).toBe(7);
            expect(context.ig11.getHp()).toBe(5);

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);
        });

        it('Gar Saxon\'s constant deployeded ability', function () {
            contextRef.setupTest({
                phase: 'action',
                player1: {
                    groundArena: [{ card: 'ig11#i-cannot-be-captured', upgrades: ['shield', 'armed-to-the-teeth'] }, 'wampa'],
                    leader: { card: 'gar-saxon#viceroy-of-mandalore', deployed: true },
                    hand: ['vanquish']
                },
                player2: {
                    groundArena: [{ card: 'rebel-pathfinder', upgrades: ['shield'] }],
                    hand: ['takedown', 'price-on-your-head', 'rivals-fall']
                }
            });

            const { context } = contextRef;

            // Check initial stat boost.
            expect(context.ig11.getPower()).toBe(9);
            expect(context.ig11.getHp()).toBe(5);

            expect(context.wampa.getPower()).toBe(4);
            expect(context.wampa.getHp()).toBe(5);

            expect(context.rebelPathfinder.getPower()).toBe(2);
            expect(context.rebelPathfinder.getHp()).toBe(3);

            // CASE 1: One of you own upgraded units is defeated.
            context.player1.clickCard(context.vanquish);
            context.player1.clickCard(context.ig11);
            expect(context.player1).toBeAbleToSelectExactly([context.armedToTheTeeth]);
            context.player1.clickCard(context.armedToTheTeeth);
            expect(context.player1.handSize).toBe(1);
            expect(context.armedToTheTeeth).toBeInZone('hand');

            // CASE 2: You opponent plays an upgrade on one of your units.
            context.player2.clickCard(context.priceOnYourHead);
            context.player2.clickCard(context.wampa);

            expect(context.wampa.getPower()).toBe(5);
            expect(context.wampa.getHp()).toBe(5);

            context.player1.passAction();

            // CASE 3: Your unit with opponent's upgrade is defeated.
            context.player2.clickCard(context.takedown);
            context.player2.clickCard(context.wampa);
            context.player2.clickPrompt('You');
            context.player2.clickPrompt('Pass');
            expect(context.player1).toBeAbleToSelectExactly([context.priceOnYourHead]);
            context.player1.clickCard(context.priceOnYourHead);
            expect(context.player2.handSize).toBe(2);
            expect(context.priceOnYourHead).toBeInZone('hand');

            // CASE 4: Gar stat boosts himself
            context.player1.clickCard(context.armedToTheTeeth);
            context.player1.clickCard(context.garSaxon);
            expect(context.garSaxon.getPower()).toBe(7);
            expect(context.garSaxon.getHp()).toBe(7);

            // CASE 5: Gar when defeated triggers on himself
            context.player2.clickCard(context.rivalsFall);
            context.player2.clickCard(context.garSaxon);
            expect(context.player1).toBeAbleToSelectExactly([context.armedToTheTeeth]);
            context.player1.clickPrompt('Pass');
            expect(context.player1.handSize).toBe(0);
            expect(context.armedToTheTeeth).toBeInZone('discard');
        });
    });
});
