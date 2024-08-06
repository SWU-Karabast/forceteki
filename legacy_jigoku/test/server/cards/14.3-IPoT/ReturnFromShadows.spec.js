describe('Return From Shadows', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['brash-samurai'],
                    hand: ['return-from-shadows', 'assassination']
                },
                player2: {
                    inPlay: ['doji-representative'],
                    hand: ['perfect-land-ethos'],
                    provinces: ['night-raid', 'manicured-garden', 'shameful-display', 'pilgrimage'],
                    dynastyDiscard: ['young-rumormonger', 'ardent-omoidasu']
                }
            });

            this.brash = this.player1.findCardByName('brash-samurai');
            this.dojiRep = this.player2.findCardByName('doji-representative');

            this.returnFromShadows = this.player1.findCardByName('return-from-shadows');
            this.ethos = this.player2.findCardByName('perfect-land-ethos');

            this.p1_1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p1_2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p1_3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p1_Stronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.nightRaid = this.player2.findCardByName('night-raid');
            this.manicured = this.player2.findCardByName('manicured-garden');
            this.shameful = this.player2.findCardByName('shameful-display');
            this.pilgrimage = this.player2.findCardByName('pilgrimage');
            this.p2_Stronghold = this.player2.findCardByName('shameful-display', 'stronghold province');

            this.yrm = this.player2.findCardByName('young-rumormonger');
            this.omoidasu = this.player2.findCardByName('ardent-omoidasu');

            this.pilgrimage.facedown = false;
            this.shameful.isBroken = true;
        });

        it('should prompt after you win unopposed on attack', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.returnFromShadows);
        });

        it('should not prompt after you win opposed', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [this.dojiRep],
                province: this.manicured
            });
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not prompt after you win unopposed on defense (RAW - not unopposed)', function () {
            this.noMoreActions();
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.dojiRep],
                defenders: [this.brash]
            });
            this.player1.pass();
            this.player2.clickCard(this.dojiRep);
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should let you choose a province controlled by the conflict loser regardless of revealed or not', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickCard(this.returnFromShadows);

            expect(this.player1).toBeAbleToSelect(this.nightRaid);
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
                attackers: [this.brash],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.nightRaid);
            expect(this.nightRaid.isDishonored).toBe(true);
            expect(this.nightRaid.facedown).toBe(false);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should dishonor (blanking) and reveal the province - constant abilities', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [],
                province: this.pilgrimage
            });
            this.noMoreActions();
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.pilgrimage);
            expect(this.pilgrimage.isDishonored).toBe(true);
            expect(this.pilgrimage.facedown).toBe(false);
            expect(this.player1).toHavePrompt('Air Ring');
        });

        it('should dishonor (blanking) and reveal the province - action abilities', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [],
                province: this.pilgrimage
            });
            this.noMoreActions();
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.manicured);
            expect(this.manicured.isDishonored).toBe(true);
            expect(this.manicured.facedown).toBe(false);

            this.brash.bowed = false;
            this.noMoreActions();
            this.player2.passConflict();

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'earth',
                attackers: [this.brash],
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
                attackers: [this.brash],
                defenders: [],
                province: this.pilgrimage
            });
            this.noMoreActions();
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.manicured);
            expect(this.manicured.isDishonored).toBe(true);
            expect(this.manicured.facedown).toBe(false);

            this.brash.bowed = false;
            this.player1.pass();
            this.player2.clickCard(this.ethos);

            expect(this.manicured.isDishonored).toBe(false);
            expect(this.manicured.facedown).toBe(false);

            this.noMoreActions();
            this.player2.passConflict();

            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                ring: 'earth',
                attackers: [this.brash],
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
                attackers: [this.brash],
                defenders: [],
                province: this.pilgrimage
            });
            this.noMoreActions();
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.manicured);

            expect(this.getChatLogs(10)).toContain('player1 plays Return From Shadows to place a dishonored status token on province 2, blanking it');
            expect(this.getChatLogs(10)).toContain('player1 reveals Manicured Garden due to Return From Shadows');
        });

        it('Chat Messages - revealed province', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [],
                province: this.pilgrimage
            });
            this.noMoreActions();
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.pilgrimage);

            expect(this.getChatLogs(10)).toContain('player1 plays Return From Shadows to place a dishonored status token on Pilgrimage, blanking it');
            expect(this.getChatLogs(10)).not.toContain('player1 reveals Pilgrimage due to Return From Shadows');
        });

        it('should not trigger Young Rumormonger', function () {
            this.player2.moveCard(this.yrm, 'play area');
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.returnFromShadows);
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.manicured);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });

        it('should not trigger Ardent Omoidasu', function () {
            this.player2.moveCard(this.omoidasu, 'play area');
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.brash],
                defenders: [],
                province: this.manicured
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.returnFromShadows);
            this.player1.clickCard(this.returnFromShadows);
            this.player1.clickCard(this.manicured);
            expect(this.player2).not.toHavePrompt('Triggered Abilities');
        });
    });
});
