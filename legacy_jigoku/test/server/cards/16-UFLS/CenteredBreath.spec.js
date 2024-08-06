describe('Centered Breath', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate', 'doji-challenger', 'ancient-master'],
                    hand: ['centered-breath', 'hurricane-punch', 'fine-katana', 'duelist-training']
                },
                player2: {
                    inPlay: ['doji-kuwanan', 'togashi-kazue'],
                    hand: ['hurricane-punch']
                }
            });

            this.initiate = this.player1.findCardByName('togashi-initiate');
            this.ancientMaster = this.player1.findCardByName('ancient-master');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.hurricane = this.player1.findCardByName('hurricane-punch');
            this.katana = this.player1.findCardByName('fine-katana');
            this.breath = this.player1.findCardByName('centered-breath');
            this.dt = this.player1.findCardByName('duelist-training');

            this.kuwanan = this.player2.findCardByName('doji-kuwanan');
            this.kazue = this.player2.findCardByName('togashi-kazue');
            this.hurricane2 = this.player2.findCardByName('hurricane-punch');

            this.initiate.dishonor();
            this.player1.playAttachment(this.dt, this.ancientMaster);
        });

        it('should allow selecting a participating monk', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan, this.kazue],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.breath);
            expect(this.player1).toBeAbleToSelect(this.initiate);
            expect(this.player1).toBeAbleToSelect(this.kazue);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.ancientMaster);
        });

        it('should give you another use of the printed abilities', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger, this.ancientMaster],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.breath);
            this.player1.clickCard(this.initiate);
            expect(this.player2).toHavePrompt('Conflict Action Window');

            expect(this.getChatLogs(3)).toContain('player1 plays Centered Breath to add an additional use to each of Togashi Initiate\'s printed abilities');
            this.player2.pass();
            this.player1.clickCard(this.initiate);
            this.player1.clickRing('void');
            expect(this.initiate.isDishonored).toBe(false);
            this.player2.pass();
            this.player1.clickCard(this.initiate);
            this.player1.clickRing('void');
            expect(this.initiate.isHonored).toBe(true);
            expect(this.game.rings.void.fate).toBe(2);
        });

        it('should not give you another use of gained abilities', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger, this.ancientMaster],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.breath);
            this.player1.clickCard(this.ancientMaster);
            this.player2.pass();
            this.player1.clickCard(this.ancientMaster);
            this.player1.clickCard(this.kuwanan);
            this.player1.clickPrompt('1');
            this.player2.clickPrompt('1');
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.ancientMaster);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should not give you an extra action if only opponent has played a kiho', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan, this.kazue],
                type: 'military'
            });

            this.player2.clickCard(this.hurricane2);
            this.player2.clickCard(this.kazue);
            this.player1.clickCard(this.breath);
            this.player1.clickCard(this.initiate);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should not give you an extra action if a non-kiho has been played', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.katana);
            this.player1.clickCard(this.initiate);
            this.player2.pass();
            this.player1.clickCard(this.breath);
            this.player1.clickCard(this.initiate);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should honor if a kiho has been played', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.initiate, this.challenger],
                defenders: [this.kuwanan],
                type: 'military'
            });

            this.player2.pass();
            this.player1.clickCard(this.hurricane);
            this.player1.clickCard(this.initiate);
            this.player2.pass();
            this.player1.clickCard(this.breath);
            this.player1.clickCard(this.initiate);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player2).not.toHavePrompt('Conflict Action Window');

            expect(this.getChatLogs(3)).toContain('player1 plays Centered Breath to add an additional use to each of Togashi Initiate\'s printed abilities and take an additional action');
        });
    });
});
