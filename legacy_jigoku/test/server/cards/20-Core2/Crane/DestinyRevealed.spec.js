describe('Destiny Revealed', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    fate: 20,
                    inPlay: ['doji-challenger', 'kakita-yoshi', 'daidoji-uji'],
                    hand: ['destiny-revealed']
                },
                player2: {
                    inPlay: ['kakita-toshimoko', 'shiba-tsukune', 'doji-diplomat'],
                    hand: ['embrace-the-void', 'policy-debate']
                }
            });

            this.uji = this.player1.findCardByName('daidoji-uji');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.destiny = this.player1.findCardByName('destiny-revealed');
            this.toshimoko = this.player2.findCardByName('kakita-toshimoko');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.tsukune = this.player2.findCardByName('shiba-tsukune');
            this.diplomat = this.player2.findCardByName('doji-diplomat');
            this.pd = this.player2.findCardByName('policy-debate');
        });

        describe('Duel Strike', function () {
            it('should react if you win', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.clickPrompt('2');
                this.player2.clickPrompt('1');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.destiny);
            });

            it('should react if you win', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.clickPrompt('2');
                this.player2.clickPrompt('1');

                let fate = this.challenger.fate;
                this.player1.clickCard(this.destiny);
                expect(this.challenger.fate).toBe(fate + 1);
                expect(this.player1).toHavePrompt('Policy Debate');

                expect(this.getChatLogs(5)).toContain(
                    'player1 plays Destiny Revealed to place a fate on their duelist'
                );
                expect(this.getChatLogs(5)).toContain('player1 places a fate on Doji Challenger');
            });

            it('if you win by 4 or more against a unique should put fate on two things', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.yoshi],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.yoshi);

                this.player1.clickPrompt('5');
                this.player2.clickPrompt('1');

                let fate = this.yoshi.fate;
                this.player1.clickCard(this.destiny);
                expect(this.yoshi.fate).toBe(fate + 1);

                expect(this.getChatLogs(10)).toContain(
                    'player1 plays Destiny Revealed to place a fate on their duelist'
                );
                expect(this.getChatLogs(10)).toContain('player1 places a fate on Kakita Yoshi');

                expect(this.player1).toHavePrompt('Choose another character');
                expect(this.player1).toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.yoshi);
                expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                expect(this.player1).toBeAbleToSelect(this.uji);

                let fate2 = this.uji.fate;
                this.player1.clickCard(this.uji);
                expect(this.uji.fate).toBe(fate2 + 1);

                expect(this.player1).toHavePrompt('Policy Debate');
                expect(this.getChatLogs(10)).toContain('player1 places a fate on Daidoji Uji');
            });

            it('should not react on a tie', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('1');

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
            });

            it('should not react if you lose', function () {
                this.noMoreActions();
                this.initiateConflict({
                    attackers: [this.challenger],
                    defenders: [this.toshimoko]
                });

                this.player2.clickCard(this.pd);
                this.player2.clickCard(this.toshimoko);
                this.player2.clickCard(this.challenger);

                this.player1.clickPrompt('1');
                this.player2.clickPrompt('2');

                expect(this.player2).toHavePrompt('Policy Debate');
            });
        });
    });
});

describe('Destiny Revealed Ring Stuff', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['togashi-initiate']
                },
                player2: {
                    inPlay: ['daidoji-uji'],
                    hand: ['destiny-revealed']
                }
            });
            this.togashiInitiate = this.player1.findCardByName('togashi-initiate');
            this.daidojiUji = this.player2.findCardByName('daidoji-uji');
            this.destiny = this.player2.findCardByName('destiny-revealed');
        });

        it('void ring', function () {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'void'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Void Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.destiny);
            this.player2.clickCard(this.destiny);
            expect(this.daidojiUji.fate).toBe(1);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Destiny Revealed to cancel the effects of the Void Ring'
            );
        });

        it('fire ring - honor', function () {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'fire'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.daidojiUji);
            this.player1.clickPrompt('Honor Daidoji Uji');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.destiny);
            this.player2.clickCard(this.destiny);
            expect(this.daidojiUji.isHonored).toBe(false);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Destiny Revealed to cancel the effects of the Fire Ring'
            );
        });

        it('fire ring - dishonor', function () {
            this.daidojiUji.fate = 1;
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'fire'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Fire Ring');
            this.player1.clickCard(this.daidojiUji);
            this.player1.clickPrompt('Dishonor Daidoji Uji');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.destiny);
            this.player2.clickCard(this.destiny);
            expect(this.daidojiUji.isDishonored).toBe(false);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Destiny Revealed to cancel the effects of the Fire Ring'
            );
        });

        it('water ring - bow', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'water'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.destiny);
            this.player2.clickCard(this.destiny);
            expect(this.daidojiUji.bowed).toBe(false);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Destiny Revealed to cancel the effects of the Water Ring'
            );
        });

        it('water ring - ready', function () {
            this.daidojiUji.bow();
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.togashiInitiate],
                defenders: [],
                ring: 'water'
            });
            this.noMoreActions();
            expect(this.player1).toHavePrompt('Water Ring');
            this.player1.clickCard(this.daidojiUji);
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.destiny);
            this.player2.clickCard(this.destiny);
            expect(this.daidojiUji.bowed).toBe(true);
            expect(this.getChatLogs(5)).toContain(
                'player2 plays Destiny Revealed to cancel the effects of the Water Ring'
            );
        });
    });
});
