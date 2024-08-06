describe('Chikara', function() {
    integration(function() {
        describe('Chikara attachment', function() {
            beforeEach(function() {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        fate: 3,
                        inPlay: ['hida-kisada', 'brash-samurai', 'hida-o-ushi', 'yoritomo'],
                        hand: ['chikara', 'seal-of-the-crab']
                    },
                    player2: {
                        inPlay: ['hida-kisada', 'doji-challenger'],
                        hand: ['let-go'],
                        dynastyDiscard: ['daidoji-netsu']
                    }
                });
                this.kisadaP1 = this.player1.findCardByName('hida-kisada');
                this.brashSamurai = this.player1.findCardByName('brash-samurai');
                this.oushi = this.player1.findCardByName('hida-o-ushi');
                this.yoritomo = this.player1.findCardByName('yoritomo');
                this.chikara = this.player1.findCardByName('chikara');
                this.seal = this.player1.findCardByName('seal-of-the-crab');

                this.kisadaP2 = this.player2.findCardByName('hida-kisada');
                this.challenger = this.player2.findCardByName('doji-challenger');
                this.letGo = this.player2.findCardByName('let-go');
                this.netsu = this.player2.findCardByName('daidoji-netsu');
            });

            it('should only be able to attach to unique crab characters you control', function() {
                this.player1.clickCard(this.chikara);
                expect(this.player1).toBeAbleToSelect(this.kisadaP1);
                expect(this.player1).not.toBeAbleToSelect(this.kisadaP2);
                expect(this.player1).not.toBeAbleToSelect(this.brashSamurai);
                expect(this.player1).toBeAbleToSelect(this.oushi);
                expect(this.player1).not.toBeAbleToSelect(this.yoritomo);
            });

            it('should grant the ability to a character that is a champion when attached', function() {
                let actionCount = this.kisadaP1.getReactions().length;
                this.player1.playAttachment(this.chikara, this.kisadaP1);
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.kisadaP1.getReactions().length).toBe(actionCount + 1);
            });

            it('should not grant an ability to a character that is not a champion when attached', function() {
                let actionCount = this.oushi.getReactions().length;
                this.player1.playAttachment(this.chikara, this.oushi);
                expect(this.player2).toHavePrompt('Action Window');
                expect(this.oushi.getReactions().length).toBe(actionCount);
            });

            describe('unique non-crab character with the seal attached', function() {
                beforeEach(function () {
                    this.player1.playAttachment(this.seal, this.yoritomo);
                    this.player2.pass();
                });

                it('should attach', function() {
                    this.player1.clickCard(this.chikara);
                    expect(this.player1).toBeAbleToSelect(this.yoritomo);
                });

                it('should grant the ability if the character is a champion', function() {
                    let actionCount = this.yoritomo.getReactions().length;
                    this.player1.playAttachment(this.chikara, this.yoritomo);
                    expect(this.yoritomo.getReactions().length).toBe(actionCount + 1);
                });

                it('should discard if the character loses faction', function() {
                    this.player1.playAttachment(this.chikara, this.yoritomo);
                    this.player2.clickCard(this.letGo);
                    this.player2.clickCard(this.seal);
                    expect(this.chikara.location).toBe('conflict discard pile');
                });
            });

            describe('ability', function () {
                beforeEach(function () {
                    this.player1.playAttachment(this.chikara, this.kisadaP1);
                    this.noMoreActions();

                    this.kisadaP2.fate = 5;
                    this.kisadaP1.fate = 4;
                    this.oushi.fate = 2;
                    this.yoritomo.fate = 0;
                });

                it('should trigger when holder wins a conflict & ability should not be on sword', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    expect(this.player1).toBeAbleToSelect(this.kisadaP1);
                    expect(this.player1).not.toBeAbleToSelect(this.chikara);
                });

                it('should not trigger if holder is not participating', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });
                    this.noMoreActions();
                    expect(this.player1).not.toHavePrompt('Triggered Abilities');
                });

                it('should let you choose a participating character', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });
                    this.noMoreActions();
                    this.player1.clickCard(this.kisadaP1);
                    expect(this.player1).toBeAbleToSelect(this.kisadaP1);
                    expect(this.player1).toBeAbleToSelect(this.oushi);
                    expect(this.player1).toBeAbleToSelect(this.yoritomo);
                    expect(this.player1).toBeAbleToSelect(this.kisadaP2);
                    expect(this.player1).not.toBeAbleToSelect(this.brashSamurai);
                    expect(this.player1).not.toBeAbleToSelect(this.challenger);
                });

                it('should return fate and sacrifice character', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });

                    let p1Fate = this.player1.fate;
                    let p2Fate = this.player2.fate;
                    let targetFate = this.kisadaP2.fate;

                    this.noMoreActions();
                    this.player1.clickCard(this.kisadaP1);
                    this.player1.clickCard(this.kisadaP2);

                    expect(this.player1.fate).toBe(p1Fate);
                    expect(this.player2.fate).toBe(p2Fate + targetFate);
                    expect(this.kisadaP2.location).toBe('dynasty discard pile');
                    expect(this.getChatLogs(5)).toContain('player1 uses Hida Kisada\'s gained ability from Chikara to force player2 to sacrifice Hida Kisada, returning all its fate to player2\'s fate pool');
                });

                it('should return fate and sacrifice character (self)', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });

                    let p1Fate = this.player1.fate;
                    let p2Fate = this.player2.fate;
                    let targetFate = this.kisadaP1.fate;

                    this.noMoreActions();
                    this.player1.clickCard(this.kisadaP1);
                    this.player1.clickCard(this.kisadaP1);

                    expect(this.player1.fate).toBe(p1Fate + targetFate);
                    expect(this.player2.fate).toBe(p2Fate);
                    expect(this.kisadaP1.location).toBe('dynasty discard pile');
                    expect(this.getChatLogs(5)).toContain('player1 uses Hida Kisada\'s gained ability from Chikara to force player1 to sacrifice Hida Kisada, returning all its fate to player1\'s fate pool');
                });

                it('should return fate even if it can\'t sacrifice', function() {
                    this.player2.moveCard(this.netsu, 'play area');
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });

                    let p1Fate = this.player1.fate;
                    let p2Fate = this.player2.fate;
                    let targetFate = this.kisadaP1.fate;

                    this.noMoreActions();
                    this.player1.clickCard(this.kisadaP1);
                    this.player1.clickCard(this.kisadaP1);

                    expect(this.player1.fate).toBe(p1Fate + targetFate);
                    expect(this.player2.fate).toBe(p2Fate);
                    expect(this.kisadaP1.location).toBe('play area');
                    expect(this.getChatLogs(5)).toContain('player1 uses Hida Kisada\'s gained ability from Chikara to force player1 to sacrifice Hida Kisada, returning all its fate to player1\'s fate pool');
                });

                it('should sacrifice even if target has no fate', function() {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });

                    let p1Fate = this.player1.fate;
                    let p2Fate = this.player2.fate;
                    let targetFate = this.yoritomo.fate;

                    this.noMoreActions();
                    this.player1.clickCard(this.kisadaP1);
                    this.player1.clickCard(this.yoritomo);

                    expect(this.player1.fate).toBe(p1Fate + targetFate);
                    expect(this.player2.fate).toBe(p2Fate);
                    expect(this.kisadaP1.location).toBe('play area');
                    expect(this.getChatLogs(5)).toContain('player1 uses Hida Kisada\'s gained ability from Chikara to force player1 to sacrifice Yoritomo, returning all its fate to player1\'s fate pool');
                });

                it('should not be able to target a character who cannot be sacrificed and has no fate', function() {
                    this.player2.moveCard(this.netsu, 'play area');
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kisadaP1, this.oushi, this.yoritomo],
                        defenders: [this.kisadaP2]
                    });

                    this.noMoreActions();
                    this.player1.clickCard(this.kisadaP1);
                    expect(this.player1).toBeAbleToSelect(this.kisadaP1);
                    expect(this.player1).toBeAbleToSelect(this.oushi);
                    expect(this.player1).not.toBeAbleToSelect(this.yoritomo);
                });
            });
        });
    });
});
