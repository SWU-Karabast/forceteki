describe('Fulfill Your Duty', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shinjo-outrider'],
                    hand: ['fiery-madness'],
                    provinces: ['pilgrimage']
                },
                player2: {
                    inPlay: ['akodo-toturi'],
                    provinces: ['pilgrimage'],
                    hand: ['fulfill-your-duty', 'banzai', 'fine-katana']
                }
            });

            this.outrider = this.player1.findCardByName('shinjo-outrider');
            this.madness = this.player1.findCardByName('fiery-madness');
            this.p1Pilgrimage = this.player1.findCardByName('pilgrimage');

            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.fulfillYourDuty = this.player2.findCardByName('fulfill-your-duty');
            this.katana = this.player2.findCardByName('fine-katana');
            this.banzai = this.player2.findCardByName('banzai');
            this.p2Pilgrimage = this.player2.findCardByName('pilgrimage');
        });

        it('should not activate outside of a conflict', function () {
            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.fulfillYourDuty);
            expect(this.player2).toHavePrompt('Action Window');
        });

        it('should activate during a conflict and add the sacrificed characters skill to the province strength', function () {
            this.noMoreActions();
            this.initiateConflict({
                province: this.p2Pilgrimage,
                attackers: [this.outrider],
                defenders: []
            });
            let pStrength = this.p2Pilgrimage.strength;
            let toturiStrength = this.toturi.getMilitarySkill();

            this.player2.clickCard(this.fulfillYourDuty);
            this.player2.clickCard(this.toturi);
            expect(this.p2Pilgrimage.strength).toBe(pStrength + toturiStrength);
            expect(this.getChatLogs(5)).toContain('player2 plays Fulfill Your Duty, sacrificing Akodo Toturi to add 6 to an attacked province\'s strength');
            expect(this.getChatLogs(5)).toContain('player2 increases the strength of Pilgrimage');
        });

        it('should count attachment bonuses', function () {
            this.player1.playAttachment(this.madness, this.toturi);
            this.noMoreActions();
            this.initiateConflict({
                province: this.p2Pilgrimage,
                attackers: [this.outrider],
                defenders: []
            });
            let pStrength = this.p2Pilgrimage.strength;
            let toturiStrength = this.toturi.getMilitarySkill();

            this.player2.clickCard(this.fulfillYourDuty);
            this.player2.clickCard(this.toturi);
            expect(this.p2Pilgrimage.strength).toBe(pStrength + toturiStrength);
            expect(this.getChatLogs(5)).toContain('player2 plays Fulfill Your Duty, sacrificing Akodo Toturi to add 4 to an attacked province\'s strength');
        });

        it('should count event bonuses', function () {
            this.noMoreActions();
            this.initiateConflict({
                province: this.p2Pilgrimage,
                attackers: [this.outrider],
                defenders: [this.toturi]
            });

            this.player2.clickCard(this.banzai);
            this.player2.clickCard(this.toturi);
            this.player2.clickPrompt('Lose 1 honor to resolve this ability again');
            this.player2.clickCard(this.toturi);
            this.player2.clickPrompt('Done');

            this.player1.pass();

            let pStrength = this.p2Pilgrimage.strength;
            let toturiStrength = this.toturi.getMilitarySkill();

            this.player2.clickCard(this.fulfillYourDuty);
            this.player2.clickCard(this.toturi);
            expect(this.p2Pilgrimage.strength).toBe(pStrength + toturiStrength);
            expect(this.getChatLogs(5)).toContain('player2 plays Fulfill Your Duty, sacrificing Akodo Toturi to add 10 to an attacked province\'s strength');
        });

        it('should work as the attacker', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                province: this.p1Pilgrimage,
                attackers: [this.toturi],
                defenders: []
            });
            let pStrength = this.p1Pilgrimage.strength;
            let toturiStrength = this.toturi.getMilitarySkill();

            this.player1.pass();

            this.player2.clickCard(this.fulfillYourDuty);
            this.player2.clickCard(this.toturi);
            expect(this.p1Pilgrimage.strength).toBe(pStrength + toturiStrength);
            expect(this.getChatLogs(5)).toContain('player2 plays Fulfill Your Duty, sacrificing Akodo Toturi to add 6 to an attacked province\'s strength');
        });
    });
});
