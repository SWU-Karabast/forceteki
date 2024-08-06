xdescribe('Sneak Attack', function () {
    integration(function () {
        describe('With a normal stronghold', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['bayushi-manipulator', 'shosuro-sadako'],
                        hand: ['sneak-attack']
                    },
                    player2: {
                        inPlay: ['wandering-ronin'],
                        hand: ['for-shame', 'let-go']
                    }
                });

                this.manipulator = this.player1.findCardByName('bayushi-manipulator');
                this.sadako = this.player1.findCardByName('shosuro-sadako');
                this.sneakAttack = this.player1.findCardByName('sneak-attack');

                this.wanderingRonin = this.player2.findCardByName('wandering-ronin');
                this.forShame = this.player2.findCardByName('for-shame');
                this.letGo = this.player2.findCardByName('let-go');
            });

            it('should give the attacking player the first action opportunity and peak at opponent hand', function () {
                let player1StartingHonor = this.player1.honor;
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.manipulator]
                });

                expect(this.player1).toHavePrompt('Waiting for opponent to choose defenders');
                expect(this.player2).toHavePrompt('Choose defenders');

                this.player2.clickPrompt('Done');

                this.player1.clickCard(this.sneakAttack);
                expect(this.player1.honor).toBe(player1StartingHonor - 1);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player2).toHavePrompt('Waiting for opponent to take an action or pass');

                expect(this.getChatLogs(5)).toContain(
                    "player1 plays Sneak Attack, losing 1 honor to give player1 the first action in this conflict and peak at their opponent's hand"
                );
                expect(this.getChatLogs(5)).toContain("player1 sees For Shame! and Let Go in player2's hand");
            });
        });

        describe('With Seven Stings Keep', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        stronghold: ['seven-stings-keep'],
                        inPlay: ['bayushi-manipulator', 'shosuro-sadako'],
                        hand: ['sneak-attack']
                    },
                    player2: {
                        inPlay: ['wandering-ronin']
                    }
                });

                this.keep = this.player1.findCardByName('seven-stings-keep');
                this.manipulator = this.player1.findCardByName('bayushi-manipulator');
                this.sadako = this.player1.findCardByName('shosuro-sadako');
                this.sneakAttack = this.player1.findCardByName('sneak-attack');

                this.wanderingRonin = this.player2.findCardByName('wandering-ronin');
                this.shamefulDisplay = this.player2.findCardByName('shameful-display', 'province 1');
            });

            it('should give the attacking player the first action opportunity', function () {
                let player1StartingHonor = this.player1.honor;
                this.noMoreActions();

                this.player1.clickCard(this.keep);
                this.player1.clickPrompt('1');
                expect(this.player1).toHavePrompt('Waiting for opponent to choose defenders');
                expect(this.player2).toHavePrompt('Choose defenders');

                this.player2.clickPrompt('Done');
                expect(this.player1).toHavePrompt('Initiate Conflict');
                expect(this.player1).not.toBeAbleToSelect(this.sneakAttack);

                this.player1.clickCard(this.manipulator);
                this.player1.clickRing('air');
                this.player1.clickCard(this.shamefulDisplay);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toBeAbleToSelect(this.sneakAttack);

                this.player1.clickCard(this.sneakAttack);
                expect(this.player1.honor).toBe(player1StartingHonor - 1);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.player2).toHavePrompt('Waiting for opponent to take an action or pass');
                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Sneak Attack, losing 1 honor to give player1 the first action in this conflict'
                );
            });
        });
    });
});
