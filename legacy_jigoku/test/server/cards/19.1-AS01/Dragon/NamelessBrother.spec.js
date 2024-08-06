describe('Nameless Brother', function () {
    integration(function () {
        describe('One Nameless Brother', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: [
                            'nameless-brother',
                            'togashi-yoshi',
                            'togashi-initiate',
                            'togashi-initiate',
                            'inventive-mirumoto',
                            'inventive-mirumoto',
                            'inventive-mirumoto'
                        ]
                    }
                });

                this.namelessBrother =
                    this.player1.findCardByName('nameless-brother');
                this.togashiYoshi =
                    this.player1.findCardByName('togashi-yoshi');
                this.initiate1 =
                    this.player1.filterCardsByName('togashi-initiate')[0];
                this.initiate2 =
                    this.player1.filterCardsByName('togashi-initiate')[1];
                this.mirumoto1 =
                    this.player1.filterCardsByName('inventive-mirumoto')[0];
                this.mirumoto2 =
                    this.player1.filterCardsByName('inventive-mirumoto')[1];
                this.mirumoto3 =
                    this.player1.filterCardsByName('inventive-mirumoto')[2];
            });

            it('gives skill bonus to all characters with repeated names', function () {
                expect(this.namelessBrother.militarySkill).toBe(1);
                expect(this.namelessBrother.politicalSkill).toBe(1);

                expect(this.togashiYoshi.militarySkill).toBe(1);
                expect(this.togashiYoshi.politicalSkill).toBe(1);

                expect(this.initiate1.militarySkill).toBe(2);
                expect(this.initiate1.politicalSkill).toBe(2);
                expect(this.initiate2.militarySkill).toBe(2);
                expect(this.initiate2.politicalSkill).toBe(2);

                expect(this.mirumoto1.militarySkill).toBe(3);
                expect(this.mirumoto1.politicalSkill).toBe(3);
                expect(this.mirumoto2.militarySkill).toBe(3);
                expect(this.mirumoto2.politicalSkill).toBe(3);
                expect(this.mirumoto3.militarySkill).toBe(3);
                expect(this.mirumoto3.politicalSkill).toBe(3);
            });
        });

        describe('Multiple Nameless Brother', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: [
                            'nameless-brother',
                            'nameless-brother',
                            'togashi-yoshi',
                            'togashi-initiate',
                            'togashi-initiate',
                            'inventive-mirumoto',
                            'inventive-mirumoto',
                            'inventive-mirumoto'
                        ]
                    }
                });

                this.namelessBrother1 =
                    this.player1.filterCardsByName('nameless-brother')[0];
                this.namelessBrother2 =
                    this.player1.filterCardsByName('nameless-brother')[1];
                this.togashiYoshi =
                    this.player1.findCardByName('togashi-yoshi');
                this.initiate1 =
                    this.player1.filterCardsByName('togashi-initiate')[0];
                this.initiate2 =
                    this.player1.filterCardsByName('togashi-initiate')[1];
                this.mirumoto1 =
                    this.player1.filterCardsByName('inventive-mirumoto')[0];
                this.mirumoto2 =
                    this.player1.filterCardsByName('inventive-mirumoto')[1];
                this.mirumoto3 =
                    this.player1.filterCardsByName('inventive-mirumoto')[2];
            });

            it('gives skill bonus to all characters with repeated names', function () {
                expect(this.namelessBrother1.militarySkill).toBe(3);
                expect(this.namelessBrother1.politicalSkill).toBe(3);
                expect(this.namelessBrother2.militarySkill).toBe(3);
                expect(this.namelessBrother2.politicalSkill).toBe(3);

                expect(this.togashiYoshi.militarySkill).toBe(1);
                expect(this.togashiYoshi.politicalSkill).toBe(1);

                expect(this.initiate1.militarySkill).toBe(3);
                expect(this.initiate1.politicalSkill).toBe(3);
                expect(this.initiate2.militarySkill).toBe(3);
                expect(this.initiate2.politicalSkill).toBe(3);

                expect(this.mirumoto1.militarySkill).toBe(5);
                expect(this.mirumoto1.politicalSkill).toBe(5);
                expect(this.mirumoto2.militarySkill).toBe(5);
                expect(this.mirumoto2.politicalSkill).toBe(5);
                expect(this.mirumoto3.militarySkill).toBe(5);
                expect(this.mirumoto3.politicalSkill).toBe(5);
            });
        });
    });
});
