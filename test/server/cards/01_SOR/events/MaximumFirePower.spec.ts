describe('Maximum Firepower', function() {
    integration(function (contextRef) {
        describe('Maximum Firepower\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['maximum-firepower'],
                        groundArena: ['death-trooper'],
                        spaceArena: ['tieln-fighter', { card: 'gladiator-star-destroyer', upgrades: ['experience'] }],
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', upgrades: ['experience'] }, 'first-legion-snowtrooper']
                    }
                });
            });

            it('should allow an Imperial unit to deal damage equal to its power to a unit, then stop if the target is defeated', function() {
                const { context } = contextRef;

                // action play Maximum Firepower with gladiator star destroyer
                context.player1.clickCard(context.maximumFirepower);
                expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.tielnFighter, context.gladiatorStarDestroyer]);
                context.player1.clickCard(context.gladiatorStarDestroyer);

                // action check for next unit selection
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.deathTrooper, context.tielnFighter, context.gladiatorStarDestroyer, context.firstLegionSnowtrooper]);
                context.player1.clickCard(context.wampa);

                // check game state
                expect(context.wampa.zoneName).toBe('discard');
                expect(context.player2).toBeActivePlayer();
            });

            it('should allow two friendly Imperial units to deal damage equal to their power to a unit, one at a time', function () {
                const { context } = contextRef;

                // action play Maximum Firepower
                context.player1.clickCard(context.maximumFirepower);
                expect(context.player1).toBeAbleToSelectExactly([context.deathTrooper, context.tielnFighter, context.gladiatorStarDestroyer]);
                context.player1.clickCard(context.deathTrooper);

                // action check where we select wampa
                expect(context.player1).toBeAbleToSelectExactly([context.wampa, context.deathTrooper, context.tielnFighter, context.gladiatorStarDestroyer, context.firstLegionSnowtrooper]);
                context.player1.clickCard(context.wampa);

                // third action set where we select tielnfighter and check if wampa received damage
                expect(context.wampa.damage).toBe(3);
                expect(context.wampa.zoneName).toBe('ground arena');
                expect(context.player1).toBeAbleToSelectExactly([context.tielnFighter, context.gladiatorStarDestroyer]);
                context.player1.clickCard(context.tielnFighter);

                // end game stat
                expect(context.wampa.damage).toBe(5);
                expect(context.wampa.zoneName).toBe('ground arena');
                expect(context.player2).toBeActivePlayer();
            });
        });

        describe('Maximum Firepower\'s ability', function () {
            beforeEach(function () {
                contextRef.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['maximum-firepower'],
                        groundArena: ['jedha-agitator'],
                    },
                    player2: {
                        groundArena: ['wampa', 'first-legion-snowtrooper']
                    }
                });
            });

            it('should not trigger if there are no friendly Imperial units', function() {
                const { context } = contextRef;

                // action play Maximum Firepower without target
                context.player1.clickCard(context.maximumFirepower);
                expect(context.maximumFirepower).toBeInZone('discard');
                expect(context.player2).toBeActivePlayer();
            });
        });
    });
});