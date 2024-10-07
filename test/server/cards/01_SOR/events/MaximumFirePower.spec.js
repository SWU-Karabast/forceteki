describe('Maximum Firepower', function() {
    integration(function () {
        describe('Maximum Firepower\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['maximum-firepower'],
                        groundArena: ['death-trooper'],
                        spaceArena: ['tieln-fighter', 'gladiator-star-destroyer'],
                    },
                    player2: {
                        groundArena: ['wampa']
                    }
                });
            });

            it('should defeat wampa when picking Gladiator Stardestroyer first', function() {
                // action play Maximum Firepower with gladiator star destroyer
                this.player1.clickCard(this.maximumFirepower);
                expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.gladiatorStarDestroyer);

                // action check for next unit selection
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.wampa);

                // check game state
                expect(this.wampa.location).toBe('discard');
                expect(this.player2).toBeActivePlayer();
            });

            it('should deal 5 damage to wampa and friendly units aren\'t exhausted', function () {
                // action play Maximum Firepower
                this.player1.clickCard(this.maximumFirepower);
                expect(this.player1).toBeAbleToSelectExactly([this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.deathTrooper);

                // action check where we select wampa
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.deathTrooper, this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.wampa);

                // third action set where we select tielnfighter and check if wampa received damage
                expect(this.wampa.damage).toBe(3);
                expect(this.wampa.location).toBe('ground arena');
                expect(this.player1).toBeAbleToSelectExactly([this.tielnFighter, this.gladiatorStarDestroyer]);
                this.player1.clickCard(this.tielnFighter);

                // end game stat
                expect(this.wampa.location).toBe('discard');
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
                        groundArena: ['wampa']
                    }
                });
            });

            it('should not trigger', function() {
                // action play Maximum Firepower without target
                this.player1.clickCard(this.maximumFirepower);
                expect(this.maximumFirepower).toBeInLocation('discard');
                expect(this.player2).toBeActivePlayer();
            });
        });
    });
});