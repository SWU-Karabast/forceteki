describe('Maximum Firepower', function() {
    integration(function () {
        describe('Maximum Firepower\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
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
                // action play Maximum Firepower with gladiator star destroyer
                this.player1.clickCard(this.maximumFirepower);
                expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.gladiatorStarDestroyer);

                // action check for next unit selection
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer, this.firstLegionSnowtrooper]);
                this.player1.clickCard(this.wampa);

                // check game state
                expect(this.wampa.location).toBe('discard');
                expect(this.player2).toBeActivePlayer();
            });

            it('should allow two friendly Imperial units to deal damage equal to their power to a unit, one at a time', function () {
                // action play Maximum Firepower
                this.player1.clickCard(this.maximumFirepower);
                expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.deathTrooper);

                // action check where we select wampa
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer, this.firstLegionSnowtrooper]);
                this.player1.clickCard(this.wampa);

                // third action set where we select tielnfighter and check if wampa received damage
                expect(this.wampa.damage).toBe(3);
                expect(this.wampa.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.tielnFighter);

                // end game stat
                expect(this.wampa.damage).toBe(5);
                expect(this.wampa.location).toBe('ground arena');
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('Maximum Firepower\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
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
                // action play Maximum Firepower without target
                this.player1.clickCard(this.maximumFirepower);
                expect(this.maximumFirepower).toBeInLocation('discard');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});