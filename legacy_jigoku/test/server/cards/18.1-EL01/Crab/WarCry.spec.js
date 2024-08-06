describe('War Cry', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['silent-skirmisher', 'togashi-initiate', 'doji-whisperer'],
                    hand: ['war-cry', 'suffer-the-consequences']
                },
                player2: {
                    inPlay: ['hida-yakamo']
                }
            });

            this.yakamo = this.player2.findCardByName('hida-yakamo');
            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.skirmisher = this.player1.findCardByName('silent-skirmisher');
            this.whisperer = this.player1.findCardByName('doji-whisperer');

            this.warcry = this.player1.findCardByName('war-cry');
            this.suffer = this.player1.findCardByName('suffer-the-consequences');
            this.sd = this.player2.findCardByName('shameful-display', 'province 1');
            this.sd2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        it('should break a province after you win a military conflict with berserkers', function () {
            this.noMoreActions();
            let hand = this.player1.hand.length;
            this.initiateConflict({
                attackers: [this.skirmisher],
                defenders: [],
                type: 'military',
                province: this.sd
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.warcry);
            this.player1.clickCard(this.warcry);
            expect(this.getChatLogs(5)).toContain('player1 plays War Cry to break an attacked province');
            expect(this.sd.isBroken).toBe(true);
            expect(this.player1.hand.length).toBe(hand - 1);
            expect(this.getChatLogs(5)).toContain('player1 plays War Cry to break an attacked province');
        });

        it('should not trigger after you win a military conflict with a non-berserker', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.skirmisher, this.whisperer],
                defenders: [],
                type: 'military',
                province: this.sd
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
            expect(this.getChatLogs(5)).not.toContain('player1 plays War Cry to break an attacked province');
        });
    });
});
