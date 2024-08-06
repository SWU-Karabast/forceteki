describe('Path of Reflection', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['bayushi-liar', 'attendant-to-the-emperor', 'young-rumormonger'],
                    provinces: ['fertile-fields', 'by-onnotangu-s-light']
                },
                player2: {
                    inPlay: ['ashigaru-levy', 'moto-youth', 'iuchi-shahai'],
                    provinces: ['path-of-reflection', 'toshi-ranbo', 'entrenched-position']
                }
            });

            this.bayushiLiar = this.player1.findCardByName('bayushi-liar');
            this.attendantToTheEmperor = this.player1.findCardByName('attendant-to-the-emperor');
            this.fields = this.player1.findCardByName('fertile-fields');
            this.onnotangusLight = this.player1.findCardByName('by-onnotangu-s-light');

            this.ashigaruLevy = this.player2.findCardByName('ashigaru-levy');
            this.motoYouth = this.player2.findCardByName('moto-youth');
            this.pathOfReflection = this.player2.findCardByName('path-of-reflection');
            this.toshiRanbo = this.player2.findCardByName('toshi-ranbo');
            this.entrentched = this.player2.findCardByName('entrenched-position');

            this.pathOfReflection.facedown = false;
            this.noMoreActions();
        });

        it('triggers when it is the attacked province', function () {
            this.initiateConflict({
                province: this.pathOfReflection,
                ring: 'void',
                type: 'political',
                attackers: [this.bayushiLiar, this.attendantToTheEmperor],
                defenders: [this.motoYouth]
            });

            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).toHavePrompt('Path of Reflection');
        });

        it('triggers when defending a water province', function () {
            this.initiateConflict({
                province: this.toshiRanbo,
                ring: 'void',
                type: 'political',
                attackers: [this.bayushiLiar, this.attendantToTheEmperor],
                defenders: [this.motoYouth]
            });

            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).toHavePrompt('Path of Reflection');
        });

        it('triggers when attacking a water province', function () {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                province: this.onnotangusLight,
                ring: 'void',
                type: 'military',
                attackers: [this.ashigaruLevy, this.motoYouth],
                defenders: [this.attendantToTheEmperor]
            });

            this.player1.pass();
            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).toHavePrompt('Path of Reflection');
        });

        it('does not trigger when defending a non-water province', function () {
            this.initiateConflict({
                province: this.entrentched,
                ring: 'void',
                type: 'political',
                attackers: [this.bayushiLiar, this.attendantToTheEmperor],
                defenders: [this.motoYouth]
            });

            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).not.toHavePrompt('Path of Reflection');
        });

        it('does not trigger when attacking a non-water province', function () {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                province: this.fields,
                ring: 'void',
                type: 'military',
                attackers: [this.ashigaruLevy, this.motoYouth],
                defenders: [this.attendantToTheEmperor]
            });

            this.player1.pass();
            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).not.toHavePrompt('Path of Reflection');
        });

        it('triggers when defending a non-water province during a water conflict', function () {
            this.initiateConflict({
                province: this.entrentched,
                ring: 'water',
                type: 'political',
                attackers: [this.bayushiLiar, this.attendantToTheEmperor],
                defenders: [this.motoYouth]
            });

            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).toHavePrompt('Path of Reflection');
        });

        it('triggers when attacking a non-water province during a water conflict', function () {
            this.player1.passConflict();
            this.noMoreActions();
            this.initiateConflict({
                province: this.fields,
                ring: 'water',
                type: 'military',
                attackers: [this.ashigaruLevy, this.motoYouth],
                defenders: [this.attendantToTheEmperor]
            });

            this.player1.pass();
            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).toHavePrompt('Path of Reflection');
        });

        it('flips the base skill of a character', function () {
            this.initiateConflict({
                province: this.pathOfReflection,
                ring: 'void',
                type: 'political',
                attackers: [this.bayushiLiar, this.attendantToTheEmperor],
                defenders: [this.motoYouth]
            });

            this.player2.clickCard(this.pathOfReflection);
            expect(this.player2).toHavePrompt('Path of Reflection');
            expect(this.player2).not.toBeAbleToSelect(this.bayushiLiar);
            expect(this.player2).toBeAbleToSelect(this.attendantToTheEmperor);
            expect(this.player2).toBeAbleToSelect(this.motoYouth);

            this.player2.clickCard(this.attendantToTheEmperor);
            expect(this.attendantToTheEmperor.militarySkill).toBe(5);
            expect(this.attendantToTheEmperor.politicalSkill).toBe(1);
        });
    });
});
