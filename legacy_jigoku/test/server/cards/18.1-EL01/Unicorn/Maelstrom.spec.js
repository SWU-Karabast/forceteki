describe('Maelstrom', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['moto-chagatai', 'border-rider']
                },
                player2: {
                    honor: 10,
                    inPlay: ['doji-hotaru', 'kakita-yoshi'],
                    provinces: ['maelstrom', 'the-pursuit-of-justice'],
                    hand: ['assassination', 'fine-katana']
                }
            });

            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.hotaru = this.player2.findCardByName('doji-hotaru');
            this.chagatai = this.player1.findCardByName('moto-chagatai');
            this.rider = this.player1.findCardByName('border-rider');
            this.province = this.player2.findCardByName('maelstrom');
            this.pursuit = this.player2.findCardByName('the-pursuit-of-justice');

            this.assassination = this.player2.findCardByName('assassination');
            this.katana = this.player2.findCardByName('fine-katana');
        });

        it('should ask you to discard a card', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.yoshi],
                province: this.province
            });

            this.player2.clickCard(this.province);
            expect(this.player2).toHavePrompt('Discard a card?');
            expect(this.player2).toHavePromptButton('Yes');
            expect(this.player2).toHavePromptButton('No');
        });

        it('if you don\'t discard a card should let you move a character you control to the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.yoshi],
                province: this.province
            });

            this.player2.clickCard(this.province);
            this.player2.clickPrompt('No');
            expect(this.player2).not.toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.hotaru);
            expect(this.player2).not.toBeAbleToSelect(this.rider);
            expect(this.player2).toBeAbleToSelect(this.yoshi);

            expect(this.hotaru.isParticipating()).toBe(false);
            this.player2.clickCard(this.hotaru);
            expect(this.hotaru.isParticipating()).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Maelstrom to move Doji Hotaru into the conflict. It will be honored if it wins the conflict');
        });

        it('if you discard a card should let you move a character anyone controls to the conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.yoshi],
                province: this.province
            });

            this.player2.clickCard(this.province);
            this.player2.clickPrompt('Yes');
            expect(this.player2).toBeAbleToSelect(this.assassination);
            expect(this.player2).toBeAbleToSelect(this.katana);

            this.player2.clickCard(this.assassination);

            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.hotaru);
            expect(this.player2).toBeAbleToSelect(this.rider);
            expect(this.player2).toBeAbleToSelect(this.yoshi);

            expect(this.rider.isParticipating()).toBe(false);
            this.player2.clickCard(this.rider);
            expect(this.rider.isParticipating()).toBe(true);
            expect(this.assassination.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player2 chooses to discard a card');
            expect(this.getChatLogs(5)).toContain('player2 uses Maelstrom, discarding Assassination to move Border Rider into the conflict');
        });

        it('should work at other water provinces', function() {
            this.province.facedown = false;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.yoshi],
                province: this.pursuit
            });

            this.player2.clickCard(this.province);
            this.player2.clickPrompt('No');
            expect(this.player2).not.toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.hotaru);
            expect(this.player2).not.toBeAbleToSelect(this.rider);
            expect(this.player2).toBeAbleToSelect(this.yoshi);

            expect(this.hotaru.isParticipating()).toBe(false);
            this.player2.clickCard(this.hotaru);
            expect(this.hotaru.isParticipating()).toBe(true);
            expect(this.getChatLogs(5)).toContain('player2 uses Maelstrom to move Doji Hotaru into the conflict. It will be honored if it wins the conflict');
        });

        it('should honor if you win and you control the character', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.yoshi],
                province: this.province
            });

            this.player2.clickCard(this.province);
            this.player2.clickPrompt('No');
            this.player2.clickCard(this.hotaru);
            expect(this.getChatLogs(5)).toContain('player2 uses Maelstrom to move Doji Hotaru into the conflict. It will be honored if it wins the conflict');
            expect(this.hotaru.isHonored).toBe(false);
            this.chagatai.bow();
            this.noMoreActions();
            expect(this.hotaru.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('Doji Hotaru is honored due to Maelstrom\'s effect');
        });

        it('should not honor if you win and you don\'t control the target', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.yoshi],
                province: this.province
            });

            this.player2.clickCard(this.province);
            this.player2.clickPrompt('Yes');
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.rider);

            this.chagatai.bow();
            this.rider.bow();
            this.noMoreActions();
            expect(this.rider.isHonored).toBe(false);
            expect(this.getChatLogs(5)).not.toContain('Border Rider is honored due to Maelstrom\'s effect');
        });

        it('should not honor if you lose and you don\'t control the target', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai],
                defenders: [this.yoshi],
                province: this.province
            });

            this.player2.clickCard(this.province);
            this.player2.clickPrompt('Yes');
            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.rider);

            this.noMoreActions();
            this.player1.clickPrompt('No');
            this.player1.clickPrompt('Don\'t Resolve');
            expect(this.rider.isHonored).toBe(false);
            expect(this.getChatLogs(5)).not.toContain('Border Rider is honored due to Maelstrom\'s effect');
        });
    });
});
