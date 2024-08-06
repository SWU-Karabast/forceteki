describe('Hida Regular', function () {
    integration(function () {
        beforeEach(function () {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['hida-regular', 'bayushi-manipulator']
                },
                player2: {
                    inPlay: ['doji-whisperer', 'doji-diplomat', 'hantei-sotorii', 'brash-samurai'],
                    hand: ['assassination']
                }
            });

            this.regular = this.player1.findCardByName('hida-regular');
            this.manipulator = this.player1.findCardByName('bayushi-manipulator');

            this.whisperer = this.player2.findCardByName('doji-whisperer');
            this.diplomat = this.player2.findCardByName('doji-diplomat');
            this.brash = this.player2.findCardByName('brash-samurai');
            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.assassination = this.player2.findCardByName('assassination');
            this.manipulator.fate = 1;
            this.sotorii.fate = 2;
            this.regular.fate = 1;
            this.brash.fate = 1;
            this.diplomat.fate = 2;
        });

        it('Should react and remove fate from a character with equal or lower mil', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.regular, this.manipulator],
                defenders: [this.whisperer, this.brash, this.sotorii]
            });

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.regular);

            expect(this.player1).toHavePrompt('Triggered Abilities');
            expect(this.player1).toBeAbleToSelect(this.regular);
            this.player1.clickCard(this.regular);

            expect(this.player1).toBeAbleToSelect(this.regular);
            expect(this.player1).not.toBeAbleToSelect(this.whisperer);
            expect(this.player1).toBeAbleToSelect(this.brash);
            expect(this.player1).not.toBeAbleToSelect(this.sotorii);
            expect(this.player1).not.toBeAbleToSelect(this.diplomat);
            expect(this.player1).toBeAbleToSelect(this.manipulator);

            let fate = this.brash.fate;
            this.player1.clickCard(this.brash);
            expect(this.brash.fate).toBe(fate - 1);
            expect(this.getChatLogs(5)).toContain('player1 uses Hida Regular to remove 1 fate from Brash Samurai');
        });

        it('Should not react when someone else leaves play', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.regular, this.manipulator],
                defenders: [this.whisperer, this.brash, this.sotorii]
            });

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.manipulator);

            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('Should not react at home', function () {
            this.noMoreActions();
            this.initiateConflict({
                attackers: [this.manipulator],
                defenders: [this.whisperer, this.brash, this.sotorii]
            });

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.regular);

            expect(this.player1).toHavePrompt('Conflict Action Window');
        });
    });
});
