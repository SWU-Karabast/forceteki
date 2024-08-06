describe('Dai-Tsuchi', function () {
    integration(function () {
        describe('attachment requirements', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kaiu-envoy', 'shrewd-yasuki', 'hida-kisada'],
                        hand: ['fine-katana', 'dai-tsuchi']
                    }
                });

                this.envoy = this.player1.findCardByName('kaiu-envoy');
                this.shrewd = this.player1.findCardByName('shrewd-yasuki');
                this.kisada = this.player1.findCardByName('hida-kisada');
                this.katana = this.player1.findCardByName('fine-katana');
                this.daiTsuchi = this.player1.findCardByName('dai-tsuchi');

                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.shrewd);
                this.player2.pass();
            });

            it('can only be attached on strong characters', function () {
                this.player1.clickCard(this.daiTsuchi);

                expect(this.player1).not.toBeAbleToSelect(this.envoy);
                expect(this.player1).not.toBeAbleToSelect(this.shrewd);
                expect(this.player1).toBeAbleToSelect(this.kisada);

                this.player1.clickCard(this.kisada);
                expect(this.daiTsuchi.location).toBe('play area');
            });
        });

        describe('action ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kuni-purifier'],
                        hand: ['dai-tsuchi']
                    },
                    player2: {
                        inPlay: ['adept-of-the-waves', 'miya-mystic'],
                        hand: ['ornate-fan', 'cloud-the-mind', 'sato']
                    }
                });

                this.purifier = this.player1.findCardByName('kuni-purifier');
                this.sato = this.player2.findCardByName('sato');

                this.player1.pass();
                this.player2.playAttachment('ornate-fan', 'adept-of-the-waves');
                this.player1.playAttachment('dai-tsuchi', 'kuni-purifier');
                this.player2.playAttachment('cloud-the-mind', 'miya-mystic');
                this.player1.pass();
                this.player2.playAttachment(this.sato, this.purifier);
                this.ornatefan = this.player2.findCardByName('ornate-fan');
                this.daiTsuchi = this.player1.findCardByName('dai-tsuchi');
                this.cloud = this.player2.findCardByName('cloud-the-mind');
                this.adept = this.player2.findCardByName('adept-of-the-waves');
                this.adept.fate = 1;
                this.noMoreActions();
            });

            it('should return attachment to hand', function () {
                this.initiateConflict({
                    attackers: [this.purifier],
                    defenders: [this.adept],
                    type: 'military'
                });
                this.player2.pass();
                this.player1.clickCard(this.purifier);
                expect(this.ornatefan.location).toBe('play area');
                this.player1.clickCard(this.ornatefan);
                expect(this.ornatefan.location).toBe('hand');
            });

            it('should only allow choosing participating character attachments', function () {
                this.initiateConflict({
                    attackers: [this.purifier],
                    defenders: [this.adept],
                    type: 'military'
                });
                this.player2.pass();
                this.player1.clickCard(this.purifier);
                expect(this.player1).toBeAbleToSelect(this.ornatefan);
                expect(this.player1).not.toBeAbleToSelect(this.daiTsuchi);
                expect(this.player1).not.toBeAbleToSelect(this.cloud);
                expect(this.player1).not.toBeAbleToSelect(this.sato);
            });

            it('should not allow copies of attachment be played again until end of conflict', function () {
                this.initiateConflict({
                    attackers: [this.purifier],
                    defenders: ['adept-of-the-waves'],
                    type: 'military',
                    ring: 'air'
                });
                this.player2.pass();
                this.player1.clickCard(this.purifier);
                this.player1.clickCard(this.ornatefan);
                expect(this.getChatLogs(3)).toContain(
                    "player1 uses Kuni Purifier's gained ability from Dai Tsuchi to return Ornate Fan to player2's hand and prevent them from playing copies this conflict"
                );

                // ornate fan should stay in hand and not play
                this.player2.clickCard(this.ornatefan);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.ornatefan.location).toBe('hand');
            });
        });
    });
});