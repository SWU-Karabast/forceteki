describe('Shore of the Ashen Flames', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['aggressive-moto', 'kakita-yoshi'],
                    hand: [
                        'a-perfect-cut',
                        'fine-katana',
                        'curved-blade',
                        'invocation-of-ash',
                        'fiery-madness'
                    ]
                },
                player2: {
                    inPlay: ['togashi-initiate'],
                    hand: ['fine-katana'],
                    provinces: ['shore-of-the-ashen-flames']
                }
            });

            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.aggressiveMoto = this.player1.findCardByName('aggressive-moto');
            this.perfectCut = this.player1.findCardByName('a-perfect-cut');
            this.fineKatana = this.player1.findCardByName('fine-katana');
            this.curvedBlade = this.player1.findCardByName('curved-blade');
            this.invocationOfAsh = this.player1.findCardByName('invocation-of-ash');
            this.fieryMadness = this.player1.findCardByName('fiery-madness');
            this.katana2 = this.player2.findCardByName('fine-katana');
            this.initiate = this.player2.findCardByName('togashi-initiate');

            this.shoreOfTheAshenFlames = this.player2.findCardByName(
                'shore-of-the-ashen-flames',
                'province 1'
            );
        });

        it('denies attachment bonuses on attackers during resolution but not during the conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [this.initiate],
                province: this.shoreOfTheAshenFlames,
                type: 'military'
            });

            expect(this.aggressiveMoto.getMilitarySkill()).toBe(3);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(0);

            this.player2.pass();
            this.player1.clickCard(this.fineKatana);
            this.player1.clickCard(this.aggressiveMoto);
            expect(this.aggressiveMoto.getMilitarySkill()).toBe(5);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(0);

            this.player2.pass();
            this.player1.clickCard(this.invocationOfAsh);
            this.player1.clickCard(this.aggressiveMoto);
            expect(this.aggressiveMoto.getMilitarySkill()).toBe(7);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(2);

            this.player2.pass();
            this.player1.clickCard(this.curvedBlade);
            this.player1.clickCard(this.aggressiveMoto);
            expect(this.aggressiveMoto.getMilitarySkill()).toBe(10);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(2);

            this.player2.playAttachment(this.katana2, this.initiate);

            this.noMoreActions();
            expect(this.getChatLogs(3)).toContain('player1 won a military conflict 3 vs 3');
        });

        it('allows attachment penalties', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [],
                province: this.shoreOfTheAshenFlames,
                type: 'military'
            });

            expect(this.aggressiveMoto.getMilitarySkill()).toBe(3);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(0);

            this.player2.pass();
            this.player1.clickCard(this.fieryMadness);
            this.player1.clickCard(this.aggressiveMoto);
            expect(this.aggressiveMoto.getMilitarySkill()).toBe(1);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(0);

            this.noMoreActions();
            expect(this.getChatLogs(3)).toContain('player1 won a military conflict 1 vs 0');
        });

        it('allows event bonuses', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.aggressiveMoto],
                defenders: [],
                province: this.shoreOfTheAshenFlames,
                type: 'military'
            });

            expect(this.aggressiveMoto.getMilitarySkill()).toBe(3);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(0);

            this.player2.pass();
            this.player1.clickCard(this.perfectCut);
            this.player1.clickCard(this.aggressiveMoto);
            expect(this.aggressiveMoto.getMilitarySkill()).toBe(5);
            expect(this.aggressiveMoto.getPoliticalSkill()).toBe(0);

            this.noMoreActions();
            expect(this.getChatLogs(5)).toContain('player1 won a military conflict 5 vs 0');
        });

        it('testing pol', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.yoshi],
                defenders: [],
                province: this.shoreOfTheAshenFlames,
                type: 'political'
            });

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);

            this.player2.pass();
            this.player1.playAttachment(this.fineKatana, this.yoshi);
            expect(this.yoshi.getMilitarySkill()).toBe(4);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);

            this.player2.pass();
            this.player1.playAttachment(this.invocationOfAsh, this.yoshi);
            expect(this.yoshi.getMilitarySkill()).toBe(6);
            expect(this.yoshi.getPoliticalSkill()).toBe(8);

            this.player2.pass();
            this.player1.playAttachment(this.fieryMadness, this.yoshi);
            expect(this.yoshi.getMilitarySkill()).toBe(4);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);

            this.noMoreActions();
            expect(this.getChatLogs(5)).toContain('player1 won a political conflict 4 vs 0');
        });
    });
});
