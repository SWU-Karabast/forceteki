describe('Kakita Yoshi 2', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi-2', 'maker-of-keepsakes'],
                    hand: ['steward-of-law']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu', 'agasha-swordsmith', 'matsu-berserker', 'akodo-toturi', 'matsu-tsuko-2']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi-2');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.steward = this.player1.findCardByName('steward-of-law');

            this.swordsmith = this.player2.findCardByName('agasha-swordsmith');
            this.berserker = this.player2.findCardByName('matsu-berserker');
            this.matsuTsuko = this.player2.findCardByName('matsu-tsuko-2');
            this.akodoToturi = this.player2.findCardByName('akodo-toturi');
            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');

            this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');

            this.noMoreActions();
        });

        it('should not be able to trigger after winning a mil conflict', function() {
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'military'
            });

            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should not work if you have no faceup provinces', function() {
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Triggered Abilities');
        });

        it('should work after you win a pol conflict with at least one faceup province', function() {
            this.p1.facedown = false;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.noMoreActions();
            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.yoshi);
        });

        it('should let you target characters up to the number of faceup provinces you have and dishonor them', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.noMoreActions();
            this.player1.clickCard(this.yoshi);
            expect(this.player1).toHavePrompt('Select up to 3 characters');

            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).not.toBeAbleToSelect(this.keepsakes);
            expect(this.player1).toBeAbleToSelect(this.matsuTsuko);
            expect(this.player1).toBeAbleToSelect(this.berserker);
            expect(this.player1).toBeAbleToSelect(this.mirumotoRaitsugu);
            expect(this.player1).toBeAbleToSelect(this.swordsmith);
            expect(this.player1).toBeAbleToSelect(this.akodoToturi);

            this.player1.clickCard(this.berserker);
            this.player1.clickCard(this.mirumotoRaitsugu);
            this.player1.clickCard(this.yoshi);

            this.player1.clickPrompt('Done');

            expect(this.berserker.isDishonored).toBe(true);
            expect(this.mirumotoRaitsugu.isDishonored).toBe(true);
            expect(this.yoshi.isDishonored).toBe(true);

            expect(this.getChatLogs(3)).toContain('player1 uses Kakita Yoshi to dishonor Matsu Berserker, Mirumoto Raitsugu and Kakita Yoshi');
        });

        it('should count broken provinces', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p2.isBroken = true;
            this.p3.facedown = false;
            this.p3.isBroken = true;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.noMoreActions();
            this.player1.clickCard(this.yoshi);
            expect(this.player1).toHavePrompt('Select up to 3 characters');
        });

        it('should count the stronghold', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p2.isBroken = true;
            this.p3.facedown = false;
            this.p3.isBroken = true;
            this.p4.facedown = false;
            this.pStronghold.facedown = false;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.noMoreActions();
            this.player1.clickCard(this.yoshi);
            expect(this.player1).toHavePrompt('Select up to 5 characters');
        });

        it('should let you pick less targets than the max', function() {
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p2.isBroken = true;
            this.p3.facedown = false;
            this.p3.isBroken = true;
            this.p4.facedown = false;
            this.pStronghold.facedown = false;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.noMoreActions();
            this.player1.clickCard(this.yoshi);
            expect(this.player1).toHavePrompt('Select up to 5 characters');
            this.player1.clickCard(this.mirumotoRaitsugu);
            this.player1.clickPrompt('Done');

            expect(this.mirumotoRaitsugu.isDishonored).toBe(true);
        });
    });
});
