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

            it('the player should be prompted to choose a copy to defeat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chopperInHand);

                // prompt for defeat step
                expect(context.player1).toHavePrompt('Choose which copy of Chopper, Metal Menace to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.chopperInHand, context.chopperInPlay]);
                expect(context.chopperInHand).toBeInLocation('ground arena');
                expect(context.chopperInPlay).toBeInLocation('ground arena');

                // defeat resolves
                context.player1.clickCard(context.chopperInPlay);
                expect(context.chopperInHand).toBeInLocation('ground arena');
                expect(context.chopperInPlay).toBeInLocation('discard');
                expect(context.p2Chopper).toBeInLocation('ground arena');
                expect(context.player2).toBeActivePlayer();
            });

            it('the player should be able to defeat either copy', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.chopperInHand);

                // prompt for defeat step
                expect(context.player1).toHavePrompt('Choose which copy of Chopper, Metal Menace to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.chopperInHand, context.chopperInPlay]);
                expect(context.chopperInHand).toBeInLocation('ground arena');
                expect(context.chopperInPlay).toBeInLocation('ground arena');

                // choose other copy this time, defeat resolves
                context.player1.clickCard(context.chopperInHand);
                expect(context.chopperInPlay).toBeInLocation('ground arena');
                expect(context.chopperInHand).toBeInLocation('discard');
                expect(context.p2Chopper).toBeInLocation('ground arena');
                expect(context.player2).toBeActivePlayer();
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

            it('the player should be prompted to choose a copy to defeat', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.lightsaberInHand);
                context.player1.clickCard(context.battlefieldMarine);

                // prompt for defeat step
                expect(context.player1).toHavePrompt('Choose which copy of Luke\'s Lightsaber to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.lightsaberInHand, context.lightsaberInPlay]);
                expect(context.lightsaberInHand).toBeInLocation('ground arena');
                expect(context.lightsaberInPlay).toBeInLocation('ground arena');

                // defeat resolves
                context.player1.clickCard(context.lightsaberInPlay);
                expect(context.lightsaberInHand).toBeInLocation('ground arena');
                expect(context.lightsaberInPlay).toBeInLocation('discard');
                expect(context.p2Lightsaber).toBeInLocation('ground arena');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a card is played that matches the title but not the subtitle of another card in play for the same controller,', function() {
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

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a duplicate of a unique card is played that triggers its own ability on play,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['colonel-yularen#isb-director'],
                        groundArena: ['colonel-yularen#isb-director'],
                        base: { card: 'nevarro-city', damage: 3 }
                    },
                    player2: {
                    }
                });

                const { context } = contextRef;
                const p1Yularens = context.player1.findCardsByName('colonel-yularen#isb-director');
                context.yularenInHand = p1Yularens.find((yularen) => yularen.location === 'hand');
                context.yularenInPlay = p1Yularens.find((yularen) => yularen.location === 'ground arena');
            });

            it('the trigger should happen twice', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.yularenInHand);

                // prompt for defeat step
                expect(context.player1).toHavePrompt('Choose which copy of Colonel Yularen, ISB Director to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.yularenInHand, context.yularenInPlay]);
                expect(context.yularenInHand).toBeInLocation('ground arena');
                expect(context.yularenInPlay).toBeInLocation('ground arena');

                // defeat resolves
                context.player1.clickCard(context.yularenInPlay);
                expect(context.yularenInHand).toBeInLocation('ground arena');
                expect(context.yularenInPlay).toBeInLocation('discard');

                // triggered ability from both copies of Yularen
                expect(context.player1).toHaveExactPromptButtons(['Heal 1 damage from your base', 'Heal 1 damage from your base']);
                context.player1.clickPrompt('Heal 1 damage from your base');
                expect(context.p1Base.damage).toBe(1);

                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('When a duplicate of a unique card with an ongoing effect is played,', function() {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['supreme-leader-snoke#shadow-ruler'],
                        groundArena: ['supreme-leader-snoke#shadow-ruler']
                    },
                    player2: {
                        groundArena: ['cell-block-guard']
                    }
                });

                const { context } = contextRef;
                const p1Snokes = context.player1.findCardsByName('supreme-leader-snoke#shadow-ruler');
                context.snokeInHand = p1Snokes.find((snoke) => snoke.location === 'hand');
                context.snokeInPlay = p1Snokes.find((snoke) => snoke.location === 'ground arena');
            });

            it('the ongoing effects should never be active at the same time if the copy in play is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.snokeInHand);

                // prompt for defeat step
                expect(context.player1).toHavePrompt('Choose which copy of Supreme Leader Snoke, Shadow Ruler to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.snokeInHand, context.snokeInPlay]);
                expect(context.snokeInHand).toBeInLocation('ground arena');
                expect(context.snokeInPlay).toBeInLocation('ground arena');

                // defeat resolves
                context.player1.clickCard(context.snokeInPlay);
                expect(context.snokeInHand).toBeInLocation('ground arena');
                expect(context.snokeInPlay).toBeInLocation('discard');

                // Cell block guard should still be alive since the -2/-2 effects never stacked
                expect(context.cellBlockGuard).toBeInLocation('ground arena');
            });

            it('the ongoing effects should never be active at the same time if the copy from hand is defeated', function () {
                const { context } = contextRef;

                context.player1.clickCard(context.snokeInHand);

                // prompt for defeat step
                expect(context.player1).toHavePrompt('Choose which copy of Supreme Leader Snoke, Shadow Ruler to defeat');
                expect(context.player1).toBeAbleToSelectExactly([context.snokeInHand, context.snokeInPlay]);
                expect(context.snokeInHand).toBeInLocation('ground arena');
                expect(context.snokeInPlay).toBeInLocation('ground arena');

                // defeat resolves
                context.player1.clickCard(context.snokeInHand);
                expect(context.snokeInPlay).toBeInLocation('ground arena');
                expect(context.snokeInHand).toBeInLocation('discard');

                // Cell block guard should still be alive since the -2/-2 effects never stacked
                expect(context.cellBlockGuard).toBeInLocation('ground arena');
            });
        });
    });
});
