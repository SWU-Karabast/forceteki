describe('Covert', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-mitsu', 'tengu-sensei', 'ikoma-ikehata']
                },
                player2: {
                    inPlay: ['hantei-sotorii', 'master-alchemist']
                }
            });

            this.shameful = this.player2.findCardByName('shameful-display', 'province 1');
            this.mitsu = this.player1.findCardByName('togashi-mitsu');
            this.tengu = this.player1.findCardByName('tengu-sensei');
            this.ikehata = this.player1.findCardByName('ikoma-ikehata');

            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.masterAlchemist = this.player2.findCardByName('master-alchemist');
        });

        describe('using the post-declaration prompt', function() {
            it('single covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Togashi Mitsu');
                expect(this.sotorii.covert).toBe(false);
                this.player1.clickCard(this.sotorii);
                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.sotorii.covert).toBe(true);

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });

            it('multiple covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.ikehata);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Togashi Mitsu');
                expect(this.sotorii.covert).toBe(false);
                this.player1.clickCard(this.sotorii);

                expect(this.player1).toHavePrompt('Choose covert target for Ikoma Ikehata');
                expect(this.masterAlchemist.covert).toBe(false);
                this.player1.clickCard(this.masterAlchemist);
                expect(this.masterAlchemist.covert).toBe(true);
                expect(this.sotorii.covert).toBe(true);

                expect(this.player2).toHavePrompt('Choose defenders');

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });

            it('multiple covert - reaction to covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.tengu);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player1).toHavePrompt('Choose covert target for Togashi Mitsu');
                expect(this.sotorii.covert).toBe(false);
                this.player1.clickCard(this.sotorii);

                expect(this.player1).toHavePrompt('Choose covert target for Tengu Sensei');
                expect(this.masterAlchemist.covert).toBe(false);
                this.player1.clickCard(this.masterAlchemist);
                expect(this.masterAlchemist.covert).toBe(true);
                expect(this.sotorii.covert).toBe(true);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.tengu);
                this.player1.clickCard(this.tengu);

                expect(this.player2).toHavePrompt('Choose defenders');

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });
        });

        describe('using the in-declaration targeting', function() {
            it('single covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.sotorii);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.sotorii.covert).toBe(true);

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });

            it('multiple covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.ikehata);
                this.player1.clickCard(this.sotorii);
                this.player1.clickCard(this.masterAlchemist);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.player2).toHavePrompt('Choose defenders');
                expect(this.masterAlchemist.covert).toBe(true);
                expect(this.sotorii.covert).toBe(true);

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });

            it('multiple covert - reaction to covert', function() {
                this.noMoreActions();
                this.player1.clickRing('air');
                this.player1.clickCard(this.shameful);
                this.player1.clickCard(this.mitsu);
                this.player1.clickCard(this.tengu);
                this.player1.clickCard(this.sotorii);
                this.player1.clickCard(this.masterAlchemist);
                this.player1.clickPrompt('Initiate Conflict');
                expect(this.masterAlchemist.covert).toBe(true);
                expect(this.sotorii.covert).toBe(true);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.tengu);
                this.player1.clickCard(this.tengu);

                expect(this.player2).toHavePrompt('Choose defenders');

                this.player2.clickCard(this.sotorii);
                this.player2.clickCard(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
                this.player2.clickPrompt('Done');
                expect(this.game.currentConflict.defenders).not.toContain(this.masterAlchemist);
                expect(this.game.currentConflict.defenders).not.toContain(this.sotorii);
            });
        });
    });
});
