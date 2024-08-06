describe('Chancellor\'s Aide', function() {
    integration(function() {
        describe('Chancellor\'s Aide\'s ability', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        dynastyDiscard: ['daidoji-kageyu'],
                        inPlay: ['chancellor-s-aide'],
                        hand: ['finger-of-jade', 'fine-katana']
                    },
                    player2: {
                        hand: ['finger-of-jade', 'ornate-fan']
                    }
                });
                this.chancellorsAide = this.player1.findCardByName('chancellor-s-aide');
                this.daidojiKageyu = this.player1.placeCardInProvince('daidoji-kageyu', 'province 2');
                this.jade = this.player1.findCardByName('finger-of-jade');
                this.jade2 = this.player2.findCardByName('finger-of-jade');
            });

            it('should trigger upon leaving play', function() {
                this.player1.clickCard(this.daidojiKageyu);
                this.player1.clickCard(this.chancellorsAide);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.chancellorsAide);
            });

            it('should give both players a prompt to target a player. Opponent is optional', function() {
                this.player1.clickCard(this.daidojiKageyu);
                this.player1.clickCard(this.chancellorsAide);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.chancellorsAide);

                this.player1.clickCard(this.chancellorsAide);
                expect(this.player2).toHavePrompt('Give an honor to your opponent?');
                expect(this.player2).toHavePromptButton('Yes');
                expect(this.player2).toHavePromptButton('No');
                this.player2.clickPrompt('Yes');
                expect(this.getChatLogs(1)).toContain('player2 chooses to give player1 1 honor');

                expect(this.player1).toHavePrompt('Chancellor\'s Aide');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).not.toHavePromptButton('Done');

                this.player1.clickPrompt('player1');

                expect(this.player2).toHavePrompt('Chancellor\'s Aide');
                expect(this.player2).toHavePromptButton('player1');
                expect(this.player2).toHavePromptButton('player2');
            });

            it('works when only the owner of Chancellor\'s Aide chooses a player', function() {
                this.player1.clickCard(this.daidojiKageyu);
                this.player1.clickCard(this.chancellorsAide);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.chancellorsAide);

                this.player1.clickCard(this.chancellorsAide);
                expect(this.player2).toHavePrompt('Give an honor to your opponent?');
                expect(this.player2).toHavePromptButton('Yes');
                expect(this.player2).toHavePromptButton('No');
                this.player2.clickPrompt('No');

                expect(this.player1).toHavePrompt('Chancellor\'s Aide');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).not.toHavePromptButton('Done');

                this.player1.clickPrompt('player2');

                expect(this.player2).toHavePrompt('Choose a card to discard');
                this.player2.clickCard(this.jade2);

                expect(this.jade2.location).toBe('conflict discard pile');
            });

            it('works when both players choose to target a player', function() {
                const player1Honor = this.player1.honor;
                const player2Honor = this.player2.honor;

                this.player1.clickCard(this.daidojiKageyu);
                this.player1.clickCard(this.chancellorsAide);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.chancellorsAide);

                this.player1.clickCard(this.chancellorsAide);
                expect(this.player2).toHavePrompt('Give an honor to your opponent?');
                expect(this.player2).toHavePromptButton('Yes');
                expect(this.player2).toHavePromptButton('No');
                this.player2.clickPrompt('Yes');

                expect(this.player1).toHavePrompt('Chancellor\'s Aide');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).not.toHavePromptButton('Done');

                this.player1.clickPrompt('player2');

                expect(this.player2).toHavePrompt('Chancellor\'s Aide');
                expect(this.player2).toHavePromptButton('player1');
                expect(this.player2).toHavePromptButton('player2');

                this.player2.clickPrompt('player1');

                expect(this.player2).toHavePrompt('Choose a card to discard');
                this.player2.clickCard(this.jade2);

                expect(this.player1).toHavePrompt('Choose a card to discard');
                this.player1.clickCard(this.jade);

                expect(this.player1.honor).toBe(player1Honor + 1);
                expect(this.player2.honor).toBe(player2Honor - 1);
                expect(this.jade.location).toBe('conflict discard pile');
                expect(this.jade2.location).toBe('conflict discard pile');
            });

            it('works when both players choose themselves', function() {
                this.player1.clickCard(this.daidojiKageyu);
                this.player1.clickCard(this.chancellorsAide);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.chancellorsAide);

                this.player1.clickCard(this.chancellorsAide);
                expect(this.player2).toHavePrompt('Give an honor to your opponent?');
                expect(this.player2).toHavePromptButton('Yes');
                expect(this.player2).toHavePromptButton('No');
                this.player2.clickPrompt('Yes');

                expect(this.player1).toHavePrompt('Chancellor\'s Aide');
                expect(this.player1).toHavePromptButton('player1');
                expect(this.player1).toHavePromptButton('player2');
                expect(this.player1).not.toHavePromptButton('Done');

                this.player1.clickPrompt('player1');

                expect(this.player2).toHavePrompt('Chancellor\'s Aide');
                expect(this.player2).toHavePromptButton('player1');
                expect(this.player2).toHavePromptButton('player2');

                this.player2.clickPrompt('player2');

                expect(this.player1).toHavePrompt('Choose a card to discard');
                this.player1.clickCard(this.jade);

                expect(this.player2).toHavePrompt('Choose a card to discard');
                this.player2.clickCard(this.jade2);

                expect(this.jade.location).toBe('conflict discard pile');
                expect(this.jade2.location).toBe('conflict discard pile');
            });
        });

        // describe('Discarding a card as card of the cost of the card', function() {
        //     beforeEach(function() {
        //         this.setupTest({
        //             phase: 'conflict',
        //             player1: {
        //                 inPlay: ['chancellor-s-aide'],
        //                 hand: ['noble-sacrifice', 'fine-katana']
        //             },
        //             player2: {
        //                 inPlay: ['doji-challenger'],
        //                 hand: ['finger-of-jade', 'ornate-fan']
        //             }
        //         });
        //         this.aide = this.player1.findCardByName('chancellor-s-aide');
        //         this.sac = this.player1.findCardByName('noble-sacrifice');
        //         this.katana = this.player1.findCardByName('fine-katana');

        //         this.challenger = this.player2.findCardByName('doji-challenger');
        //         this.jade = this.player2.findCardByName('finger-of-jade');
        //         this.fan = this.player2.findCardByName('ornate-fan');

        //         this.aide.honor();
        //         this.challenger.dishonor();
        //     });

        //     it('if you discard a card while paying costs then initiation should fail', function() {
        //         this.player1.clickCard(this.sac);
        //         this.player1.clickCard(this.challenger);
        //         this.player1.clickCard(this.aide);

        //         expect(this.player1).toHavePrompt('Triggered Abilities');
        //         this.player1.clickCard(this.aide);
        //         this.player2.clickPrompt('Yes');
        //         this.player1.clickPrompt('player2');
        //         this.player2.clickPrompt('player1');
        //         this.player2.clickCard(this.jade);
        //         expect(this.player1).toBeAbleToSelect(this.sac);
        //         expect(this.player1).toBeAbleToSelect(this.katana);
        //         this.player1.clickCard(this.sac);
        //         expect(this.challenger.location).toBe('play area');
        //         expect(this.getChatLogs(10)).toContain('player1 attempted to use Noble Sacrifice, but it is no longer in a legal location');
        //     });
        // });
    });
});
