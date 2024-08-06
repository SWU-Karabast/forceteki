describe('A War on Two Fronts', function() {
    integration(function() {
        describe('Basic interactions', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['doji-challenger'],
                        hand: ['a-war-on-two-fronts', 'a-new-name'],
                        honor: 12
                    },
                    player2: {
                        honor: 10,
                        inPlay: ['doji-whisperer'],
                        hand: ['nezumi-infiltrator'],
                        provinces: ['manicured-garden', 'before-the-throne', 'midnight-revels', 'kuni-wasteland'],
                        dynastyDiscard: ['kakita-toshimoko', 'kakita-yoshi']
                    }
                });

                this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.ann = this.player1.findCardByName('a-new-name');
                this.war = this.player1.findCardByName('a-war-on-two-fronts');

                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.yoshi = this.player2.findCardByName('kakita-yoshi');

                this.player2.placeCardInProvince(this.toshimoko, 'province 1');
                this.player2.placeCardInProvince(this.yoshi, 'province 2');

                this.toshimoko.facedown = false;
                this.yoshi.facedown = false;
                this.garden = this.player2.findCardByName('manicured-garden');
                this.throne = this.player2.findCardByName('before-the-throne');
                this.revels = this.player2.findCardByName('midnight-revels');
                this.wasteland = this.player2.findCardByName('kuni-wasteland');
                this.sd = this.player2.findCardByName('shameful-display', 'stronghold province');
                this.throne.facedown = true;
                this.nezumi = this.player2.findCardByName('nezumi-infiltrator');
            });

            it('should trigger on your mil attack when more honorable', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military'
                });

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.war);
            });

            it('should trigger on your mil attack when equally honorable', function() {
                this.player2.honor = this.player1.honor;
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military'
                });

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose Defenders');
            });

            it('should trigger on your mil attack when less honorable', function() {
                this.player2.honor = this.player1.honor + 1;
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military'
                });

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose Defenders');
            });

            it('should not trigger on your pol attack', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'political'
                });

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player2).toHavePrompt('Choose Defenders');
            });

            it('should not trigger on opponent\'s attack', function() {
                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.dojiWhisperer],
                    type: 'military'
                });

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).toHavePrompt('Choose Defenders');
            });

            it('should let you pick an eligible province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military'
                });
                this.player1.clickCard(this.war);
                expect(this.player1).not.toBeAbleToSelect(this.garden);
                expect(this.player1).toBeAbleToSelect(this.throne);
                expect(this.player1).toBeAbleToSelect(this.revels);
                expect(this.player1).toBeAbleToSelect(this.wasteland);
                expect(this.player1).not.toBeAbleToSelect(this.sd);
            });

            it('should make both provinces attacked provinces and reveal the chosen province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.throne);
                expect(this.getChatLogs(10)).toContain('player1 plays A War on Two Fronts to reveal and also attack Before the Throne this conflict!');
                expect(this.game.currentConflict.getConflictProvinces()).toContain(this.garden);
                expect(this.game.currentConflict.getConflictProvinces()).toContain(this.throne);
            });

            it('should break both provinces attacked provinces if you win by enough', function() {
                this.challenger.honor();
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.throne);

                let honor = this.player1.honor;

                this.player2.clickPrompt('Done');
                this.player2.clickCard(this.garden);
                expect(this.getChatLogs(5)).toContain('Attacker is winning the conflict - Manicured Garden and Before the Throne are breaking!');
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Break Manicured Garden');
                this.player1.clickPrompt('No');
                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.throne);
                this.player2.clickCard(this.throne);

                expect(this.player1.honor).toBe(honor - 2);
                expect(this.player1).toHavePrompt('Break Before the Throne');
                this.player1.clickPrompt('No');
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should only break one province if you win by enough for one but not the other', function() {
                this.player1.playAttachment(this.ann, this.challenger);
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military',
                    province: this.throne
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.garden);

                this.player2.clickPrompt('Done');
                this.player2.clickCard(this.garden);
                expect(this.getChatLogs(5)).toContain('Attacker is winning the conflict - Manicured Garden is breaking!');
                this.noMoreActions();
                expect(this.player1).toHavePrompt('Break Manicured Garden');
                this.player1.clickPrompt('No');
                this.player1.clickPrompt('Don\'t Resolve');
                expect(this.player1).toHavePrompt('Action Window');
            });

            it('should grab constant effects from the second', function() {
                this.player1.playAttachment(this.ann, this.challenger);
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.wasteland);

                this.player2.clickPrompt('Done');
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
                this.player1.clickCard(this.challenger);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('should let you trigger action abilities on the second province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military',
                    province: this.wasteland
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.garden);

                this.player2.clickPrompt('Done');

                let fate = this.player2.fate;
                this.player2.clickCard(this.garden);
                expect(this.player2.fate).toBe(fate + 1);
            });

            it('should not trigger reactions to conflicts being declared against the second province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.revels);

                expect(this.player2).toHavePrompt('Choose defenders');
                this.player2.clickPrompt('Done');
            });

            it('should let you choose which province to affect when something talks about the attacked province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.challenger],
                    type: 'military',
                    province: this.throne
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.garden);

                this.player2.clickPrompt('Done');

                this.player2.clickCard(this.nezumi);
                this.player2.clickPrompt('0');
                this.player2.clickPrompt('Conflict');

                this.player2.clickCard(this.nezumi);
                expect(this.player2).toHavePrompt('Choose an attacked province');
                expect(this.player2).toBeAbleToSelect(this.garden);
                expect(this.player2).toBeAbleToSelect(this.throne);
                this.player2.clickCard(this.garden);
                expect(this.player2).toHavePrompt('Select an action:');
                this.player2.clickPrompt('Lower attacked province\'s strength by 1');
                expect(this.garden.getStrength()).toBe(3);
            });
        });

        describe('Edge Cases', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        honor: 12,
                        inPlay: ['cunning-negotiator', 'ikoma-tsanuri-2'],
                        hand: ['a-war-on-two-fronts', 'a-new-name']
                    },
                    player2: {
                        honor: 10,
                        inPlay: ['doji-whisperer'],
                        hand: ['raise-the-alarm', 'talisman-of-the-sun'],
                        provinces: ['manicured-garden', 'meditations-on-the-tao', 'midnight-revels', 'defend-the-wall'],
                        dynastyDiscard: ['kakita-toshimoko', 'kakita-yoshi']
                    }
                });

                this.dojiWhisperer = this.player2.findCardByName('doji-whisperer');
                this.negotiator = this.player1.findCardByName('cunning-negotiator');
                this.tsanuri = this.player1.findCardByName('ikoma-tsanuri-2');
                this.ann = this.player1.findCardByName('a-new-name');
                this.war = this.player1.findCardByName('a-war-on-two-fronts');

                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.yoshi = this.player2.findCardByName('kakita-yoshi');
                this.talisman = this.player2.findCardByName('talisman-of-the-sun');

                this.player2.placeCardInProvince(this.toshimoko, 'province 1');
                this.player2.placeCardInProvince(this.yoshi, 'province 2');

                this.negotiator.fate = 5;
                this.tsanuri.fate = 4;

                this.toshimoko.facedown = true;
                this.yoshi.facedown = true;
                this.garden = this.player2.findCardByName('manicured-garden');
                this.tao = this.player2.findCardByName('meditations-on-the-tao');
                this.revels = this.player2.findCardByName('midnight-revels');
                this.wall = this.player2.findCardByName('defend-the-wall');
                this.sd = this.player2.findCardByName('shameful-display', 'stronghold province');
                this.alarm = this.player2.findCardByName('raise-the-alarm');
            });

            it('raise the alarm should let you choose a character in either province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.negotiator],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.tao);

                this.player2.clickCard(this.dojiWhisperer);
                this.player2.clickPrompt('Done');

                this.player2.clickCard(this.alarm);
                expect(this.player2).toBeAbleToSelect(this.toshimoko);
                expect(this.player2).toBeAbleToSelect(this.yoshi);
                this.player2.clickCard(this.yoshi);
                expect(this.yoshi.location).toBe('play area');
            });

            it('cunning negotiator should let you trigger either province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.negotiator],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.tao);

                this.player2.clickCard(this.dojiWhisperer);
                this.player2.clickPrompt('Done');

                this.player2.pass();
                this.player1.clickCard(this.negotiator);
                this.player2.clickCard(this.dojiWhisperer);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                let fate = this.negotiator.fate;
                expect(this.player1).toHavePrompt('Do you want to trigger a province ability?');
                this.player1.clickPrompt('Yes');
                expect(this.player1).toHavePrompt('Choose an attacked province');
                expect(this.player1).toBeAbleToSelect(this.garden);
                expect(this.player1).toBeAbleToSelect(this.tao);
                this.player1.clickCard(this.tao);
                this.player1.clickCard(this.negotiator);
                expect(this.negotiator.fate).toBe(fate - 1);
            });

            it('cunning negotiator - saying no', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.negotiator],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.tao);

                this.player2.clickCard(this.dojiWhisperer);
                this.player2.clickPrompt('Done');

                this.player2.pass();
                this.player1.clickCard(this.negotiator);
                this.player2.clickCard(this.dojiWhisperer);
                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Do you want to trigger a province ability?');
                this.player1.clickPrompt('No');
                expect(this.player1).not.toHavePrompt('Choose an attacked province');
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Tsanuri2 - should prevent triggering both', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.tsanuri],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.tao);

                this.player2.clickCard(this.dojiWhisperer);
                this.player2.clickPrompt('Done');

                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.garden);
                expect(this.player2).toHavePrompt('Conflict Action Window');
                this.player2.clickCard(this.tao);
                expect(this.player2).toHavePrompt('Conflict Action Window');
            });

            it('Talisman - should not let you pick the extra province and should keep it in the conflict', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.tsanuri],
                    type: 'military',
                    province: this.garden
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.tao);

                this.player2.clickCard(this.dojiWhisperer);
                this.player2.clickPrompt('Done');
                this.player2.playAttachment(this.talisman, this.dojiWhisperer);
                this.player1.pass();

                this.player2.clickCard(this.talisman);
                expect(this.player2).not.toBeAbleToSelect(this.garden);
                expect(this.player2).not.toBeAbleToSelect(this.tao);
                expect(this.player2).toBeAbleToSelect(this.revels);
                expect(this.player2).toBeAbleToSelect(this.wall);
                expect(this.player2).not.toBeAbleToSelect(this.sd);

                this.player2.clickCard(this.revels);

                expect(this.game.currentConflict.getConflictProvinces()).not.toContain(this.garden);
                expect(this.game.currentConflict.getConflictProvinces()).toContain(this.tao);
                expect(this.game.currentConflict.getConflictProvinces()).toContain(this.revels);
            });

            it('Defend The Wall - should trigger if its the second province', function() {
                this.noMoreActions();

                this.initiateConflict({
                    attackers: [this.negotiator],
                    type: 'military',
                    province: this.garden,
                    ring: 'air'
                });
                this.player1.clickCard(this.war);
                this.player1.clickCard(this.wall);

                this.player2.clickCard(this.dojiWhisperer);
                this.player2.clickPrompt('Done');
                this.player2.playAttachment(this.talisman, this.dojiWhisperer);
                this.negotiator.bowed = true;
                this.noMoreActions();

                expect(this.player2).toHavePrompt('Triggered Abilities');
                expect(this.player2).toBeAbleToSelect(this.wall);
                this.player2.clickCard(this.wall);
                expect(this.player2).toHavePrompt('Air Ring');
            });
        });
    });
});
