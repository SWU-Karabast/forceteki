describe('Way with Words', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-liar', 'bayushi-manipulator'],
                    hand: ['way-with-words']
                },
                player2: {
                    inPlay: ['yogo-hiroue']
                }
            });

            this.liar = this.player1.findCardByName('bayushi-liar');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.yogoHiroue = this.player2.findCardByName('yogo-hiroue');
            this.wayWithWords = this.player1.findCardByName('way-with-words');
        });

        it('should take one honor from the opponent when winning a political conflict', function () {
            this.player1.playAttachment(this.wayWithWords, this.manipulator);
            this.noMoreActions();
            let honorPlayer1 = this.player1.player.honor;
            let honorPlayer2 = this.player2.player.honor;
            this.initiateConflict({
                type: 'political',
                attackers: [this.liar, this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).not.toBeAbleToSelect(this.wayWithWords);
            this.player1.clickCard(this.manipulator);
            expect(this.player1.player.honor).toBe(honorPlayer1 + 1);
            expect(this.player2.player.honor).toBe(honorPlayer2 - 1);
            expect(this.getChatLogs(10)).toContain('player1 uses Bayushi Manipulator\'s gained ability from Way With Words to take 1 honor from player2');
        });

        it('can\'t trigger in military conflicts', function () {
            this.player1.playAttachment(this.wayWithWords, this.manipulator);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('can\'t trigger at home', function () {
            this.player1.playAttachment(this.wayWithWords, this.manipulator);
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.liar],
                defenders: []
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilites');
        });

        it('can\'t trigger after losing the conflict', function () {
            this.player1.playAttachment(this.wayWithWords, this.manipulator);
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilites');
        });

        it('attaching to an opponents character', function () {
            this.player1.playAttachment(this.wayWithWords, this.yogoHiroue);
            this.noMoreActions();
            let honorPlayer1 = this.player1.player.honor;
            let honorPlayer2 = this.player2.player.honor;
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.yogoHiroue);
            expect(this.player2).not.toBeAbleToSelect(this.wayWithWords);
            this.player2.clickCard(this.yogoHiroue);
            expect(this.player1.player.honor).toBe(honorPlayer1 - 1);
            expect(this.player2.player.honor).toBe(honorPlayer2 + 1);
            expect(this.getChatLogs(10)).toContain('player2 uses Yogo Hiroue\'s gained ability from Way With Words to take 1 honor from player1');
        });
    });
});
