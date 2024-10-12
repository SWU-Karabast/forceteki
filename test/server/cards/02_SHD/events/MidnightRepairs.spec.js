describe('Midnight Repairs', function () {
    integration(function () {
        describe('Midnight Repairs\'s ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['midnight-repairs'],
                        groundArena: [{ card: 'pyke-sentinel', damage: 1 }],
                        spaceArena: ['cartel-spacer'],
                        leader: { card: 'sabine-wren#galvanized-revolutionary', deployed: true, damage: 4 }
                    },
                    player2: {
                        groundArena: [{ card: 'wampa', damage: 3 }],
                        spaceArena: [{ card: 'imperial-interceptor', damage: 1 }]
                    }
                });
            });

            it('should remove 8 total damage from friendly and enemy units', function () {
                this.player1.clickCard(this.midnightRepairs);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.sabineWren, this.wampa, this.imperialInterceptor]);
                expect(this.player1).toHaveChooseNoTargetButton();
                this.player1.setDistributeHealingPromptState(new Map([
                    [this.pykeSentinel, 2],
                    [this.cartelSpacer, 2],
                    [this.sabineWren, 3],
                    [this.wampa, 1]
                ]));

                expect(this.pykeSentinel.damage).toBe(0);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.sabineWren.damage).toBe(1);
                expect(this.wampa.damage).toBe(2);
                expect(this.imperialInterceptor.damage).toBe(1);
                expect(this.player2).toBeActivePlayer();
            });

            it('should be able to remove less than 8 damage', function () {
                this.player1.clickCard(this.midnightRepairs);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.sabineWren, this.wampa, this.imperialInterceptor]);
                this.player1.setDistributeHealingPromptState(new Map([
                    [this.sabineWren, 3],
                ]));

                expect(this.pykeSentinel.damage).toBe(1);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.sabineWren.damage).toBe(1);
                expect(this.wampa.damage).toBe(3);
                expect(this.imperialInterceptor.damage).toBe(1);
                expect(this.player2).toBeActivePlayer();
            });

            it('should be able to choose 0 targets', function () {
                this.player1.clickCard(this.midnightRepairs);
                expect(this.player1).toBeAbleToSelectExactly([this.pykeSentinel, this.cartelSpacer, this.sabineWren, this.wampa, this.imperialInterceptor]);
                this.player1.clickPrompt('Choose no targets');

                expect(this.pykeSentinel.damage).toBe(1);
                expect(this.cartelSpacer.damage).toBe(0);
                expect(this.sabineWren.damage).toBe(4);
                expect(this.wampa.damage).toBe(3);
                expect(this.imperialInterceptor.damage).toBe(1);
                expect(this.player2).toBeActivePlayer();
            });
        });

        describe('Midnight Repairs\'s ability, if there is only one target for healing,', function() {
            beforeEach(function () {
                this.setupTest({
                    phase: 'action',
                    player1: {
                        hand: ['midnight-repairs'],
                        groundArena: [{ card: 'battlefield-marine', damage: 2 }]
                    },
                    player2: {
                    }
                });
            });

            it('should not automatically select that target', function () {
                this.player1.clickCard(this.midnightRepairs);
                expect(this.player1).toBeAbleToSelectExactly([this.battlefieldMarine]);
            });
        });
    });
});
