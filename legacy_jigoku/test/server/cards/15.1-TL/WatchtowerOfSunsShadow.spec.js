describe('Watchtower of Suns Shadow', function() {
    integration(function() {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-kuwanan', 'doji-challenger', 'kakita-yoshi'],
                    hand: ['way-of-the-crane', 'called-to-war'],
                    dynastyDiscard: ['northern-curtain-wall']
                },
                player2: {
                    inPlay: ['hida-kisada'],
                    dynastyDiscard: ['watchtower-of-sun-s-shadow', 'northern-curtain-wall', 'imperial-storehouse']
                }
            });

            this.crane = this.player1.findCardByName('way-of-the-crane');
            this.yoshi = this.player1.findCardByName('kakita-yoshi');
            this.kuwanan = this.player1.findCardByName('doji-kuwanan');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.kisada = this.player2.findCardByName('hida-kisada');
            this.watchtower = this.player2.placeCardInProvince('watchtower-of-sun-s-shadow', 'province 1');
            this.wall = this.player2.placeCardInProvince('northern-curtain-wall', 'province 2');
            this.storehouse = this.player2.placeCardInProvince('imperial-storehouse', 'province 3');

            this.player1Wall = this.player1.placeCardInProvince('northern-curtain-wall', 'province 1');
            this.calledToWar = this.player1.findCardByName('called-to-war');

            this.p1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.p2 = this.player2.findCardByName('shameful-display', 'province 2');
            this.p3 = this.player2.findCardByName('shameful-display', 'province 3');
            this.p4 = this.player2.findCardByName('shameful-display', 'province 4');

            this.player1p1 = this.player1.findCardByName('shameful-display', 'province 1');
        });

        it('should give opponent\'s participating characters -1/-1 for each fate they have during a conflict at itself', function () {
            this.kuwanan.fate = 2;
            this.challenger.fate = 1;
            this.kisada.fate = 3;
            this.yoshi.fate = 4;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.challenger],
                defenders: [this.kisada],
                province: this.p1
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5 - 2);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4 - 2);

            expect(this.challenger.getMilitarySkill()).toBe(3 - 1);
            expect(this.challenger.getPoliticalSkill()).toBe(3 - 1);

            expect(this.kisada.getMilitarySkill()).toBe(7);
            expect(this.kisada.getPoliticalSkill()).toBe(2);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should work during a conflict at another kaiu wall', function () {
            this.kuwanan.fate = 2;
            this.challenger.fate = 1;
            this.kisada.fate = 3;
            this.yoshi.fate = 4;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.challenger],
                defenders: [this.kisada],
                province: this.p2
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5 - 2);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4 - 2);

            expect(this.challenger.getMilitarySkill()).toBe(3 - 1);
            expect(this.challenger.getPoliticalSkill()).toBe(3 - 1);

            expect(this.kisada.getMilitarySkill()).toBe(7);
            expect(this.kisada.getPoliticalSkill()).toBe(2);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should not work during a conflict not at a kaiu wall', function () {
            this.kuwanan.fate = 2;
            this.challenger.fate = 1;
            this.kisada.fate = 3;
            this.yoshi.fate = 4;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.challenger],
                defenders: [this.kisada],
                province: this.p3
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4);

            expect(this.challenger.getMilitarySkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.kisada.getMilitarySkill()).toBe(7);
            expect(this.kisada.getPoliticalSkill()).toBe(2);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should not work during a conflict not at a holding', function () {
            this.kuwanan.fate = 2;
            this.challenger.fate = 1;
            this.kisada.fate = 3;
            this.yoshi.fate = 4;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.challenger],
                defenders: [this.kisada],
                province: this.p4
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4);

            expect(this.challenger.getMilitarySkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.kisada.getMilitarySkill()).toBe(7);
            expect(this.kisada.getPoliticalSkill()).toBe(2);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should not work on attack', function () {
            this.kuwanan.fate = 2;
            this.challenger.fate = 1;
            this.kisada.fate = 3;
            this.yoshi.fate = 4;

            this.noMoreActions();
            this.player1.passConflict();

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kisada],
                defenders: [this.kuwanan, this.challenger],
                province: this.player1p1
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4);

            expect(this.challenger.getMilitarySkill()).toBe(3);
            expect(this.challenger.getPoliticalSkill()).toBe(3);

            expect(this.kisada.getMilitarySkill()).toBe(7);
            expect(this.kisada.getPoliticalSkill()).toBe(2);

            expect(this.yoshi.getMilitarySkill()).toBe(2);
            expect(this.yoshi.getPoliticalSkill()).toBe(6);
        });

        it('should update if you put fate on a character', function () {
            this.kuwanan.fate = 2;
            this.challenger.fate = 1;
            this.kisada.fate = 3;
            this.yoshi.fate = 4;

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.challenger],
                defenders: [this.kisada],
                province: this.p1
            });

            expect(this.kuwanan.getMilitarySkill()).toBe(5 - 2);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4 - 2);

            this.player2.pass();
            this.player1.clickCard(this.crane);
            this.player1.clickCard(this.yoshi);
            this.player2.pass();
            this.player1.clickCard(this.calledToWar);
            this.player1.clickCard(this.kuwanan);
            this.player2.clickPrompt('No');

            expect(this.kuwanan.fate).toBe(3);

            expect(this.kuwanan.getMilitarySkill()).toBe(5 - 3);
            expect(this.kuwanan.getPoliticalSkill()).toBe(4 - 3);
        });

        it('forced interrupt', function () {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.kuwanan, this.challenger],
                defenders: [this.kisada],
                province: this.p1
            });

            let fate = this.player2.fate;

            this.kisada.bowed = true;
            this.noMoreActions();

            expect(this.player2.fate).toBe(fate - 2);
            expect(this.getChatLogs(5)).toContain('player2 uses Watchtower of Sun\'s Shadow to make player2 lose 2 fate');
        });
    });
});
