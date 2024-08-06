describe('Captivating Story', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['kakita-yoshi', 'maker-of-keepsakes'],
                    hand: ['captivating-story']
                },
                player2: {
                    inPlay: ['mirumoto-raitsugu', 'agasha-swordsmith']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.keepsakes = this.player1.findCardByName('maker-of-keepsakes');
            this.story = this.player1.findCardByName('captivating-story');

            this.swordsmith = this.player2.findCardByName('agasha-swordsmith');
            this.mirumotoRaitsugu = this.player2.findCardByName('mirumoto-raitsugu');

            this.p1 = this.player1.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player1.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player1.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.p4 = this.player1.findCardByName('shameful-display', 'province 4');
            this.pStronghold = this.player1.findCardByName('shameful-display', 'stronghold province');
        });

        it ('should not work outside of conflicts', function() {
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.story);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should not work if you have no faceup provinces and character has no fate', function() {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.story);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should work if you have no faceup provinces and character has fate', function() {
            this.noMoreActions();
            this.yoshi.fate = 1;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.story);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yoshi);
        });

        it('should not be able to trigger when not particiapating alone', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            this.initiateConflict({
                attackers: [this.yoshi, this.keepsakes],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.story);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should give you pol equal to the amount of faceup provinces you have', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            let pol = this.yoshi.getPoliticalSkill();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.story);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.getPoliticalSkill()).toBe(pol + 1);
        });

        it('should not give you the option to remove a fate if you cannot do it', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.story);
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            this.player1.clickCard(this.yoshi);
            expect(this.player2).toHavePrompt('Conflict Action Window');
        });

        it('should let you choose to discard a fate', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.yoshi.fate = 1;
            let pol = this.yoshi.getPoliticalSkill();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.story);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.getPoliticalSkill()).toBe(pol + 3);
            expect(this.player1).toHavePrompt('Remove 1 fate from Kakita Yoshi to honor them?');
        });

        it('should discard the fate to honor the character', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.yoshi.fate = 1;
            let pol = this.yoshi.getPoliticalSkill();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.story);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.getPoliticalSkill()).toBe(pol + 3);
            expect(this.player1).toHavePrompt('Remove 1 fate from Kakita Yoshi to honor them?');
            this.player1.clickPrompt('Yes');
            expect(this.yoshi.fate).toBe(0);
            expect(this.yoshi.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Captivating Story to give Kakita Yoshi +1political for each faceup province they control (+3political)');
            expect(this.getChatLogs(5)).toContain('player1 chooses to remove a fate from Kakita Yoshi to honor them');
            expect(this.getChatLogs(5)).toContain('player1 resolves Captivating Story to honor Kakita Yoshi');
        });

        it('should not discard the fate to honor the character if you say no', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p3.facedown = false;
            this.yoshi.fate = 1;
            let pol = this.yoshi.getPoliticalSkill();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.story);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.getPoliticalSkill()).toBe(pol + 3);
            expect(this.player1).toHavePrompt('Remove 1 fate from Kakita Yoshi to honor them?');
            this.player1.clickPrompt('No');
            expect(this.yoshi.fate).toBe(1);
            expect(this.yoshi.isHonored).toBe(false);
            expect(this.getChatLogs(5)).toContain('player1 plays Captivating Story to give Kakita Yoshi +1political for each faceup province they control (+3political)');
            expect(this.getChatLogs(5)).toContain('player1 chooses not to remove a fate from Kakita Yoshi to honor them');
        });

        it('should count broken provinces', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p2.isBroken = true;
            this.p3.facedown = false;
            this.p3.isBroken = true;
            let pol = this.yoshi.getPoliticalSkill();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.story);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.getPoliticalSkill()).toBe(pol + 3);
        });

        it('should count the stronghold', function() {
            this.noMoreActions();
            this.p1.facedown = false;
            this.p2.facedown = false;
            this.p2.isBroken = true;
            this.p3.facedown = false;
            this.p3.isBroken = true;
            this.p4.facedown = false;
            this.pStronghold.facedown = false;
            let pol = this.yoshi.getPoliticalSkill();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            this.player1.clickCard(this.story);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.getPoliticalSkill()).toBe(pol + 5);
        });

        it('should force you to honor if you have no faceup provinces', function() {
            this.noMoreActions();
            this.yoshi.fate = 1;
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                type: 'political'
            });

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.story);
            this.player1.clickCard(this.yoshi);
            expect(this.yoshi.fate).toBe(0);
            expect(this.yoshi.isHonored).toBe(true);
            expect(this.getChatLogs(5)).toContain('player1 plays Captivating Story to give Kakita Yoshi +1political for each faceup province they control (+0political)');
            expect(this.getChatLogs(5)).toContain('player1 chooses to remove a fate from Kakita Yoshi to honor them');
            expect(this.getChatLogs(5)).toContain('player1 resolves Captivating Story to honor Kakita Yoshi');
        });
    });
});
