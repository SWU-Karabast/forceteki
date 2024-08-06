describe('Fields of Rolling Thunder', function () {
    integration(function () {
        describe('honoring ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['border-rider', 'doji-whisperer'],
                        dynastyDiscard: ['fields-of-rolling-thunder']
                    },
                    player2: {
                        inPlay: ['kaiu-siege-force']
                    }
                });

                this.fields = this.player1.findCardByName('fields-of-rolling-thunder');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.rider = this.player1.findCardByName('border-rider');
                this.player1.moveCard(this.fields, 'province 1');

                this.siegeForce = this.player2.findCardByName('kaiu-siege-force');
            });

            it('honors a character and stays honored when winning the conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.rider, this.whisperer],
                    defenders: [],
                    type: 'military',
                    ring: 'void'
                });

                this.player2.pass();
                this.player1.clickCard(this.fields);
                expect(this.player1).toBeAbleToSelect(this.rider);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);

                this.player1.clickCard(this.rider);
                expect(this.rider.isHonored).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Fields of Rolling Thunder to honor Border Rider. They will be dishonored at the end of the conflict if player1 loses the conflict.'
                );

                this.noMoreActions();
                this.player1.clickPrompt('Yes');

                expect(this.rider.isHonored).toBe(true);
            });

            it('honors a character and dishonors them when losing the conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.rider, this.whisperer],
                    defenders: [this.siegeForce],
                    type: 'military',
                    ring: 'void'
                });

                this.player2.pass();
                this.player1.clickCard(this.fields);
                expect(this.player1).toBeAbleToSelect(this.rider);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);

                this.player1.clickCard(this.rider);
                expect(this.rider.isHonored).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Fields of Rolling Thunder to honor Border Rider. They will be dishonored at the end of the conflict if player1 loses the conflict.'
                );

                this.noMoreActions();

                expect(this.rider.isHonored).toBe(false);
            });
        });

        describe('unopposed reaction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['solemn-scholar']
                    },
                    player2: {
                        inPlay: [],
                        dynastyDiscard: ['fields-of-rolling-thunder']
                    }
                });

                this.solemn = this.player1.findCardByName('solemn-scholar');

                this.fields = this.player2.findCardByName('fields-of-rolling-thunder');
                this.player2.moveCard(this.fields, 'province 1');
                this.fields.facedown = false;
            });

            it('discards itself after losing unopposed conflict', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.solemn],
                    defenders: [],
                    type: 'political',
                    ring: 'void'
                });

                expect(this.fields.location).toBe('province 1');

                this.noMoreActions();
                expect(this.fields.location).toBe('dynasty discard pile');
                expect(this.getChatLogs(5)).toContain(
                    'player2 uses Fields of Rolling Thunder to discard Fields of Rolling Thunder'
                );
            });

            it('when facedown does not discards itself after losing unopposed conflict', function () {
                this.fields.facedown = true;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.solemn],
                    defenders: [],
                    type: 'political',
                    ring: 'void'
                });

                expect(this.fields.location).toBe('province 1');
                this.noMoreActions();

                expect(this.fields.location).toBe('province 1');
                expect(this.getChatLogs(5)).not.toContain(
                    'player2 uses Fields of Rolling Thunder to discard Fields of Rolling Thunder'
                );
            });
        });
    });
});
