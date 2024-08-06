describe('Soshi Illusionst', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['soshi-illusionist', 'doji-whisperer']
                },
                player2: {
                    inPlay: ['miya-mystic', 'shiba-peacemaker']
                }
            });
            this.miyaMystic = this.player2.findCardByName('miya-mystic');
            this.shibaPeacemaker = this.player2.findCardByName('shiba-peacemaker');
            this.illusionist = this.player1.findCardByName('soshi-illusionist');
            this.whisperer = this.player1.findCardByName('doji-whisperer');

            this.whisperer.honor();
            this.shibaPeacemaker.dishonor();
        });

        it('Should allow targeting a character with a status token', function() {
            this.player1.clickCard(this.illusionist);
            expect(this.player1).not.toBeAbleToSelect(this.miyaMystic);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.illusionist);
            expect(this.player1).toBeAbleToSelect(this.shibaPeacemaker);
        });

        it('Should cost a fate and discard the token', function() {
            let fate = this.player1.fate;
            this.player1.clickCard(this.illusionist);
            this.player1.clickCard(this.shibaPeacemaker);
            expect(this.shibaPeacemaker.isHonored).toBe(false);
            expect(this.shibaPeacemaker.isDishonored).toBe(false);
            expect(this.player1.fate).toBe(fate - 1);

            expect(this.getChatLogs(3)).toContain('player1 uses Soshi Illusionist, spending 1 fate to discard a status token from Shiba Peacemaker');
            expect(this.getChatLogs(3)).toContain('player1 discards Dishonored Token');
        });

        it('Should prompt you to pick which token to discard if a character has two, then discard it', function() {
            this.whisperer.taint();
            this.player1.clickCard(this.illusionist);
            this.player1.clickCard(this.whisperer);

            expect(this.whisperer.isHonored).toBe(true);
            expect(this.whisperer.isTainted).toBe(true);

            expect(this.player1).toHavePrompt('Which token do you wish to discard?');
            expect(this.player1).toHavePromptButton('Honored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Honored Token');
            expect(this.whisperer.isHonored).toBe(false);
            expect(this.whisperer.isTainted).toBe(true);
            expect(this.getChatLogs(3)).toContain('player1 uses Soshi Illusionist, spending 1 fate to discard a status token from Doji Whisperer');
            expect(this.getChatLogs(3)).toContain('player1 discards Honored Token');
        });

        it('Should prompt you to pick which token to discard if a character has two, then discard it', function() {
            this.whisperer.taint();
            this.player1.clickCard(this.illusionist);
            this.player1.clickCard(this.whisperer);

            expect(this.whisperer.isHonored).toBe(true);
            expect(this.whisperer.isTainted).toBe(true);

            expect(this.player1).toHavePrompt('Which token do you wish to discard?');
            expect(this.player1).toHavePromptButton('Honored Token');
            expect(this.player1).toHavePromptButton('Tainted Token');
            this.player1.clickPrompt('Tainted Token');
            expect(this.whisperer.isHonored).toBe(true);
            expect(this.whisperer.isTainted).toBe(false);
        });
    });
});
