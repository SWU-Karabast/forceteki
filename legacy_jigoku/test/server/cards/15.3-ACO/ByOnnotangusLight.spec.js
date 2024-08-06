describe('By Onnotangu\'s Light', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['border-rider','isawa-ujina','mirumoto-raitsugu','steward-of-cryptic-lore', 'hida-kisada'],
                    hand: ['cavalry-reserves', 'darkness-rising', 'chikara', 'prepared-ambush'],
                    dynastyDiscard: ['shinjo-kyora', 'ikoma-prodigy']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'solemn-scholar'],
                    hand: ['assassination', 'consumed-by-five-fires', 'embrace-the-void', 'cloud-the-mind', 'way-of-the-open-hand'],
                    provinces: ['by-onnotangu-s-light', 'fertile-fields']
                }
            });
            this.rider = this.player1.findCardByName('border-rider');
            this.ujina = this.player1.findCardByName('isawa-ujina');
            this.raitsugu = this.player1.findCardByName('mirumoto-raitsugu');
            this.steward = this.player1.findCardByName('steward-of-cryptic-lore');
            this.cavRes = this.player1.findCardByName('cavalry-reserves');
            this.kyora = this.player1.placeCardInProvince('shinjo-kyora', 'province 1');
            this.kisada = this.player1.findCardByName('hida-kisada');
            this.chikara = this.player1.findCardByName('chikara');
            this.darkness = this.player1.findCardByName('darkness-rising');
            this.prodigy = this.player1.placeCardInProvince('ikoma-prodigy', 'province 2');
            this.ambush = this.player1.findCardByName('prepared-ambush');

            this.kyora.facedown = false;
            this.prodigy.facedown = false;

            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.scholar = this.player2.findCardByName('solemn-scholar');
            this.fires = this.player2.findCardByName('consumed-by-five-fires');
            this.etv = this.player2.findCardByName('embrace-the-void');
            this.assassination = this.player2.findCardByName('assassination');
            this.light = this.player2.findCardByName('by-onnotangu-s-light');
            this.fields = this.player2.findCardByName('fertile-fields');
            this.cloud = this.player2.findCardByName('cloud-the-mind');
            this.openHand = this.player2.findCardByName('way-of-the-open-hand');

            this.rider.fate = 2;
            this.ujina.fate = 1;
            this.raitsugu.fate = 5;
            this.steward.fate = 3;
            this.whisperer.fate = 3;
            this.scholar.fate = 4;
            this.kisada.fate = 10;

            this.player1.playAttachment(this.chikara, this.kisada);
            this.player2.playAttachment(this.cloud, this.kisada);
            this.player1.pass();
            this.player2.playAttachment(this.etv, this.rider);
        });

        describe('Cannot Move or Remove', function() {
            it('move - Chikara', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.light
                });
                this.noMoreActions();
                let fate = this.player2.fate;
                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.kisada);
                this.player1.clickCard(this.kisada);
                this.player1.clickCard(this.scholar);
                expect(this.player2.fate).toBe(fate);
                expect(this.scholar.location).toBe('dynasty discard pile');
            });

            it('interrupt to remove should not trigger - ETV', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.light
                });
                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.rider);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.rider.location).toBe('dynasty discard pile');
            });

            it('cards should not have fate in the discard pile', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.light
                });
                expect(this.rider.fate).not.toBe(0);
                this.player2.clickCard(this.assassination);
                this.player2.clickCard(this.rider);
                expect(this.player1).toHavePrompt('Conflict Action Window');
                expect(this.rider.location).toBe('dynasty discard pile');
                expect(this.rider.fate).toBe(0);
                this.player1.clickCard(this.cavRes);
                this.player1.clickCard(this.rider);
                this.player1.clickPrompt('Done');
                expect(this.rider.location).toBe('play area');
                expect(this.rider.fate).toBe(0);
            });

            it('CBFF - should not be able to play', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.light
                });
                expect(this.rider.getFate()).toBe(0);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.fires);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Maho - should not be able to play', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.light
                });
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.darkness);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('disguised - should not get fate', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.light
                });
                this.player2.pass();
                this.player1.clickCard(this.kyora);
                this.player1.clickCard(this.rider);
                expect(this.kyora.fate).toBe(0);
            });

            it('void ring - should have no eligible targets', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    defenders: [this.scholar],
                    province: this.light,
                    ring: 'void'
                });
                this.noMoreActions();
                expect(this.getChatLogs(10)).toContain('player1 attempted to use Void Ring, but there are insufficient legal targets');
            });

            it('CBFF - should work if not in conflict', function() {
                this.player1.pass();
                expect(this.player2).toHavePrompt('Action Window');
                this.player2.clickCard(this.fires);
                expect(this.player2).toHavePrompt('Consumed by Five Fires');
            });

            it('CBFF - should work if not in conflict', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.fields
                });
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.fires);
                expect(this.player2).toHavePrompt('Consumed by Five Fires');
            });
        });

        describe('considered to have no fate', function() {
            it('getFate should return 0', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kisada],
                    defenders: [this.scholar],
                    province: this.light
                });
                expect(this.kisada.getFate()).toBe(0);
                expect(this.scholar.getFate()).toBe(0);
                expect(this.whisperer.getFate()).toBe(0);
                expect(this.rider.getFate()).toBe(0);
                expect(this.steward.getFate()).toBe(0);
                expect(this.ujina.getFate()).toBe(0);
                expect(this.raitsugu.getFate()).toBe(0);
            });

            it('ujina should be able to kill anyone', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    defenders: [this.scholar],
                    province: this.light,
                    ring: 'void'
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Isawa Ujina');
                expect(this.player1).toBeAbleToSelect(this.kisada);
                expect(this.player1).toBeAbleToSelect(this.scholar);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).toBeAbleToSelect(this.rider);
                expect(this.player1).toBeAbleToSelect(this.steward);
                expect(this.player1).toBeAbleToSelect(this.ujina);
                expect(this.player1).toBeAbleToSelect(this.raitsugu);

                this.player1.clickCard(this.raitsugu);
                expect(this.raitsugu.location).toBe('removed from game');
                expect(this.raitsugu.fate).toBe(0);
            });

            it('raitsugu should be able to kill anyone', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.raitsugu],
                    defenders: [this.scholar],
                    province: this.light,
                    ring: 'air'
                });

                this.player2.pass();
                this.player1.clickCard(this.raitsugu);
                this.player1.clickCard(this.scholar);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Duel Effect: discard Solemn Scholar');
                expect(this.scholar.location).toBe('dynasty discard pile');
                expect(this.scholar.fate).toBe(0);
            });

            it('dire should enable for everyone', function() {
                expect(this.steward.getPoliticalSkill()).toBe(3);
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.raitsugu],
                    defenders: [this.scholar],
                    province: this.light,
                    ring: 'air'
                });

                expect(this.steward.getPoliticalSkill()).toBe(6);
            });

            it('water ring should be able to bow anyone', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    defenders: [this.scholar],
                    province: this.light,
                    ring: 'water'
                });
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Water Ring');
                expect(this.player1).toBeAbleToSelect(this.kisada);
                expect(this.player1).toBeAbleToSelect(this.scholar);
                expect(this.player1).toBeAbleToSelect(this.whisperer);
                expect(this.player1).toBeAbleToSelect(this.rider);
                expect(this.player1).toBeAbleToSelect(this.steward);
                expect(this.player1).toBeAbleToSelect(this.ujina);
                expect(this.player1).toBeAbleToSelect(this.raitsugu);

                this.player1.clickCard(this.raitsugu);
                expect(this.raitsugu.bowed).toBe(true);
            });

            it('prodigy should still react if played with fate', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.rider],
                    defenders: [this.scholar],
                    province: this.light,
                    ring: 'water'
                });
                this.player2.pass();
                this.player1.playAttachment(this.ambush, this.light);
                this.player2.pass();
                let honor = this.player1.honor;
                this.player1.clickCard(this.prodigy);
                this.player1.clickPrompt('1');
                expect(this.player1).toBeAbleToSelect(this.prodigy);
                this.player1.clickCard(this.prodigy);
                expect(this.player1.honor).toBe(honor + 1);
            });

            it('should only work if it\'s the conflict province', function() {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.raitsugu],
                    defenders: [this.scholar],
                    province: this.fields,
                    ring: 'water'
                });
                expect(this.raitsugu.getFate()).not.toBe(0);
                this.player2.pass();
                this.player1.clickCard(this.raitsugu);
                this.player1.clickCard(this.scholar);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.getChatLogs(5)).toContain('Duel Effect: remove 1 fate from Solemn Scholar');
                this.noMoreActions();
                expect(this.getChatLogs(10)).toContain('player1 attempted to use Water Ring, but there are insufficient legal targets');
            });
        });
    });
});
