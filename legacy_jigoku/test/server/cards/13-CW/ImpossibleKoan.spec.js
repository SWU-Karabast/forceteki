describe('Impossible Koan', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['border-rider', 'moto-horde'],
                    hand: ['impossible-koan', 'shinomen-wayfinders', 'banzai']
                },
                player2: {
                    inPlay: ['hida-amoro', 'crisis-breaker'],
                    hand: ['hiruma-ambusher', 'fine-katana', 'impossible-koan']
                }
            });

            this.borderRider = this.player1.findCardByName('border-rider');
            this.motoHorde = this.player1.findCardByName('moto-horde');
            this.koan1 = this.player1.findCardByName('impossible-koan');
            this.banzai = this.player1.findCardByName('banzai');

            this.hidaAmoro = this.player2.findCardByName('hida-amoro');
            this.crisisBreaker = this.player2.findCardByName('crisis-breaker');
            this.crisisBreaker.bowed = true;
            this.katana = this.player2.findCardByName('fine-katana');
            this.koan2 = this.player2.findCardByName('impossible-koan');

            this.shamefulDisplay1 = this.player2.findCardByName('shameful-display', 'province 1');
            this.shamefulDisplay2 = this.player2.findCardByName('shameful-display', 'province 2');

            this.noMoreActions();

            this.initiateConflict({
                type: 'military',
                attackers: [this.borderRider, this.motoHorde],
                defenders: [this.hidaAmoro],
                province: this.shamefulDisplay1
            });
            this.player2.pass();
            this.player1.clickCard(this.koan1);
        });

        it('should set all characters base military and political skill to 1 regardless of participation', function() {
            expect(this.borderRider.getBaseMilitarySkill()).toBe(1);
            expect(this.borderRider.getBasePoliticalSkill()).toBe(1);

            // cannot modify dash skills
            expect(this.motoHorde.hasDash('political')).toBe(true);
            expect(this.motoHorde.getBasePoliticalSkill()).toBe(0);
            expect(this.motoHorde.getBaseMilitarySkill()).toBe(1);

            expect(this.hidaAmoro.hasDash('political')).toBe(true);
            expect(this.hidaAmoro.getBasePoliticalSkill()).toBe(0);
            expect(this.hidaAmoro.getBaseMilitarySkill()).toBe(1);


            //Should affect characters at home
            expect(this.crisisBreaker.getBaseMilitarySkill()).toBe(1);
            expect(this.crisisBreaker.getBasePoliticalSkill()).toBe(1);
        });

        it('should not effect characters played after the effect is triggered', function() {
            this.hirumaAmbusher = this.player2.playCharacterFromHand('hiruma-ambusher');
            this.player2.clickPrompt('Conflict');
            expect(this.player2).toHavePrompt('Triggered Abilities');
            this.player2.clickPrompt('Pass');
            expect(this.hirumaAmbusher.getBaseMilitarySkill()).toBe(this.hirumaAmbusher.printedMilitarySkill);
            expect(this.hirumaAmbusher.getBasePoliticalSkill()).toBe(this.hirumaAmbusher.printedPoliticalSkill);

            this.wayfinders = this.player1.playCharacterFromHand('shinomen-wayfinders');
            this.player1.clickPrompt('Conflict');
            expect(this.wayfinders.getBaseMilitarySkill()).toBe(this.wayfinders.printedMilitarySkill);
            expect(this.wayfinders.getBasePoliticalSkill()).toBe(this.wayfinders.printedPoliticalSkill);
        });

        it('should still allow buffing (since its just the base skill being set)', function() {
            this.player2.playAttachment(this.katana, this.hidaAmoro);
            expect(this.hidaAmoro.getMilitarySkill()).toBe(3); //base 1 + 2 katana

            this.player1.clickCard(this.banzai);
            this.player1.clickCard(this.borderRider);
            this.player1.clickPrompt('Lose 1 honor to resolve this ability again');
            this.player1.clickCard(this.borderRider);
            this.player1.clickPrompt('Done');

            expect(this.borderRider.getMilitarySkill()).toBe(5); //base 1 + 4 banzai
        });

        it('should end when the conflict ends and not be playable out of conflict', function() {
            this.noMoreActions();
            this.player1.clickPrompt('Don\'t Resolve');

            expect(this.borderRider.getBaseMilitarySkill()).toBe(this.borderRider.printedMilitarySkill);
            expect(this.borderRider.getBasePoliticalSkill()).toBe(this.borderRider.printedPoliticalSkill);

            this.player1.pass();
            expect(this.player2).toHavePrompt('Action Window');
            this.player2.clickCard(this.koan2);
            expect(this.player2).toHavePrompt('Action Window');
        });

    });
});
