describe('Objection', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['miya-mystic'],
                    hand: ['objection-', 'objection-', 'objection-', 'objection-']
                },
                player2: {
                    inPlay: ['isawa-tadaka-2'],
                    hand: [
                        'against-the-waves',
                        'against-the-waves',
                        'against-the-waves',
                        'against-the-waves',
                        'voice-of-honor'
                    ]
                }
            });

            this.player1.player.imperialFavor = 'miiltary';

            this.miyaMystic = this.player1.findCardByName('miya-mystic');
            this.tadaka = this.player2.findCardByName('isawa-tadaka-2');
            this.voiceOfHonor = this.player2.findCardByName('voice-of-honor');

            this.objections = this.player1.filterCardsByName('objection-');
            this.atws = this.player2.filterCardsByName('against-the-waves');
        });

        it('increases cost during cancel wars', function () {
            let fate = this.player1.fate;
            this.tadaka.honor();

            this.player1.pass();
            this.player2.clickCard(this.atws[0]);
            this.player2.clickCard(this.tadaka);

            expect(this.player1).toBeAbleToSelect(this.objections[0]);
            this.player1.clickCard(this.objections[0]);
            expect(this.player1.fate).toBe(fate);
            expect(this.getChatLogs(1)).toContain(
                'player1 plays Objection! to cancel the effects of Against the Waves'
            );

            this.player2.clickCard(this.voiceOfHonor);

            expect(this.player1).toBeAbleToSelect(this.objections[1]);
            this.player1.clickCard(this.objections[1]);
            expect(this.player1.fate).toBe(fate - 1);
            expect(this.tadaka.bowed).toBe(false);
            expect(this.getChatLogs(1)).toContain('player1 plays Objection! to cancel the effects of Voice of Honor');
        });

        it('should increase cost by 1 for each copy that you play in the phase', function () {
            let fate = this.player1.fate;

            this.player1.pass();
            this.player2.clickCard(this.atws[0]);
            this.player2.clickCard(this.tadaka);

            expect(this.player1).toBeAbleToSelect(this.objections[0]);
            this.player1.clickCard(this.objections[0]);
            expect(this.player1.fate).toBe(fate);
            expect(this.tadaka.bowed).toBe(false);

            this.player1.pass();
            this.player2.clickCard(this.atws[1]);
            this.player2.clickCard(this.tadaka);

            expect(this.player1).toBeAbleToSelect(this.objections[1]);
            this.player1.clickCard(this.objections[1]);
            expect(this.player1.fate).toBe(fate - 1);
            expect(this.tadaka.bowed).toBe(false);

            this.player1.pass();
            this.player2.clickCard(this.atws[2]);
            this.player2.clickCard(this.tadaka);

            expect(this.player1).toBeAbleToSelect(this.objections[2]);
            this.player1.clickCard(this.objections[2]);
            expect(this.player1.fate).toBe(fate - 3);
            expect(this.tadaka.bowed).toBe(false);
        });
    });
});