describe('Compromised Secrets', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['border-rider'],
                    hand: ['way-of-the-dragon', 'compromised-secrets', 'compromised-secrets']
                },
                player2: {
                    honor: 11,
                    inPlay: ['border-rider', 'adept-of-the-waves'],
                    hand: ['way-of-the-dragon']
                }
            });

            this.rider1 = this.player1.findCardByName('border-rider');
            this.rider2 = this.player2.findCardByName('border-rider');
            this.adept = this.player2.findCardByName('adept-of-the-waves');

            this.dragon1 = this.player1.findCardByName('way-of-the-dragon');
            this.dragon2 = this.player2.findCardByName('way-of-the-dragon');

            this.secrets1 = this.player1.filterCardsByName('compromised-secrets')[0];
            this.secrets2 = this.player1.filterCardsByName('compromised-secrets')[1];

            this.player1.playAttachment(this.dragon1, this.rider1);
            this.player2.playAttachment(this.dragon2, this.rider2);

            this.rider1.bowed = true;
            this.rider2.bowed = true;
        });

        it('should make you give an honor to your opponent to trigger ability', function () {
            this.player1.playAttachment(this.secrets1, this.rider2);
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            this.player2.clickCard(this.rider2);
            expect(this.rider2.bowed).toBe(false);
            expect(this.player1.honor).toBe(p1Honor + 1);
            expect(this.player2.honor).toBe(p2Honor - 1);
        });

        it('should not make you give an honor to your opponent to trigger ability on non-attached character', function () {
            this.player1.playAttachment(this.secrets1, this.rider2);
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            this.player2.clickCard(this.adept);
            this.player2.clickCard(this.adept);
            expect(this.player1.honor).toBe(p1Honor);
            expect(this.player2.honor).toBe(p2Honor);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be allowed to trigger if you attach this to a character you control (you cannot give honor to yourself)', function () {
            this.player1.playAttachment(this.secrets1, this.rider1);
            this.player2.pass();
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.rider1);
            expect(this.rider1.bowed).toBe(true);
            expect(this.player1.honor).toBe(p1Honor);
            expect(this.player2.honor).toBe(p2Honor);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should make you give an honor each time you trigger', function () {
            this.player1.playAttachment(this.secrets1, this.rider2);
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            this.player2.clickCard(this.rider2);
            expect(this.rider2.bowed).toBe(false);
            this.rider2.bowed = true;
            this.player1.pass();
            this.player2.clickCard(this.rider2);
            expect(this.rider2.bowed).toBe(false);
            expect(this.player1.honor).toBe(p1Honor + 2);
            expect(this.player2.honor).toBe(p2Honor - 2);
        });

        it('should stack', function () {
            this.player1.playAttachment(this.secrets1, this.rider2);
            this.player2.pass();
            this.player1.playAttachment(this.secrets2, this.rider2);
            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;

            this.player2.clickCard(this.rider2);
            expect(this.rider2.bowed).toBe(false);
            this.rider2.bowed = true;
            this.player1.pass();
            this.player2.clickCard(this.rider2);
            expect(this.rider2.bowed).toBe(false);
            expect(this.player1.honor).toBe(p1Honor + 4);
            expect(this.player2.honor).toBe(p2Honor - 4);
        });

        it('should not be playable if you are equally honorable', function () {
            this.player1.honor = 10;
            this.player2.honor = 10;
            this.player1.clickCard(this.secrets1);
            this.player1.clickCard(this.rider2);

            expect(this.rider2.attachments).not.toContain(this.secrets1);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not be playable if you are more honorable', function () {
            this.player1.honor = 11;
            this.player2.honor = 10;
            this.player1.clickCard(this.secrets1);
            this.player1.clickCard(this.rider2);

            expect(this.rider2.attachments).not.toContain(this.secrets1);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be playable if you are less honorable', function () {
            this.player1.honor = 10;
            this.player2.honor = 11;
            this.player1.clickCard(this.secrets1);
            this.player1.clickCard(this.rider2);

            expect(this.rider2.attachments).toContain(this.secrets1);
            expect(this.player2).toHavePrompt('Action Window');
        });
    });
});
