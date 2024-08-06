describe('Shinjo Atagi', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    honor: 10,
                    inPlay: ['moto-chagatai', 'border-rider', 'doji-whisperer']
                },
                player2: {
                    honor: 10,
                    hand: ['desperate-defense'],
                    inPlay: ['shinjo-atagi', 'kakita-yoshi'],
                    provinces: ['manicured-garden', 'pilgrimage']
                }
            });

            this.whisperer = this.player1.findCardByName('doji-whisperer');
            this.chagatai = this.player1.findCardByName('moto-chagatai');
            this.rider = this.player1.findCardByName('border-rider');

            this.desperateDefense = this.player2.findCardByName('desperate-defense');
            this.yoshi = this.player2.findCardByName('kakita-yoshi');
            this.shinjoAtagi = this.player2.findCardByName('shinjo-atagi');
            this.garden = this.player2.findCardByName('manicured-garden');
            this.pilgrimage = this.player2.findCardByName('pilgrimage');
            this.sd3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.sd4 = this.player2.findCardByName('shameful-display', 'province 4');
            this.sd5 = this.player2.findCardByName('shameful-display', 'stronghold province');
        });

        it('should set a participating characters skill to the province strength matching conflict type (mil)', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai, this.rider],
                defenders: [this.shinjoAtagi, this.yoshi],
                province: this.garden,
                type: 'military'
            });

            this.player2.clickCard(this.shinjoAtagi);
            expect(this.player2).toBeAbleToSelect(this.shinjoAtagi);
            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.rider);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.rider);
            expect(this.rider.getMilitarySkill()).toBe(4);
            expect(this.rider.getPoliticalSkill()).toBe(1);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Shinjo Atagi to set the military skill of Border Rider to the strength of an attacked province'
            );
            expect(this.getChatLogs(5)).toContain('Shinjo Atagi sets the military skill of Border Rider to 4military');
        });

        it('should set a participating characters skill to the province strength matching conflict type (pol)', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai, this.rider],
                defenders: [this.shinjoAtagi, this.yoshi],
                province: this.garden,
                type: 'political'
            });

            this.player2.clickCard(this.shinjoAtagi);
            expect(this.player2).toBeAbleToSelect(this.shinjoAtagi);
            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.rider);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.rider);
            expect(this.rider.getMilitarySkill()).toBe(2);
            expect(this.rider.getPoliticalSkill()).toBe(4);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Shinjo Atagi to set the political skill of Border Rider to the strength of an attacked province'
            );
            expect(this.getChatLogs(5)).toContain(
                'Shinjo Atagi sets the political skill of Border Rider to 4political'
            );
        });

        it('should set a participating characters skill to the current province strength matching conflict type (pol)', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.chagatai, this.rider],
                defenders: [this.shinjoAtagi, this.yoshi],
                province: this.garden,
                type: 'political'
            });

            this.player2.clickCard(this.desperateDefense);
            this.player1.pass();

            this.player2.clickCard(this.shinjoAtagi);
            expect(this.player2).toBeAbleToSelect(this.shinjoAtagi);
            expect(this.player2).toBeAbleToSelect(this.chagatai);
            expect(this.player2).toBeAbleToSelect(this.rider);
            expect(this.player2).toBeAbleToSelect(this.yoshi);
            expect(this.player2).not.toBeAbleToSelect(this.whisperer);
            this.player2.clickCard(this.rider);
            expect(this.rider.getMilitarySkill()).toBe(2);
            expect(this.rider.getPoliticalSkill()).toBe(7);
            expect(this.getChatLogs(5)).toContain(
                'player2 uses Shinjo Atagi to set the political skill of Border Rider to the strength of an attacked province'
            );
            expect(this.getChatLogs(5)).toContain(
                'Shinjo Atagi sets the political skill of Border Rider to 7political'
            );
        });
    });
});