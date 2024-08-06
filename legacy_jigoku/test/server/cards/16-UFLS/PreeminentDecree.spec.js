describe('Preeminent Decree', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 6,
                    inPlay: ['kakita-yoshi', 'doji-whisperer', 'steward-of-law', 'doji-challenger'],
                    hand: ['dutiful-assistant', 'preeminent-decree']
                },
                player2: {
                    inPlay: ['doji-hotaru', 'akodo-toturi', 'ikoma-ujiaki']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.steward = this.player1.findCardByName('steward-of-law');
            this.assistant = this.player1.findCardByName('dutiful-assistant');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.decree = this.player1.findCardByName('preeminent-decree');

            this.hotaru = this.player2.findCardByName('doji-hotaru');
            this.toturi = this.player2.findCardByName('akodo-toturi');
            this.ujiaki = this.player2.findCardByName('ikoma-ujiaki');

            this.player1.playAttachment(this.assistant, this.yoshi);
        });

        it('should let you select a participating courtier with at least 1 glory', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.yoshi, this.whisperer, this.steward, this.challenger],
                defenders: [this.hotaru, this.toturi, this.ujiaki]
            });

            this.player2.pass();
            this.player1.clickCard(this.decree);
            expect(this.player1).toHavePrompt('Choose a character');
            expect(this.player1).toBeAbleToSelect(this.yoshi);
            expect(this.player1).toBeAbleToSelect(this.whisperer);
            expect(this.player1).not.toBeAbleToSelect(this.steward);
            expect(this.player1).not.toBeAbleToSelect(this.challenger);
            expect(this.player1).not.toBeAbleToSelect(this.hotaru);
            expect(this.player1).not.toBeAbleToSelect(this.toturi);
            expect(this.player1).not.toBeAbleToSelect(this.ujiaki);
        });

        it('should give all participating characters a political penalty equal to the selected courtiers glory', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.yoshi, this.whisperer, this.steward],
                defenders: [this.hotaru, this.ujiaki]
            });

            this.player2.pass();
            this.player1.clickCard(this.decree);
            this.player1.clickCard(this.yoshi);

            expect(this.yoshi.getPoliticalSkill()).toBe(6);
            expect(this.whisperer.getPoliticalSkill()).toBe(0);
            expect(this.steward.getPoliticalSkill()).toBe(0);
            expect(this.hotaru.getPoliticalSkill()).toBe(3);
            expect(this.ujiaki.getPoliticalSkill()).toBe(2);
            expect(this.toturi.getPoliticalSkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.getChatLogs(5)).toContain('player1 plays Preeminent Decree to give all participating characters except Kakita Yoshi -3political');
        });

        it('should account for glory modifiers', function() {
            this.yoshi.honor();
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.yoshi, this.whisperer, this.steward],
                defenders: [this.hotaru, this.ujiaki]
            });

            this.player2.pass();
            this.player1.clickCard(this.decree);
            this.player1.clickCard(this.yoshi);

            expect(this.yoshi.getPoliticalSkill()).toBe(11);
            expect(this.whisperer.getPoliticalSkill()).toBe(0);
            expect(this.steward.getPoliticalSkill()).toBe(0);
            expect(this.hotaru.getPoliticalSkill()).toBe(1);
            expect(this.ujiaki.getPoliticalSkill()).toBe(0);
            expect(this.toturi.getPoliticalSkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.getChatLogs(5)).toContain('player1 plays Preeminent Decree to give all participating characters except Kakita Yoshi -5political');
        });
    });
});
