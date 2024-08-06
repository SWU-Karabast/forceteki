describe('Spell Scroll', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['isawa-atsuko', 'solemn-scholar', 'isawa-tadaka', 'seppun-ishikawa'],
                    hand: ['spell-scroll', 'spell-scroll', 'spell-scroll'],
                    conflictDiscard: ['embrace-the-void', 'cloak-of-night', 'display-of-power', 'way-of-the-scorpion', 'isawa-tadaka-2', 'all-and-nothing', 'censure']
                },
                player2: {
                }
            });

            this.ishikawa = this.player1.findCardByName('seppun-ishikawa');
            this.atsuko = this.player1.findCardByName('isawa-atsuko');
            this.scholar = this.player1.findCardByName('solemn-scholar');
            this.tadaka = this.player1.findCardByName('isawa-tadaka');
            this.scroll1 = this.player1.filterCardsByName('spell-scroll')[0];
            this.scroll2 = this.player1.filterCardsByName('spell-scroll')[1];
            this.scroll3 = this.player1.filterCardsByName('spell-scroll')[2];

            this.etv = this.player1.findCardByName('embrace-the-void');
            this.cloak = this.player1.findCardByName('cloak-of-night');
            this.dop = this.player1.findCardByName('display-of-power');
            this.tadaka2 = this.player1.findCardByName('isawa-tadaka-2');
            this.scorp = this.player1.findCardByName('way-of-the-scorpion');
            this.aan = this.player1.findCardByName('all-and-nothing');
            this.censure = this.player1.findCardByName('censure');
        });

        it('should let you pick a non-character card from your discard that matches a trait on attached character, move it to hand and discard spell scroll', function () {
            this.player1.playAttachment(this.scroll1, this.atsuko);
            this.player2.pass();
            this.player1.clickCard(this.scroll1);
            expect(this.player1).toBeAbleToSelect(this.etv);
            expect(this.player1).not.toBeAbleToSelect(this.cloak);
            expect(this.player1).not.toBeAbleToSelect(this.dop);
            expect(this.player1).not.toBeAbleToSelect(this.scorp);
            expect(this.player1).not.toBeAbleToSelect(this.tadaka2);
            expect(this.player1).toBeAbleToSelect(this.aan);
            expect(this.player1).not.toBeAbleToSelect(this.censure);

            this.player1.clickCard(this.etv);
            expect(this.etv.location).toBe('hand');
            expect(this.scroll1.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Spell Scroll to move Embrace the Void to their hand and sacrifice Spell Scroll');
        });

        it('should do nothing if there are no legal targets', function () {
            this.player1.playAttachment(this.scroll1, this.tadaka);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Action Window');
            this.player1.clickCard(this.scroll1);
            expect(this.player1).toHavePrompt('Action Window');
        });

        it('should be able to grab Censure', function () {
            this.player1.playAttachment(this.scroll1, this.ishikawa);
            this.player2.pass();
            this.player1.clickCard(this.scroll1);
            expect(this.player1).toBeAbleToSelect(this.censure);

            this.player1.clickCard(this.censure);
            expect(this.censure.location).toBe('hand');
            expect(this.scroll1.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('player1 uses Spell Scroll to move Censure to their hand and sacrifice Spell Scroll');
        });

        it('should give +3 pol when participating in a conflict that matches element', function () {
            this.player1.playAttachment(this.scroll1, this.tadaka);
            this.player2.pass();
            this.player1.playAttachment(this.scroll2, this.scholar);
            this.player2.pass();
            this.player1.playAttachment(this.scroll3, this.atsuko);
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.tadaka, this.atsuko],
                defenders: [],
                ring: 'earth'
            });

            expect(this.tadaka.getPoliticalSkill()).toBe(this.tadaka.printedPoliticalSkill + 3);
            expect(this.atsuko.getPoliticalSkill()).toBe(this.atsuko.printedPoliticalSkill);
            expect(this.scholar.getPoliticalSkill()).toBe(this.scholar.printedPoliticalSkill);
        });
    });
});
