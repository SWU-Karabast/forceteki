describe('Ichigo-kun', function () {
    integration(function () {
        describe('Ichigo-kun during fire conflicts', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['ichigo-kun', 'shika-matchmaker'],
                        provinces: ['manicured-garden']
                    },
                    player2: {
                        inPlay: ['ikoma-ikehata'],
                        hand: ['elemental-inversion'],
                        provinces: ['shameful-display']
                    }
                });

                this.ichigoKun = this.player1.findCardByName('ichigo-kun');
                this.matchmaker = this.player1.findCardByName('shika-matchmaker');
                this.manicuredGarden = this.player1.findCardByName('manicured-garden', 'province 1');

                this.shamefulDisplay1 = this.player2.findCardByName('shameful-display', 'province 1');
                this.ikehata = this.player2.findCardByName('ikoma-ikehata');
                this.elementalInversion = this.player2.findCardByName('elemental-inversion');
            });

            it('has zero base military during fire conflicts', function () {
                this.noMoreActions();
                this.initiateConflict({
                    ring: 'fire',
                    type: 'military',
                    attackers: [this.ichigoKun],
                    defenders: []
                });

                expect(this.ichigoKun.getBaseMilitarySkill()).toBe(0);
            });

            it('has zero base military when the conflict element is changed to fire', function () {
                this.noMoreActions();

                this.initiateConflict({
                    ring: 'earth',
                    type: 'military',
                    attackers: [this.ichigoKun],
                    defenders: []
                });

                this.player2.clickCard(this.elementalInversion);
                this.player2.clickRing('fire');
                expect(this.ichigoKun.getBaseMilitarySkill()).toBe(0);
            });
        });

        describe('Ichigo-kun ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['ichigo-kun', 'worldly-shiotome']
                    },
                    player2: {
                        inPlay: ['solemn-scholar']
                    }
                });

                this.ichigoKun = this.player1.findCardByName('ichigo-kun');
                this.shiotome = this.player1.findCardByName('worldly-shiotome');

                this.solemn = this.player2.findCardByName('solemn-scholar');
                this.noMoreActions();
            });

            it('does not trigger when alone', function () {
                this.initiateConflict({
                    ring: 'void',
                    type: 'military',
                    attackers: [this.ichigoKun],
                    defenders: [this.solemn]
                });

                this.player2.pass();

                expect(this.player1).not.toHavePrompt('Triggered Abilities');
                expect(this.player1).not.toBeAbleToSelect(this.ichigoKun);
                expect(this.player1).not.toBeAbleToSelect(this.solemn);
                expect(this.player1).not.toBeAbleToSelect(this.shiotome);
            });

            it('gains military on itself and reduces glory of companion', function () {
                const ichigoInitialMil = this.ichigoKun.militarySkill;
                const shiotomeInitialGlory = this.shiotome.glory;
                this.initiateConflict({
                    ring: 'void',
                    type: 'military',
                    attackers: [this.ichigoKun, this.shiotome],
                    defenders: [this.solemn]
                });

                this.player2.pass();

                this.player1.clickCard(this.ichigoKun);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).not.toBeAbleToSelect(this.ichigoKun);
                expect(this.player1).not.toBeAbleToSelect(this.solemn);
                expect(this.player1).toBeAbleToSelect(this.shiotome);

                this.player1.clickCard(this.shiotome);
                expect(this.player1).toHavePrompt('Select one');
                expect(this.player1).toHavePromptButton('Increase own military, reduce other glory');
                expect(this.player1).toHavePromptButton('Reduce own military, increase other glory');

                this.player1.clickPrompt('Increase own military, reduce other glory');
                expect(this.ichigoKun.militarySkill).toBe(ichigoInitialMil + 2);
                expect(this.shiotome.glory).toBe(shiotomeInitialGlory - 2);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Ichigo-kun to give Ichigo-kun +2 military and Worldly Shiotome -2 glory - Ichigo-kun is wild today!'
                );
            });

            it('loses military on itself and increases glory of companion', function () {
                const ichigoInitialMil = this.ichigoKun.militarySkill;
                const shiotomeInitialGlory = this.shiotome.glory;
                this.initiateConflict({
                    ring: 'void',
                    type: 'military',
                    attackers: [this.ichigoKun, this.shiotome],
                    defenders: [this.solemn]
                });

                this.player2.pass();

                this.player1.clickCard(this.ichigoKun);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).not.toBeAbleToSelect(this.ichigoKun);
                expect(this.player1).not.toBeAbleToSelect(this.solemn);
                expect(this.player1).toBeAbleToSelect(this.shiotome);

                this.player1.clickCard(this.shiotome);
                expect(this.player1).toHavePrompt('Select one');
                expect(this.player1).toHavePromptButton('Increase own military, reduce other glory');
                expect(this.player1).toHavePromptButton('Reduce own military, increase other glory');

                this.player1.clickPrompt('Reduce own military, increase other glory');
                expect(this.ichigoKun.militarySkill).toBe(ichigoInitialMil - 2);
                expect(this.shiotome.glory).toBe(shiotomeInitialGlory + 2);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Ichigo-kun to give Ichigo-kun -2 military and Worldly Shiotome +2 glory - Ichigo-kun is well-behaved. Impressive!'
                );
            });

            it('can move into the conflict with ability', function () {
                const ichigoInitialMil = this.ichigoKun.militarySkill;
                const shiotomeInitialGlory = this.shiotome.glory;
                this.initiateConflict({
                    ring: 'void',
                    type: 'military',
                    attackers: [this.shiotome],
                    defenders: [this.solemn]
                });

                this.player2.pass();

                this.player1.clickCard(this.ichigoKun);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).not.toBeAbleToSelect(this.ichigoKun);
                expect(this.player1).not.toBeAbleToSelect(this.solemn);
                expect(this.player1).toBeAbleToSelect(this.shiotome);

                this.player1.clickCard(this.shiotome);
                expect(this.player1).toHavePrompt('Select one');
                expect(this.player1).toHavePromptButton('Increase own military, reduce other glory');
                expect(this.player1).toHavePromptButton('Reduce own military, increase other glory');

                this.player1.clickPrompt('Increase own military, reduce other glory');
                expect(this.ichigoKun.militarySkill).toBe(ichigoInitialMil + 2);
                expect(this.shiotome.glory).toBe(shiotomeInitialGlory - 2);
                expect(this.ichigoKun.isParticipating()).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Ichigo-kun to give Ichigo-kun +2 military and Worldly Shiotome -2 glory - Ichigo-kun is wild today!'
                );
            });
        });
    });
});
