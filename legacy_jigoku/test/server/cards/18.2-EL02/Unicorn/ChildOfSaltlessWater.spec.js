describe('Child of Saltless Water', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['moto-chagatai', 'border-rider', 'doji-whisperer'],
                    hand: ['way-of-the-open-hand']
                },
                player2: {
                    honor: 10,
                    inPlay: ['shinjo-atagi', 'kakita-yoshi'],
                    hand: ['child-of-saltless-water'],
                    provinces: ['manicured-garden', 'pilgrimage']
                }
            });

            this.child = this.player2.findCardByName('child-of-saltless-water');

            this.openHand = this.player1.findCardByName('way-of-the-open-hand');
            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.shinjo = this.player2.findCardByName('shinjo-atagi');
            this.chagatai = this.player1.findCardByName('moto-chagatai');
            this.rider = this.player1.findCardByName('border-rider');
            this.garden = this.player2.findCardByName('manicured-garden');
            this.pilgrimage = this.player2.findCardByName('pilgrimage');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        it('should put itself into the conflict and set a mil skill to the province strength', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai, this.rider],
                defenders: [this.shinjo, this.yoshi],
                province: this.garden
            });

            this.player2.clickCard(this.child);
            this.player2.clickPrompt('0');
            this.player2.clickPrompt('Conflict');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.child);

            this.player2.clickCard(this.child);

            expect(this.player2).toHavePrompt('Choose a province');
            expect(this.player2).toBeAbleToSelect(this.garden);
            expect(this.player2).not.toBeAbleToSelect(this.pilgrimage);
            this.player2.clickCard(this.garden);
            expect(this.child.location).toBe('play area');
            expect(this.child.isParticipating()).toBe(true);
            expect(this.child.getMilitarySkill()).toBe(4);

            expect(this.getChatLogs(5)).toContain("player2 uses Child of Saltless Water to set it's military to 4");
        });

        it('should die when not in a conflict', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai, this.rider],
                defenders: [this.shinjo, this.yoshi],
                province: this.garden
            });

            this.player2.clickCard(this.child);
            this.player2.clickPrompt('0');
            this.player2.clickPrompt('Conflict');
            this.player2.clickCard(this.child);
            this.player2.clickCard(this.garden);

            this.player1.clickCard(this.openHand);
            this.player1.clickCard(this.child);

            expect(this.child.location).toBe('conflict discard pile');
            expect(this.getChatLogs(5)).toContain('Child of Saltless Water is discarded from play as it is at home');
        });

        it('should die when conflict ends', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.rider],
                defenders: [this.shinjo, this.yoshi],
                province: this.garden
            });

            this.player2.clickCard(this.child);
            this.player2.clickPrompt('0');
            this.player2.clickPrompt('Conflict');
            this.player2.clickCard(this.child);
            this.player2.clickCard(this.garden);
            this.noMoreActions();

            expect(this.getChatLogs(5)).toContain('Child of Saltless Water is discarded from play as it is at home');
        });
    });
});
