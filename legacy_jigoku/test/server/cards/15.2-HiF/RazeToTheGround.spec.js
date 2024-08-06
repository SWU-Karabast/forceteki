describe('Raze to the Ground', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger', 'akodo-toturi'],
                    hand: ['raze-to-the-ground'],
                    provinces: ['before-the-throne', 'manicured-garden', 'magistrate-station']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu'],
                    provinces: ['public-forum', 'entrenched-position']
                }
            });

            this.challenger = this.player1.findCardByName('doji-challenger');
            this.akodoToturi = this.player1.findCardByName('akodo-toturi');
            this.raze = this.player1.findCardByName('raze-to-the-ground');

            this.throne = this.player1.findCardByName('before-the-throne');
            this.garden = this.player1.findCardByName('manicured-garden');
            this.station = this.player1.findCardByName('magistrate-station');
            this.sd4 = this.player1.findCardByName('shameful-display', 'province 4');

            this.throne.facedown = false;
            this.sd4.facedown = false;
            this.garden.facedown = false;
            this.sd4.isBroken = true;

            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');
            this.publicForum = this.player2.findCardByName('public-forum');
            this.entrenched = this.player2.findCardByName('entrenched-position');

            this.noMoreActions();
        });

        it('should react when you win a military conflict', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.publicForum,
                type: 'military'
            });

            this.noMoreActions();

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.raze);
        });


        it('should not react on political', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.entrenchedPosition,
                type: 'political'
            });

            this.noMoreActions();

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not react with no faceup provinces', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.entrenchedPosition,
                type: 'military'
            });

            this.throne.facedown = true;
            this.garden.facedown = true;

            this.noMoreActions();

            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not react if you lose', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.entrenchedPosition,
                type: 'military'
            });

            this.challenger.bowed = true;
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should ask you to dishonor a participating character you control', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.publicForum,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            expect(this.player1).toHavePrompt('Select character to dishonor');
            expect(this.player1).toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.akodoToturi);
            expect(this.player1).not.toBeAbleToSelect(this.mirumotoRaitsugu);
        });


        it('should ask you to break a faceup province you control', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.publicForum,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            this.player1.clickCard(this.challenger);
            expect(this.challenger.isDishonored).toBe(false);
            expect(this.player1).toHavePrompt('Select a province to break');
            expect(this.player1).toBeAbleToSelect(this.garden);
            expect(this.player1).toBeAbleToSelect(this.throne);
            expect(this.player1).not.toBeAbleToSelect(this.station);
            expect(this.player1).not.toBeAbleToSelect(this.sd4);
        });

        it('should resolve costs simultaneously', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.entrenched,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            this.player1.clickCard(this.challenger);
            expect(this.challenger.isDishonored).toBe(false);
            expect(this.garden.isBroken).toBe(false);
            this.player1.clickCard(this.garden);
            expect(this.challenger.isDishonored).toBe(true);
            expect(this.garden.isBroken).toBe(true);
        });

        it('should give you the option to discard cards in the province you broke', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.entrenched,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.garden);
            expect(this.player1).toHavePrompt('Break Manicured Garden');
            expect(this.player1).toHavePromptButton('Yes');
            expect(this.player1).toHavePromptButton('No');
        });

        it('should break the province', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.entrenched,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.garden);
            this.player1.clickPrompt('No');
            expect(this.entrenched.isBroken).toBe(true);
            expect(this.getChatLogs(10)).toContain('player1 plays Raze to the Ground, dishonoring Doji Challenger and breaking Manicured Garden to break an attacked province');
            expect(this.getChatLogs(10)).toContain('player1 breaks Entrenched Position');
        });

        it('should trigger on break provinces that you break as a cost', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.entrenched,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.throne);

            let p1Honor = this.player1.honor;
            let p2Honor = this.player2.honor;
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.entrenched.isBroken).toBe(false);
            expect(this.player1).toBeAbleToSelect(this.throne);
            this.player1.clickCard(this.throne);
            expect(this.player1.honor).toBe(p1Honor + 2);
            expect(this.player2.honor).toBe(p2Honor - 2);
            this.player1.clickPrompt('No');
            expect(this.entrenched.isBroken).toBe(true);
        });

        it('should trigger on-break for the attacked province', function() {
            this.initiateConflict({
                attackers: [this.challenger],
                defenders: [this.mirumotoRaitsugu],
                province: this.publicForum,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.garden);
            this.player1.clickPrompt('No');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.publicForum);
            this.player2.clickCard(this.publicForum);
            expect(this.publicForum.isBroken).toBe(false);
            expect(this.getChatLogs(10)).toContain('player1 plays Raze to the Ground, dishonoring Doji Challenger and breaking Manicured Garden to break an attacked province');
            expect(this.getChatLogs(10)).toContain('player1 breaks Public Forum');
            expect(this.getChatLogs(10)).toContain('player2 uses Public Forum to add an honor token to Public Forum instead of breaking it');
        });

        it('should work on defense not react if you lose', function() {
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.mirumotoRaitsugu],
                defenders: [this.akodoToturi, this.challenger],
                province: this.garden,
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.raze);
        });

        it('should allow you to break the attacked province as a cost', function() {
            this.player1.passConflict();
            this.noMoreActions();

            this.initiateConflict({
                attackers: [this.mirumotoRaitsugu],
                defenders: [this.akodoToturi, this.challenger],
                province: this.garden,
                type: 'military'
            });

            this.noMoreActions();
            this.player1.clickCard(this.raze);
            this.player1.clickCard(this.akodoToturi);
            this.player1.clickCard(this.garden);
            this.player2.clickPrompt('No');
            expect(this.getChatLogs(10)).toContain('player1 plays Raze to the Ground, dishonoring Akodo Toturi and breaking Manicured Garden to break an attacked province');
        });
    });
});
