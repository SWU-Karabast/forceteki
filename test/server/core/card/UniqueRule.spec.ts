describe('Uniqueness rule', function() {
    integration(function(contextRef) {
        describe('When another copy of a unique unit in play enters play for the same controller,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['chopper#metal-menace'],
                        groundArena: ['chopper#metal-menace'],
                    },
                    player2: {
                        groundArena: ['chopper#metal-menace']
                    }
                });

                const { context } = contextRef;
                const p1Choppers = context.player1.findCardsByName('chopper#metal-menace');
                context.chopperInHand = p1Choppers.find((chopper) => chopper.location === 'hand');
                context.chopperInPlay = p1Choppers.find((chopper) => chopper.location === 'ground arena');
                context.p2Chopper = context.player2.findCardByName('chopper#metal-menace');
            });

            it('the copy already in play should be defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chopperInHand);
                expect(context.chopperInHand).toBeInLocation('ground arena');
                expect(context.chopperInPlay).toBeInLocation('discard');
                expect(context.p2Chopper).toBeInLocation('ground arena');
            });
        });

        describe('When another copy of a unique upgrade in play enters play for the same controller,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['lukes-lightsaber'],
                        groundArena: [{ card: 'wampa', upgrades: ['lukes-lightsaber'] }, 'battlefield-marine'],
                    },
                    player2: {
                        groundArena: [{ card: 'wild-rancor', upgrades: ['lukes-lightsaber'] }]
                    }
                });

                const { context } = contextRef;
                const p1Lightsabers = context.player1.findCardsByName('lukes-lightsaber');
                context.lightsaberInHand = p1Lightsabers.find((lightsaber) => lightsaber.location === 'hand');
                context.lightsaberInPlay = p1Lightsabers.find((lightsaber) => lightsaber.location === 'ground arena');
                context.p2Lightsaber = context.player2.findCardByName('lukes-lightsaber');
            });

            it('the copy already in play should be defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lightsaberInHand);
                context.player1.clickCard(context.battlefieldMarine);
                expect(context.lightsaberInHand).toBeInLocation('ground arena');
                expect(context.lightsaberInPlay).toBeInLocation('discard');
                expect(context.p2Lightsaber).toBeInLocation('ground arena');
            });
        });

        describe('When a card is played that matches only the title of another card in play for the same controller,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['luke-skywalker#jedi-knight'],
                        leader: { card: 'luke-skywalker#faithful-friend', deployed: true }
                    },
                    player2: {
                    }
                });
            });

            it('both should stay on the field', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lukeSkywalkerJediKnight);
                expect(context.lukeSkywalkerJediKnight).toBeInLocation('ground arena');
                expect(context.lukeSkywalkerFaithfulFriend).toBeInLocation('ground arena');
            });
        });
    });
});
