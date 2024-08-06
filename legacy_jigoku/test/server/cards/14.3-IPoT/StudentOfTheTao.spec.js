describe('Student Of The Tao', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['matsu-tsuko-2', 'ikoma-prodigy'],
                    provinces: ['city-of-the-rich-frog']
                },
                player2: {
                    inPlay: ['student-of-the-tao', 'akodo-toturi'],
                    provinces: ['fertile-fields', 'pilgrimage']
                }
            });

            this.student = this.player2.findCardByName('student-of-the-tao');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.prodigy = this.player1.findCardByName('ikoma-prodigy');
            this.tsuko = this.player1.findCardByName('matsu-tsuko-2');

            this.city = this.player1.findCardByName('city-of-the-rich-frog');
            this.fertile = this.player2.findCardByName('fertile-fields');
            this.pilgrimage = this.player2.findCardByName('pilgrimage');
        });

        it('should work at a void province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tsuko, this.prodigy],
                defenders: [this.student, this.toturi],
                province: this.pilgrimage
            });
            this.player2.clickCard(this.student);
            expect(this.player2).toHavePrompt('Student of the Tao');
        });

        it('should work when not participating', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tsuko, this.prodigy],
                defenders: [this.toturi],
                province: this.pilgrimage
            });
            this.player2.clickCard(this.student);
            expect(this.player2).toHavePrompt('Student of the Tao');
        });

        it('should work at opponent\'s void provinces', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.student, this.toturi],
                defenders: [this.prodigy, this.tsuko],
                province: this.city
            });
            this.player1.pass();
            this.player2.clickCard(this.student);
            expect(this.player2).toHavePrompt('Student of the Tao');
        });

        it('should not work at a non-void province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tsuko, this.prodigy],
                defenders: [this.student, this.toturi],
                province: this.fertile
            });
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.student);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should let you target an opponent\'s character', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tsuko, this.prodigy],
                defenders: [this.student, this.toturi],
                province: this.pilgrimage
            });
            this.player2.clickCard(this.student);
            expect(this.player2).toBeAbleToSelect(this.tsuko);
            expect(this.player2).toBeAbleToSelect(this.prodigy);
            expect(this.player2).not.toBeAbleToSelect(this.student);
            expect(this.player2).not.toBeAbleToSelect(this.toturi);
        });

        it('should move the chosen character home', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tsuko, this.prodigy],
                defenders: [this.student, this.toturi],
                province: this.pilgrimage
            });
            this.player2.clickCard(this.student);
            this.player2.clickCard(this.tsuko);
            expect(this.tsuko.inConflict).toBe(false);
        });

        it('chat messages', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tsuko, this.prodigy],
                defenders: [this.student, this.toturi],
                province: this.pilgrimage
            });
            this.player2.clickCard(this.student);
            this.player2.clickCard(this.tsuko);
            expect(this.getChatLogs(3)).toContain('player2 uses Student of the Tao to send Matsu Tsuko home');
        });
    });
});
