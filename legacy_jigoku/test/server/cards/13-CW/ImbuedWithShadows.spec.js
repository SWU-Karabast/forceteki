describe('Imbued with Shadows', function() {
    integration(function() {
        describe('Imbued with Shadows\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['moto-youth', 'doji-whisperer', 'shinjo-ambusher', 'callow-delegate', 'young-harrier', 'steward-of-law'],
                        hand: ['above-question', 'finger-of-jade']
                    },
                    player2: {
                        inPlay: ['bayushi-liar'],
                        hand: ['imbued-with-shadows']
                    }
                });

                this.ambusher = this.player1.findCardByName('shinjo-ambusher');
                this.youth = this.player1.findCardByName('moto-youth');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.callow = this.player1.findCardByName('callow-delegate');
                this.harrier = this.player1.findCardByName('young-harrier');
                this.steward = this.player1.findCardByName('steward-of-law');
                this.aboveQuestion = this.player1.findCardByName('above-question');
                this.jade = this.player1.findCardByName('finger-of-jade');

                this.liar = this.player2.findCardByName('bayushi-liar');
                this.shadows = this.player2.findCardByName('imbued-with-shadows');

                this.ambusher.dishonor();
                this.youth.dishonor();
                this.whisperer.honor();
                this.steward.honor();
                this.liar.dishonor();
            });

            it('Should force you to choose target equal to the amount of honor lost', function() {
                this.player1.pass();
                this.player2.clickCard(this.shadows);
                expect(this.player2).toHavePrompt('Choose how much honor to pay');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).toHavePromptButton('4');
                expect(this.player2).toHavePromptButton('5');
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
            });

            it('Should not let you lose more honor than you have', function() {
                this.player2.honor = 3;
                this.player1.pass();
                this.player2.clickCard(this.shadows);
                expect(this.player2).toHavePrompt('Choose how much honor to pay');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).not.toHavePromptButton('4');
                expect(this.player2).not.toHavePromptButton('5');
            });

            it('Should not let you choose invalid targets (Above Question)', function() {
                this.player1.playAttachment(this.aboveQuestion, this.ambusher);
                this.player2.clickCard(this.shadows);
                expect(this.player2).toHavePrompt('Choose how much honor to pay');
                expect(this.player2).toHavePromptButton('1');
                expect(this.player2).toHavePromptButton('2');
                expect(this.player2).toHavePromptButton('3');
                expect(this.player2).toHavePromptButton('4');
                expect(this.player2).not.toHavePromptButton('5');
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
            });

            it('Should not let you trigger if there are no valid targets', function() {
                this.ambusher.honor();
                this.youth.honor();
                this.whisperer.dishonor();
                this.steward.dishonor();
                this.liar.honor();

                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.shadows);
                expect(this.player2).toHavePrompt('Action Window');
            });

            it('Should remove the honor and the status tokens from the chosen characters', function() {
                let honor = this.player2.honor;

                this.player1.pass();
                this.player2.clickCard(this.shadows);
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
                expect(this.player2).toBeAbleToSelect(this.ambusher);
                expect(this.player2).toBeAbleToSelect(this.youth);
                expect(this.player2).toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.steward);
                expect(this.player2).toBeAbleToSelect(this.liar);
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.youth);
                this.player2.clickCard(this.liar);
                this.player2.clickPrompt('Done');

                expect(this.whisperer.isDishonored).toBe(false);
                expect(this.youth.isDishonored).toBe(false);
                expect(this.liar.isDishonored).toBe(false);
                expect(this.whisperer.isHonored).toBe(false);
                expect(this.youth.isHonored).toBe(false);
                expect(this.liar.isHonored).toBe(false);

                expect(this.player2.honor).toBe(honor - 3);

                expect(this.getChatLogs(10)).toContain('player2 plays Imbued With Shadows to lose 3 honor to discard status tokens from Doji Whisperer, Moto Youth and Bayushi Liar');
                expect(this.getChatLogs(10)).toContain('player2 discards Honored Token from Doji Whisperer');
                expect(this.getChatLogs(10)).toContain('player2 discards Dishonored Token from Moto Youth');
                expect(this.getChatLogs(10)).toContain('player2 discards Dishonored Token from Bayushi Liar');
            });

            it('Should not let you choose more characters than you chose to lose honor', function() {
                let honor = this.player2.honor;

                this.player1.pass();
                this.player2.clickCard(this.shadows);
                this.player2.clickPrompt('2');
                expect(this.player2).toHavePrompt('Choose 2 characters');
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.youth);
                this.player2.clickCard(this.liar);
                this.player2.clickPrompt('Done');

                expect(this.whisperer.isDishonored).toBe(false);
                expect(this.youth.isDishonored).toBe(false);
                expect(this.liar.isDishonored).toBe(true);
                expect(this.whisperer.isHonored).toBe(false);
                expect(this.youth.isHonored).toBe(false);

                expect(this.player2.honor).toBe(honor - 2);

                expect(this.getChatLogs(10)).toContain('player2 plays Imbued With Shadows to lose 2 honor to discard status tokens from Doji Whisperer and Moto Youth');
                expect(this.getChatLogs(10)).toContain('player2 discards Honored Token from Doji Whisperer');
                expect(this.getChatLogs(10)).toContain('player2 discards Dishonored Token from Moto Youth');
            });

            it('Should not let you choose less characters than you lost honor', function() {
                this.player1.pass();
                this.player2.clickCard(this.shadows);
                this.player2.clickPrompt('3');
                expect(this.player2).toHavePrompt('Choose 3 characters');
                expect(this.player2).toBeAbleToSelect(this.ambusher);
                expect(this.player2).toBeAbleToSelect(this.youth);
                expect(this.player2).toBeAbleToSelect(this.whisperer);
                expect(this.player2).toBeAbleToSelect(this.steward);
                expect(this.player2).toBeAbleToSelect(this.liar);
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.youth);
                expect(this.player2).not.toHavePromptButton('Done');
                this.player2.clickCard(this.liar);
                expect(this.player2).toHavePromptButton('Done');
            });

            it('should allow Finger of Jade to cancel', function() {
                let honor = this.player2.honor;
                this.player1.playAttachment(this.jade, this.ambusher);
                this.player2.clickCard(this.shadows);
                this.player2.clickPrompt(3);
                expect(this.player2).toHavePrompt('Choose 3 characters');
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.youth);
                this.player2.clickCard(this.ambusher);
                this.player2.clickPrompt('Done');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.jade);
                this.player1.clickCard(this.jade);

                expect(this.whisperer.isHonored).toBe(true);
                expect(this.youth.isDishonored).toBe(true);
                expect(this.ambusher.isDishonored).toBe(true);

                expect(this.player2.honor).toBe(honor - 3);
            });

            it('Should prompt you if a character has multiple status tokens', function() {
                let honor = this.player2.honor;

                this.youth.taint();
                this.liar.taint();

                this.player1.pass();
                this.player2.clickCard(this.shadows);
                this.player2.clickPrompt('3');
                this.player2.clickCard(this.whisperer);
                this.player2.clickCard(this.youth);
                this.player2.clickCard(this.liar);
                this.player2.clickPrompt('Done');

                expect(this.player2.honor).toBe(honor - 3);

                expect(this.getChatLogs(10)).toContain('player2 plays Imbued With Shadows to lose 3 honor to discard status tokens from Doji Whisperer, Moto Youth and Bayushi Liar');
                expect(this.getChatLogs(10)).toContain('player2 discards Honored Token from Doji Whisperer');

                expect(this.player2).toHavePrompt('Which token do you wish to discard from Moto Youth?');
                expect(this.player2).toHavePromptButton('Dishonored Token');
                expect(this.player2).toHavePromptButton('Tainted Token');
                this.player2.clickPrompt('Tainted Token');
                expect(this.getChatLogs(10)).toContain('player2 discards Tainted Token from Moto Youth');

                expect(this.player2).toHavePrompt('Which token do you wish to discard from Bayushi Liar?');
                expect(this.player2).toHavePromptButton('Dishonored Token');
                expect(this.player2).toHavePromptButton('Tainted Token');
                this.player2.clickPrompt('Dishonored Token');

                expect(this.getChatLogs(10)).toContain('player2 discards Dishonored Token from Bayushi Liar');

                expect(this.whisperer.isDishonored).toBe(false);
                expect(this.whisperer.isHonored).toBe(false);
                expect(this.whisperer.isTainted).toBe(false);

                expect(this.youth.isDishonored).toBe(true);
                expect(this.youth.isHonored).toBe(false);
                expect(this.youth.isTainted).toBe(false);

                expect(this.liar.isDishonored).toBe(false);
                expect(this.liar.isHonored).toBe(false);
                expect(this.liar.isTainted).toBe(true);
            });
        });

        // describe('Imbued with Shadows\'s ability (Monastery Protector)', function() {
        //     beforeEach(function() {
        //         this.setupTest({
        //             phase: 'conflict',
        //             player1: {
        //                 inPlay: ['monastery-protector', 'togashi-mitsu', 'ancient-master', 'doji-challenger']
        //             },
        //             player2: {
        //                 fate: 2,
        //                 hand: ['imbued-with-shadows']
        //             }
        //         });

        //         this.protector = this.player1.findCardByName('monastery-protector');
        //         this.mitsu = this.player1.findCardByName('togashi-mitsu');
        //         this.challenger = this.player1.findCardByName('doji-challenger');
        //         this.master = this.player1.findCardByName('ancient-master');
        //         this.shadows = this.player2.findCardByName('imbued-with-shadows');

        //         this.protector.dishonor();
        //         this.mitsu.dishonor();
        //         this.master.dishonor();
        //         this.challenger.dishonor();

        //         this.player1.pass();
        //     });

        //     it('Should work with Monastery Protector - needs a merge from dev and then some work', function() {
        //         let honor = this.player2.honor;
        //         let fate = this.player2.fate;
        //         this.player2.clickCard(this.shadows);

        //         //Can only targe 2 tattooed + the challenger, so we should only be able to lose 3 honor
        //         expect(this.player2).toHavePrompt('Choose how much honor to pay');
        //         expect(this.player2).toHavePromptButton('1');
        //         expect(this.player2).toHavePromptButton('2');
        //         expect(this.player2).toHavePromptButton('3');
        //         expect(this.player2).not.toHavePromptButton('4');

        //         this.player2.clickPrompt(3);

        //         expect(this.player2).toBeAbleToSelect(this.protector);
        //         expect(this.player2).toBeAbleToSelect(this.mitsu);
        //         expect(this.player2).toBeAbleToSelect(this.master);
        //         expect(this.player2).toBeAbleToSelect(this.challenger);

        //         this.player2.clickCard(this.protector);
        //         expect(this.player2).toBeAbleToSelect(this.mitsu);
        //         expect(this.player2).toBeAbleToSelect(this.master);
        //         expect(this.player2).toBeAbleToSelect(this.challenger);

        //         this.player2.clickCard(this.mitsu);
        //         expect(this.player2).not.toBeAbleToSelect(this.master);
        //         expect(this.player2).toBeAbleToSelect(this.challenger);

        //         this.player2.clickCard(this.challenger);
        //         this.player2.clickPrompt('Done');

        //         expect(this.mitsu.isDishonored).toBe(false);
        //         expect(this.protector.isDishonored).toBe(false);
        //         expect(this.challenger.isDishonored).toBe(false);
        //         expect(this.master.isDishonored).toBe(true);
        //         expect(this.player2.honor).toBe(honor - 3);
        //         expect(this.player2.fate).toBe(fate - 2);
        //     });
        // });
    });
});
