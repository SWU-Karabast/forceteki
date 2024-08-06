describe('Ride On', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['moto-youth', 'border-rider', 'bayushi-manipulator'],
                    hand: ['ride-on']
                },
                player2: {
                    inPlay: ['shinjo-shono']
                }
            });
            this.youth = this.player1.findCardByName('moto-youth');
            this.rider = this.player1.findCardByName('border-rider');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.rideOn = this.player1.findCardByName('ride-on');

            this.shono = this.player2.findCardByName('shinjo-shono');
        });

        it('should not be triggered outside of a conflict', function () {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.rideOn);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should let you target a cavalry character you control', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: ['border-rider', 'bayushi-manipulator'],
                defenders: ['shinjo-shono']
            });

            this.player2.pass();
            this.player1.clickCard(this.rideOn);
            expect(this.player1).toBeAbleToSelect(this.youth);
            expect(this.player1).toBeAbleToSelect(this.rider);
            expect(this.player1).not.toBeAbleToSelect(this.manipulator);
            expect(this.player1).not.toBeAbleToSelect(this.shono);
        });

        it('should move into the conflict a character at home', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: ['border-rider', 'bayushi-manipulator'],
                defenders: ['shinjo-shono']
            });

            this.player2.pass();
            this.player1.clickCard(this.rideOn);
            expect(this.youth.inConflict).toBe(false);
            this.player1.clickCard(this.youth);
            expect(this.youth.inConflict).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Ride On to move Moto Youth into the conflict');
        });

        it('should move home a participating character', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: ['border-rider', 'bayushi-manipulator'],
                defenders: ['shinjo-shono']
            });

            this.player2.pass();
            this.player1.clickCard(this.rideOn);
            expect(this.rider.inConflict).toBe(true);
            this.player1.clickCard(this.rider);
            expect(this.rider.inConflict).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Ride On to send Border Rider home');
        });
    });
});

