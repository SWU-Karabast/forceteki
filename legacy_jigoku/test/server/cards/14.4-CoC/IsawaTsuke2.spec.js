describe('Isawa Tsuke 2', function() {
    integration(function() {
        describe('Isawa Tsuke 2\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['moto-youth', 'doji-whisperer', 'shinjo-ambusher', 'callow-delegate', 'isawa-tadaka', 'shiba-yojimbo', 'student-of-war'],
                        hand: ['finger-of-jade']
                    },
                    player2: {
                        inPlay: ['bayushi-liar', 'isawa-tsuke-2']
                    }
                });

                this.player1.player.showBid = 5;
                this.player2.player.showBid = 5;

                this.ambusher = this.player1.findCardByName('shinjo-ambusher');
                this.youth = this.player1.findCardByName('moto-youth');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.callow = this.player1.findCardByName('callow-delegate');
                this.jade = this.player1.findCardByName('finger-of-jade');
                this.yojimbo = this.player1.findCardByName('shiba-yojimbo');
                this.tadaka = this.player1.findCardByName('isawa-tadaka');
                this.student = this.player1.findCardByName('student-of-war');

                this.liar = this.player2.findCardByName('bayushi-liar');
                this.tsuke = this.player2.findCardByName('isawa-tsuke-2');

                this.ambusher.fate = 1;
                this.youth.fate = 0;
                this.whisperer.fate = 2;
                this.callow.fate = 4;
                this.tadaka.fate = 1;
                this.liar.fate = 0;
                this.tsuke.fate = 1;
                this.student.fate = 3;
            });

            it('Should not work outside of a conflict', function() {
                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Action Window');
            });

            it('Should allow you to lose honor up to the number of eligible targets', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ambusher, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Choose how much honor to pay');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).toHavePromptButton('4');
                expect(this.player2).not.toHavePromptButton('5');
            });

            it('Should not work if the fire ring is contested', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ambusher, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke],
                    ring: 'fire'
                });

                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Should not work if the fire ring is claimed', function() {
                this.player1.claimRing('fire');
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ambusher, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Should force you to choose target equal to the amount of honor lost', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ambusher, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                this.player2.clickCard(this.tsuke);
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
            });

            it('Should not let you lose more honor than you have', function() {
                this.player2.honor = 3;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.ambusher, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });
                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Choose how much honor to pay');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).not.toHavePromptButton('4');
                expect(this.player2).not.toHavePromptButton('5');
            });

            it('Should not let you choose invalid targets (cannot lose fate)', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.student, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Choose how much honor to pay');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).toHavePromptButton('4');
                expect(this.player2).toHavePromptButton('Cancel');
                this.player2.clickPrompt('Cancel');

                this.player1.player.showBid = 3;
                this.game.checkGameState(true);

                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Choose how much honor to pay');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).not.toHavePromptButton('4');
            });

            it('Should not let you trigger if there are no valid targets', function() {
                this.student.fate = 0;
                this.youth.fate = 0;
                this.whisperer.fate = 0;
                this.tadaka.fate = 0;
                this.liar.fate = 0;
                this.tsuke.fate = 0;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.student, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.tsuke);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Should only let you target participating characters', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.student, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                this.player2.clickCard(this.tsuke);
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
                expect(this.player2).not.toBeAbleToSelect(this.ambusher);
                expect(this.player2).toBeAbleToSelect(this.student);
                expect(this.player2).not.toBeAbleToSelect(this.youth);
                expect(this.player2).toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.tadaka);
                expect(this.player2).not.toBeAbleToSelect(this.liar);
                expect(this.player2).toBeAbleToSelect(this.tsuke);
            });

            it('Should remove the honor and the fate from the chosen characters', function() {
                let honor = this.player2.honor;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.student, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                let fate1 = this.student.fate;
                let fate2 = this.whisperer.fate;
                let fate3 = this.tsuke.fate;

                this.player2.clickCard(this.tsuke);
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
                expect(this.player2).toBeAbleToSelect(this.student);
                expect(this.player2).not.toBeAbleToSelect(this.youth);
                expect(this.player2).toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.tadaka);
                expect(this.player2).not.toBeAbleToSelect(this.liar);
                expect(this.player2).toBeAbleToSelect(this.tsuke);
                this.player2.clickCard(this.student);
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.tsuke);
                this.player2.clickPrompt('Done');

                expect(this.student.fate).toBe(fate1 - 1);
                expect(this.whisperer.fate).toBe(fate2 - 1);
                expect(this.tsuke.fate).toBe(fate3 - 1);

                expect(this.player2.honor).toBe(honor - 3);

                expect(this.getChatLogs(3)).toContain('player2 uses Isawa Tsuke to lose 3 honor to discard a fate from Student of War, Doji Whisperer and Isawa Tsuke');
            });

            it('Should not let you choose more characters than you chose to lose honor', function() {
                let honor = this.player2.honor;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.student, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                let fate1 = this.student.fate;
                let fate2 = this.whisperer.fate;
                let fate3 = this.tsuke.fate;

                this.player2.clickCard(this.tsuke);
                this.player2.clickPrompt('2');
                expect(this.player2).toHavePrompt('Choose 2 characters');
                this.player2.clickCard(this.student);
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.tsuke);
                this.player2.clickPrompt('Done');

                expect(this.student.fate).toBe(fate1 - 1);
                expect(this.whisperer.fate).toBe(fate2 - 1);
                expect(this.tsuke.fate).toBe(fate3);

                expect(this.player2.honor).toBe(honor - 2);

                expect(this.getChatLogs(3)).toContain('player2 uses Isawa Tsuke to lose 2 honor to discard a fate from Student of War and Doji Whisperer');
            });

            it('should allow cancelling', function() {
                let honor = this.player2.honor;

                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.student, this.youth, this.whisperer, this.tadaka],
                    defenders: [this.liar, this.tsuke]
                });

                let fate1 = this.student.fate;
                let fate2 = this.whisperer.fate;
                let fate3 = this.tsuke.fate;

                this.player2.clickCard(this.tsuke);
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
                this.player2.clickCard(this.student);
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.tadaka);
                this.player2.clickPrompt('Done');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.yojimbo);
                this.player1.clickCard(this.yojimbo);

                expect(this.student.fate).toBe(fate1);
                expect(this.whisperer.fate).toBe(fate2);
                expect(this.tsuke.fate).toBe(fate3);

                expect(this.player2.honor).toBe(honor - 3);

                expect(this.getChatLogs(4)).toContain('player2 uses Isawa Tsuke to lose 3 honor to discard a fate from Student of War, Doji Whisperer and Isawa Tadaka');
                expect(this.getChatLogs(4)).toContain('player1 uses Shiba Yōjimbō to cancel the effects of Isawa Tsuke');
            });
        });
    });
});
