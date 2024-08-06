describe('Jade Inlaid Katana', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-liar', 'bayushi-manipulator'],
                    hand: ['jade-inlaid-katana']
                },
                player2: {
                    inPlay: ['yogo-hiroue']
                }
            });

            this.liar = this.player1.findCardByName('bayushi-liar');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');
            this.yogoHiroue = this.player2.findCardByName('yogo-hiroue');
            this.katana = this.player1.findCardByName('jade-inlaid-katana');

            this.liar.fate = 1;
            this.manipulator.fate = 1;
            this.yogoHiroue.fate = 1;

            this.yogoHiroue.taint();
            this.manipulator.taint();

            this.player1.playAttachment(this.katana, this.manipulator);
        });

        it('should make opponent lose a fate when parent wins a conflict as first player', function () {
            this.noMoreActions();
            let fate = this.yogoHiroue.fate;

            this.initiateConflict({
                type: 'political',
                attackers: [this.liar, this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).not.toBeAbleToSelect(this.katana);
            this.player1.clickCard(this.manipulator);
            expect(this.player1).toBeAbleToSelect(this.manipulator);
            expect(this.player1).toBeAbleToSelect(this.yogoHiroue);
            expect(this.player1).not.toBeAbleToSelect(this.liar);
            this.player1.clickCard(this.yogoHiroue);
            expect(this.yogoHiroue.fate).toBe(fate - 1);
            expect(this.getChatLogs(10)).toContain('player1 uses Bayushi Manipulator\'s gained ability from Jade-Inlaid Katana to remove 1 fate from Yogo Hiroue');
        });

        it('can\'t trigger at home', function () {
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
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.manipulator],
                defenders: [this.yogoHiroue]
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilites');
        });
    });
});
