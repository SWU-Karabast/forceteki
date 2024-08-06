describe('Ashen Flame Plateau', function() {
    integration(function() {
        beforeEach(function() {
            this.setupTest({
                phase: 'conflict',
                player1: {
                    inPlay: ['doji-challenger','isawa-ujina','kaiu-envoy','iuchi-shahai','miwaku-kabe-guard','acolyte-of-koyane'],
                    hand: ['duelist-training', 'hawk-tattoo']
                },
                player2: {
                    inPlay: ['hantei-sotorii'],
                    hand: ['assassination'],
                    provinces: ['ashen-flame-plateau']
                }
            });
            this.koyane = this.player1.findCardByName('acolyte-of-koyane');
            this.challenger = this.player1.findCardByName('doji-challenger');
            this.ujina = this.player1.findCardByName('isawa-ujina');
            this.envoy = this.player1.findCardByName('kaiu-envoy');
            this.shahai = this.player1.findCardByName('iuchi-shahai');
            this.kabeGuard = this.player1.findCardByName('miwaku-kabe-guard');
            this.training = this.player1.findCardByName('duelist-training');
            this.hawk = this.player1.findCardByName('hawk-tattoo');

            this.sotorii = this.player2.findCardByName('hantei-sotorii');
            this.assassination = this.player2.findCardByName('assassination');
            this.wasteland = this.player2.findCardByName('ashen-flame-plateau');
        });

        it('should react to conflict declaration and stop attacking characters from triggering abilities', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                province: this.wasteland
            });
            expect(this.player2).toHavePrompt('Triggered Abilities');
            expect(this.player2).toBeAbleToSelect(this.wasteland);
            this.player2.clickCard(this.wasteland);
            expect(this.getChatLogs(5)).toContain('player2 uses Ashen Flame Plateau to prevent player1 from triggering character abilities this conflict');
            this.player2.clickPrompt('Done');
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should stop gained abilities', function() {
            this.player1.playAttachment(this.training, this.challenger);

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.challenger],
                province: this.wasteland
            });
            this.player2.clickCard(this.wasteland);
            this.player2.clickCard(this.sotorii);
            this.player2.clickPrompt('Done');
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should stop sincerity and courtesy in conflict', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.envoy],
                province: this.wasteland
            });
            let cards = this.player1.hand.length;
            let fate = this.player1.fate;

            this.player2.clickCard(this.wasteland);
            this.player2.clickCard(this.sotorii);
            this.player2.clickPrompt('Done');

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.envoy);
            expect(this.envoy.location).toBe('dynasty discard pile');
            expect(this.player1.hand.length).toBe(cards);
            expect(this.player1.fate).toBe(fate);
        });

        it('should stop sincerity and courtesy at home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujina],
                province: this.wasteland
            });
            let cards = this.player1.hand.length;
            let fate = this.player1.fate;

            this.player2.clickCard(this.wasteland);
            this.player2.clickCard(this.sotorii);
            this.player2.clickPrompt('Done');

            this.player2.clickCard(this.assassination);
            this.player2.clickCard(this.envoy);
            expect(this.envoy.location).toBe('dynasty discard pile');
            expect(this.player1.hand.length).toBe(cards);
            expect(this.player1.fate).toBe(fate);
        });

        it('should stop abilities at home', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'political',
                attackers: [this.ujina],
                province: this.wasteland
            });
            this.player2.clickCard(this.wasteland);
            this.player2.clickCard(this.sotorii);
            this.player2.clickPrompt('Done');

            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.koyane);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should stop abilities on characters who move to the conflict', function() {
            this.player1.playAttachment(this.training, this.challenger);

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujina],
                province: this.wasteland
            });
            this.player2.clickCard(this.wasteland);
            this.player2.clickCard(this.sotorii);
            this.player2.clickPrompt('Done');
            this.player2.pass();
            this.player1.clickCard(this.hawk);
            this.player1.clickCard(this.challenger);
            this.player1.clickCard(this.hawk);
            this.player2.pass();
            expect(this.player1).toHavePrompt('Conflict Action Window');
            this.player1.clickCard(this.challenger);
            expect(this.player1).toHavePrompt('Conflict Action Window');
        });

        it('should stop forced abilities', function() {
            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujina],
                ring: 'void',
                province: this.wasteland
            });
            this.player2.clickCard(this.wasteland);
            this.player2.clickCard(this.sotorii);
            this.player2.clickPrompt('Done');
            this.noMoreActions();
            expect(this.player1).not.toHavePrompt('Isawa Ujina');
        });

        it('should not stop abilities on defending characters', function() {
            this.player1.playAttachment(this.training, this.challenger);

            this.noMoreActions();
            this.initiateConflict({
                type: 'military',
                attackers: [this.ujina],
                province: this.wasteland
            });
            this.player2.clickCard(this.wasteland);
            this.player2.clickCard(this.sotorii);
            this.player2.clickPrompt('Done');
            let glory = this.sotorii.glory;
            this.player2.clickCard(this.sotorii);
            expect(this.player2).toHavePrompt('Hantei Sotorii');
            this.player2.clickCard(this.sotorii);
            expect(this.sotorii.glory).toBe(glory + 3);
        });
    });
});
