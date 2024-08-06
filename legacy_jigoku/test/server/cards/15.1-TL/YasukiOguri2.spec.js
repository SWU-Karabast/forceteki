describe('Yasuki Oguri 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['mirumoto-raitsugu', 'doomed-shugenja']
                },
                player2: {
                    inPlay: ['yasuki-oguri-2', 'doji-whisperer'],
                    provinces: ['blood-of-onnotangu', 'fertile-fields']
                }
            });
            this.mirumoto = this.player1.findCardByName('mirumoto-raitsugu');
            this.doomed = this.player1.findCardByName('doomed-shugenja');
            this.mirumoto.fate = 2;

            this.yasuki = this.player2.findCardByName('yasuki-oguri-2');
            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.whisperer.fate = 1;
            this.blood = this.player2.findCardByName('blood-of-onnotangu');
            this.fields = this.player2.findCardByName('fertile-fields');

        });

        it('should be allowed to pull in a character with a fate when defending', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.mirumoto],
                defenders: [this.yasuki],
                province: this.fields
            });
            let p2Fate = this.player2.fate;
            this.player2.clickCard(this.yasuki);
            expect(this.player2).toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.whisperer);
            expect(this.whisperer.isParticipating()).toBe(true);
            expect(this.player2.fate).toBe(p2Fate - 1);
            expect(this.getChatLogs(5)).toContain('player2 uses Yasuki Oguri, spending 1 fate to move Doji Whisperer into the conflict');
        });

        it('should not be allowed to pull in a character with no fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.mirumoto],
                defenders: [this.yasuki],
                province: this.fields
            });
            this.player2.clickCard(this.yasuki);
            expect(this.player2).not.toBeAbleToSelect(this.doomed);
        });

        it('should not let you take the action if you cannot spend fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.mirumoto],
                defenders: [this.yasuki],
                province: this.blood
            });
            this.player2.clickCard(this.yasuki);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not let you take the action when attacking', function() {
            this.noMoreActions();
            this.player1.passConflict();
            this.player1.pass();
            this.player2.pass();
            this.initiateConflict({
                attackers:[this.yasuki]
            });
            this.player2.clickPrompt('No Target');
            this.player1.clickPrompt('Done');
            this.player1.pass();
            this.player2.clickCard(this.yasuki);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });
    });
});
