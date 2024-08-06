describe('Kitsuki Seiji', function () {
    integration(function () {
        describe('Static ability for variable skill', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kitsuki-seiji'],
                        hand: ['game-of-sadane']
                    },
                    player2: {
                        inPlay: ['shiba-tsukune']
                    }
                });
                this.seiji = this.player1.findCardByName('kitsuki-seiji');
                this.tsukune = this.player2.findCardByName('shiba-tsukune');
                this.gameOfSadane = this.player1.findCardByName('game-of-sadane');
            });

            describe('When the bid is odd', function () {
                beforeEach(function () {
                    this.player1.player.showBid = 1;
                    this.noMoreActions();
                });

                it('gets +2/-2', function () {
                    expect(this.seiji.militarySkill).toBe(5);
                    expect(this.seiji.politicalSkill).toBe(1);
                });
            });

            describe('When the bid is even', function () {
                beforeEach(function () {
                    this.player1.player.showBid = 2;
                    this.noMoreActions();
                });

                it('gets -2/+2', function () {
                    expect(this.seiji.militarySkill).toBe(1);
                    expect(this.seiji.politicalSkill).toBe(5);
                });
            });

            describe('Affects duels', function () {
                beforeEach(function () {
                    this.player1.player.showBid = 1;
                    this.noMoreActions();
                    this.initiateConflict({
                        ring: 'void',
                        attackers: [this.seiji],
                        defenders: [this.tsukune]
                    });
                    this.player2.pass();
                });

                it('the skill modifiers affect duels', function () {
                    expect(this.seiji.militarySkill).toBe(5);
                    expect(this.seiji.politicalSkill).toBe(1);

                    this.player1.clickCard(this.gameOfSadane);
                    this.player1.clickCard(this.seiji);
                    this.player1.clickCard(this.tsukune);
                    this.player1.clickPrompt('2');
                    this.player2.clickPrompt('2');

                    expect(this.seiji.isHonored).toBe(true);
                    expect(this.tsukune.isDishonored).toBe(true);
                });
            });
        });

        describe('Interrupt ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kitsuki-seiji', 'tranquil-philosopher'],
                        hand: ['elemental-inversion']
                    },
                    player2: {
                        hand: ['written-in-the-stars']
                    }
                });
                this.seiji = this.player1.findCardByName('kitsuki-seiji');
                this.tranquil = this.player1.findCardByName('tranquil-philosopher');
                this.elementalInversion = this.player1.findCardByName('elemental-inversion');

                this.writtenInTheStars = this.player2.findCardByName('written-in-the-stars');
            });

            it('gains fate when water ring gets fate during Fate phase', function () {
                this.seiji.fate = 1;

                this.flow.finishConflictPhase();

                this.player1.clickPrompt('Done'); // removing fate from characters
                expect(this.seiji.fate).toBe(0);

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.seiji);
                this.player1.clickCard(this.seiji);
                expect(this.seiji.fate).toBe(1);
                expect(this.game.rings.water.fate).toBe(0);
                expect(this.game.rings.air.fate).toBe(1);
                expect(this.game.rings.earth.fate).toBe(1);
                expect(this.game.rings.fire.fate).toBe(1);
                expect(this.game.rings.void.fate).toBe(1);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Kitsuki Seiji to put the fate that would go on the water ring on Kitsuki Seiji instead'
                );
            });

            it('gains fate when water ring gets fate added due to effects', function () {
                this.seiji.fate = 0;
                expect(this.seiji.fate).toBe(0);

                this.player1.pass();

                this.player2.clickCard(this.writtenInTheStars);
                this.player2.clickPrompt('Place one fate on each unclaimed ring with no fate');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.seiji);
                this.player1.clickCard(this.seiji);
                expect(this.seiji.fate).toBe(1);
                expect(this.game.rings.water.fate).toBe(0);
                expect(this.game.rings.air.fate).toBe(1);
                expect(this.game.rings.earth.fate).toBe(1);
                expect(this.game.rings.fire.fate).toBe(1);
                expect(this.game.rings.void.fate).toBe(1);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Kitsuki Seiji to put the fate that would go on the water ring on Kitsuki Seiji instead'
                );
            });

            it('gains fate when fate is moved to the water ring', function () {
                this.seiji.fate = 0;
                this.game.rings.earth.fate = 2;
                expect(this.seiji.fate).toBe(0);

                this.player1.clickCard(this.tranquil);
                this.player1.clickRing('earth');
                this.player1.clickRing('water');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.seiji);
                this.player1.clickCard(this.seiji);
                expect(this.seiji.fate).toBe(1);
                expect(this.game.rings.water.fate).toBe(0);
                expect(this.game.rings.earth.fate).toBe(1);
                expect(this.game.rings.air.fate).toBe(0);
                expect(this.game.rings.fire.fate).toBe(0);
                expect(this.game.rings.void.fate).toBe(0);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Kitsuki Seiji to put the fate that would go on the water ring on Kitsuki Seiji instead'
                );
            });

            it('gains all the fate when multiple fate is moved to the water ring', function () {
                this.seiji.fate = 0;
                this.game.rings.earth.fate = 2;
                expect(this.seiji.fate).toBe(0);

                this.noMoreActions();
                this.initiateConflict({
                    ring: 'water',
                    attackers: [this.seiji],
                    defenders: []
                });

                this.player2.pass();

                this.player1.clickCard(this.elementalInversion);
                this.player1.clickRing('earth');

                expect(this.player1).toHavePrompt('Triggered Abilities');
                expect(this.player1).toBeAbleToSelect(this.seiji);
                this.player1.clickCard(this.seiji);
                expect(this.seiji.fate).toBe(2);
                expect(this.game.rings.water.fate).toBe(0);
                expect(this.game.rings.earth.fate).toBe(0);
                expect(this.game.rings.air.fate).toBe(0);
                expect(this.game.rings.fire.fate).toBe(0);
                expect(this.game.rings.void.fate).toBe(0);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Kitsuki Seiji to put the fate that would go on the water ring on Kitsuki Seiji instead'
                );
            });
        });
    });
});
