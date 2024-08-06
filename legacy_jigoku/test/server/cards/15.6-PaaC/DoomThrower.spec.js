describe('Doom Thrower', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['shinjo-outrider', 'border-rider'],
                    provinces: ['pilgrimage'],
                    dynastyDiscard: ['doom-thrower']
                },
                player2: {
                    inPlay: ['akodo-toturi'],
                    provinces: ['pilgrimage']
                }
            });

            this.outrider = this.player1.findCardByName('shinjo-outrider');
            this.rider = this.player1.findCardByName('border-rider');
            this.thrower = this.player1.findCardByName('doom-thrower');
            this.thower = this.player1.placeCardInProvince(this.thrower, 'province 1');
            this.thrower.facedown = false;

            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.p2Pilgrimage = this.player2.findCardByName('pilgrimage');
            this.rider.fate = 1;
        });

        it('should not activate outside of a conflict', function () {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.thrower);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should activate during a conflict and let you sacrifice a character, reducing strength by 2 if it has no fate', function () {
            this.noMoreActions();
            this.initiateConflict({
                province: this.p2Pilgrimage,
                attackers: [this.outrider],
                defenders: []
            });
            let pStrength = this.p2Pilgrimage.strength;
            this.player2.pass();
            this.player1.clickCard(this.thrower);
            expect(this.player1).toBeAbleToSelect(this.rider);
            expect(this.player1).toBeAbleToSelect(this.outrider);
            this.player1.clickCard(this.outrider);
            expect(this.p2Pilgrimage.strength).toBe(pStrength - 2);
            expect(this.getChatLogs(5)).toContain('player1 uses Doom Thrower, sacrificing Shinjo Outrider to reduce an attacked province\'s strength by 2');
            expect(this.getChatLogs(5)).toContain('player1 reduces the strength of Pilgrimage');
        });

        it('should activate during a conflict and let you sacrifice a character, reducing strength by 5 if it has fate', function () {
            this.noMoreActions();
            this.initiateConflict({
                province: this.p2Pilgrimage,
                attackers: [this.outrider],
                defenders: []
            });
            let pStrength = this.p2Pilgrimage.strength;
            this.player2.pass();
            this.player1.clickCard(this.thrower);
            this.player1.clickCard(this.rider);
            expect(this.p2Pilgrimage.strength).toBe(pStrength - 5);
            expect(this.getChatLogs(5)).toContain('player1 uses Doom Thrower, sacrificing Border Rider to reduce an attacked province\'s strength by 5');
            expect(this.getChatLogs(5)).toContain('player1 reduces the strength of Pilgrimage');
        });
    });
});
