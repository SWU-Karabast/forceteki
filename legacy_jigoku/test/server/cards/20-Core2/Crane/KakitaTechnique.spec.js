describe('Kakita Technique', function () {
    integration(function () {
        describe('Duel Focus', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-kuwanan', 'doji-whisperer'],
                        hand: ['a-fate-worse-than-death', 'kakita-technique'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate'],
                    }
                });

                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.technique = this.player1.findCardByName('kakita-technique');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should set bid to 0', function () {
                let honor1 = this.player1.honor;
                let honor2 = this.player2.honor;

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuwanan, this.whisperer],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.kuwanan);

                this.player1.clickPrompt('5');
                this.player2.clickPrompt('5');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.technique);

                this.player1.clickCard(this.technique);

                expect(this.getChatLogs(10)).toContain('player1 plays Kakita Technique to decrease their bid by 5');
                expect(this.getChatLogs(10)).toContain('player2 gives player1 5 honor');

                expect(this.player1.honor).toBe(honor1 + 5);
                expect(this.player2.honor).toBe(honor2 - 5);

                expect(this.player1.player.showBid).toBe(5);
                expect(this.player2.player.showBid).toBe(5);
            });
        });

        describe('Non duel effect', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 20,
                        inPlay: ['doji-kuwanan', 'doji-whisperer', 'solemn-scholar', 'cunning-negotiator'],
                        hand: ['kakita-technique', 'against-the-waves', 'against-the-waves', 'against-the-waves', 'against-the-waves', 'against-the-waves', 'against-the-waves'],
                        dynastyDiscard: ['awakened-tsukumogami']
                    },
                    player2: {
                        inPlay: ['kakita-toshimoko'],
                        hand: ['embrace-the-void', 'policy-debate', 'kakita-technique']
                    }
                });

                this.atws = this.player1.filterCardsByName('against-the-waves');
                this.whisperer = this.player1.findCardByName('doji-whisperer');
                this.scholar = this.player1.findCardByName('solemn-scholar');
                this.cunning = this.player1.findCardByName('cunning-negotiator');
                this.kuwanan = this.player1.findCardByName('doji-kuwanan');
                this.technique = this.player1.findCardByName('kakita-technique');
                this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
                this.technique2 = this.player2.findCardByName('kakita-technique');
                this.pd = this.player2.findCardByName('policy-debate');
            });

            it('should target a bushi or duelist you control', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuwanan, this.whisperer, this.scholar, this.cunning],
                    defenders: [this.toshimoko]
                });
                this.player2.pass();

                this.player1.clickCard(this.technique);
                expect(this.player1).toBeAbleToSelect(this.kuwanan);
                expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                expect(this.player1).not.toBeAbleToSelect(this.scholar);
                expect(this.player1).toBeAbleToSelect(this.cunning);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
            });

            it('lasting delayed effect', function () {
                this.player1.fate = 20;

                let baseMil = this.kuwanan.getMilitarySkill();
                let basePol = this.kuwanan.getPoliticalSkill();

                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuwanan, this.whisperer, this.scholar, this.cunning],
                    defenders: []
                });
                this.player2.pass();

                this.player1.clickCard(this.technique);
                this.player1.clickCard(this.kuwanan);

                expect(this.getChatLogs(10)).toContain('player1 plays Kakita Technique to give Doji Kuwanan +1military and +1political after each event they play');
                expect(this.getChatLogs(10)).toContain('Doji Kuwanan gets +1military and +1political due to the delayed effect of Kakita Technique');

                expect(this.kuwanan.getMilitarySkill()).toBe(baseMil + 1);
                expect(this.kuwanan.getPoliticalSkill()).toBe(basePol + 1);

                this.atws.forEach((atw, i) => {
                    this.player2.pass();
                    this.player1.clickCard(atw);
                    this.player1.clickCard(this.scholar);
                    expect(this.kuwanan.getMilitarySkill()).toBe(baseMil + 2 + i);
                    expect(this.kuwanan.getPoliticalSkill()).toBe(basePol + 2 + i);                        
                })
            });

            it('lasting delayed effect - should be +2 on defense', function () {
                this.player1.fate = 20;

                let baseMil = this.kuwanan.getMilitarySkill();
                let basePol = this.kuwanan.getPoliticalSkill();

                this.noMoreActions();
                this.player1.passConflict();
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.toshimoko],
                    defenders: [this.kuwanan]
                });
                this.player1.moveCard(this.toshimoko, 'dynasty discard pile')

                this.player1.clickCard(this.technique);
                this.player1.clickCard(this.kuwanan);

                expect(this.getChatLogs(10)).toContain('player1 plays Kakita Technique to give Doji Kuwanan +2military and +2political after each event they play');
                expect(this.getChatLogs(10)).toContain('Doji Kuwanan gets +2military and +2political due to the delayed effect of Kakita Technique');

                expect(this.kuwanan.getMilitarySkill()).toBe(baseMil + 2);
                expect(this.kuwanan.getPoliticalSkill()).toBe(basePol + 2);

                this.atws.forEach((atw, i) => {
                    this.player2.pass();
                    this.player1.clickCard(atw);
                    this.player1.clickCard(this.scholar);
                    expect(this.kuwanan.getMilitarySkill()).toBe(baseMil + 4 + (2 * i));
                    expect(this.kuwanan.getPoliticalSkill()).toBe(basePol + 4 + (2 * i));                        
                })
            });

            it('extra actions', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.kuwanan, this.whisperer, this.scholar, this.cunning],
                    defenders: [this.toshimoko]
                });
                this.player2.clickCard(this.technique2);
                this.player2.clickCard(this.toshimoko);

                expect(this.player2).toHavePrompt('Conflict Action Window');
                expect(this.getChatLogs(10)).toContain('player2 plays Kakita Technique to give Kakita Toshimoko +2military and +2political after each event they play and take 4 additional actions');
                expect(this.player2).toHavePrompt('Conflict Action Window'); // extra action 1
                this.player2.pass();
                expect(this.player2).toHavePrompt('Conflict Action Window'); // extra action 2
                this.player2.pass();
                expect(this.player2).toHavePrompt('Conflict Action Window'); // extra action 3
                this.player2.pass();
                expect(this.player2).toHavePrompt('Conflict Action Window'); // extra action 4
                this.player2.pass();
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });
        });
    });
});
