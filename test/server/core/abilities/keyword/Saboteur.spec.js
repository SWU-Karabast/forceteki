describe('Saboteur keyword', function() {
    integration(function() {
        describe('When a unit with the Saboteur keyword attacks', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        groundArena: ['resourceful-pursuers']
                    },
                    player2: {
                        groundArena: ['echo-base-defender',
                            { card: 'wampa', upgrades: ['shield', 'shield', 'resilient'] }
                        ],
                        spaceArena: ['system-patrol-craft']
                    }
                });
            });

            it('it may bypass Sentinel', function () {
                this.player1.clickCard(this.resourcefulPursuers);
                expect(this.player1).toBeAbleToSelectExactly([this.wampa, this.echoBaseDefender, this.p2Base]);
                this.player1.clickCard(this.p2Base);
                expect(this.p2Base.damage).toBe(5);
                expect(this.resourcefulPursuers.damage).toBe(0);
                expect(this.echoBaseDefender).toBeInLocation('ground arena');
                expect(this.wampa.location).toBe('ground arena');
            });

            it('a unit with shields, the shields are defeated before the attack', function () {
                expect(this.player2.findCardByName('shield').location).toBe('ground arena');
                this.player1.clickCard(this.resourcefulPursuers);
                this.player1.clickCard(this.wampa);
                expect(this.resourcefulPursuers.damage).toBe(4);
                expect(this.echoBaseDefender).toBeInLocation('ground arena');
                expect(this.wampa.damage).toBe(5);
                expect(this.wampa).toBeInLocation('ground arena');
                expect(this.player2.findCardByName('shield').location).toBe('outside the game');
            });
        });
    });
});
