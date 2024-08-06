describe('Meticulous Scout', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['meticulous-scout'],
                    conflictDiscard: ['let-go', 'assassination', 'fine-katana', 'hiruma-skirmisher']
                },
                player2: {
                    inPlay: ['young-rumormonger', 'ardent-omoidasu'],
                    hand: ['perfect-land-ethos'],
                    provinces: ['khan-s-ordu', 'manicured-garden', 'shameful-display', 'pilgrimage']
                }
            });

            this.scout = this.player1.findCardByName('meticulous-scout');
            this.p1_1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p1_2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p1_3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_Stronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.khan = this.player2.findCardByName('khan-s-ordu');
            this.manicured = this.player2.findCardByName('manicured-garden');
            this.shameful = this.player2.findCardByName('shameful-display');
            this.pilgrimage = this.player2.findCardByName('pilgrimage');
            this.p2_Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.yrm = this.player2.findCardByName('young-rumormonger');
            this.omoidasu = this.player2.findCardByName('ardent-omoidasu');
            this.ethos = this.player2.findCardByName('perfect-land-ethos');

            this.pilgrimage.facedown = false;
            this.shameful.isBroken = true;
        });

        it('should not trigger if you haven\'t gained 2 honor this phase yet', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.scout);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not trigger if you have gained only 1 honor this phase', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [],
                type: 'military',
                province: this.manicured
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Take 1 Honor from opponent');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.scout);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should trigger if you have gained 2 honor this phase', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.scout],
                defenders: [],
                type: 'military',
                province: this.manicured
            });

            this.player2.pass();
            this.player1.pass();
            this.player1.clickPrompt('Gain 2 Honor');

            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.scout);
            expect(this.player1).toHavePrompt('Choose a province');

        });

        it('should let you choose a province controlled by the conflict loser regardless of revealed or not', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                ring:'air',
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');

            this.player1.clickCard(this.scout);
            expect(this.player1).toBeAbleToSelect(this.khan);
            expect(this.player1).toBeAbleToSelect(this.manicured);
            expect(this.player1).toBeAbleToSelect(this.shameful);
            expect(this.player1).toBeAbleToSelect(this.pilgrimage);
            expect(this.player1).toBeAbleToSelect(this.p2_Stronghold);

            expect(this.player1).not.toBeAbleToSelect(this.p1_1);
            expect(this.player1).not.toBeAbleToSelect(this.p1_2);
            expect(this.player1).not.toBeAbleToSelect(this.p1_3);
            expect(this.player1).not.toBeAbleToSelect(this.p1_4);
            expect(this.player1).not.toBeAbleToSelect(this.p1_Stronghold);
        });

        it('should dishonor (blanking) and reveal the province - should not trigger reveal abilities', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                ring:'air',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');

            this.player1.clickCard(this.scout);
            this.player1.clickCard(this.khan);
            expect(this.khan.isDishonored).toBe(true);
            expect(this.khan.facedown).toBe(false);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should dishonor (blanking) and reveal the province - action abilities', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');

            this.player1.clickCard(this.scout);
            this.player1.clickCard(this.manicured);
            expect(this.manicured.isDishonored).toBe(true);
            expect(this.manicured.facedown).toBe(false);

            this.scout.bowed = false;
            this.noMoreActions();
            this.player2.passConflict();

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'earth',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });

            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.manicured);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('Perfect Land Ethos should discard the token and un-blank it', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');

            this.player1.clickCard(this.scout);
            this.player1.clickCard(this.manicured);
            expect(this.manicured.isDishonored).toBe(true);
            expect(this.manicured.facedown).toBe(false);

            this.scout.bowed = false;
            this.player2.clickCard(this.ethos);

            expect(this.manicured.isDishonored).toBe(false);
            expect(this.manicured.facedown).toBe(false);

            this.noMoreActions();
            this.player2.passConflict();

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'earth',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });

            let fate = this.player2.fate;
            expect(this.player2).toHavePrompt('Conflict Action Window');
            this.player2.clickCard(this.manicured);
            expect(this.player1).toHavePrompt('Conflict Action Window');
            expect(this.player2.fate).toBe(fate + 1);
        });

        it('Chat Messages - unrevealed province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');
            this.player1.clickCard(this.scout);
            this.player1.clickCard(this.khan);

            expect(this.getChatLogs(10)).toContain('player1 uses Meticulous Scout to place a dishonored status token on province 1, blanking it');
            expect(this.getChatLogs(10)).toContain('player1 reveals Khan\'s Ordu due to Meticulous Scout');
        });

        it('Chat Messages - revealed province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');
            this.player1.clickCard(this.scout);
            this.player1.clickCard(this.pilgrimage);

            expect(this.getChatLogs(10)).toContain('player1 uses Meticulous Scout to place a dishonored status token on Pilgrimage, blanking it');
            expect(this.getChatLogs(10)).not.toContain('player1 reveals Pilgrimage due to Meticulous Scout');
        });

        it('should not trigger Young Rumormonger', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');
            this.player1.clickCard(this.scout);
            this.player1.clickCard(this.manicured);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger Ardent Omoidasu', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.scout],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickPrompt('Gain 2 Honor');
            this.player1.clickCard(this.scout);
            this.player1.clickCard(this.manicured);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });
    });
});
