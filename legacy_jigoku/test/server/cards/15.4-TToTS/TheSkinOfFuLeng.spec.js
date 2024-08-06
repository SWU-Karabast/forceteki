describe('The Skin of Fu Leng', function () {
    integration(function () {
        describe('Attaching Restriction', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kakita-toshimoko', 'doji-challenger', 'bayushi-kachiko-2'],
                        hand: ['the-skin-of-fu-leng']
                    },
                    player2: {
                        inPlay: ['bayushi-kachiko']
                    }
                });

                this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                this.challenger = this.player1.findCardByName('doji-challenger');
                this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                this.kachiko = this.player2.findCardByName('bayushi-kachiko');
            });

            it('should allow you to attach to a unique character you control', function () {
                this.player1.clickCard(this.skin);
                expect(this.player1).toBeAbleToSelect(this.toshimoko);
                expect(this.player1).not.toBeAbleToSelect(this.challenger);
                expect(this.player1).not.toBeAbleToSelect(this.kachiko);
            });
        });

        describe('Opponent cannot trigger characters', function () {
            describe('Actions', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['lion-s-pride-brawler', 'honored-general']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.brawler = this.player2.findCardByName('lion-s-pride-brawler');
                    this.general = this.player2.findCardByName('honored-general');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Should be able to trigger characters with fate', function () {
                    this.brawler.fate = 1;
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brawler, this.general],
                        defenders: [this.toshimoko]
                    });
                    this.player1.pass();
                    this.player2.clickCard(this.brawler);
                    expect(this.player2).toBeAbleToSelect(this.brawler);
                    expect(this.player2).toBeAbleToSelect(this.toshimoko);
                    this.player2.clickCard(this.toshimoko);
                    expect(this.toshimoko.bowed).toBe(true);
                });

                it('Should not be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brawler, this.general],
                        defenders: [this.toshimoko]
                    });
                    this.player1.pass();
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.clickCard(this.brawler);
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                });
            });

            describe('Reactions', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng', 'way-of-the-scorpion']
                        },
                        player2: {
                            inPlay: ['ardent-omoidasu'],
                            hand: ['way-of-the-scorpion']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.ardent = this.player2.findCardByName('ardent-omoidasu');
                    this.scorp1 = this.player1.findCardByName('way-of-the-scorpion');
                    this.scorp2 = this.player2.findCardByName('way-of-the-scorpion');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Should be able to trigger characters with fate', function () {
                    this.ardent.fate = 1;
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.ardent]
                    });
                    let p1 = this.player1.honor;
                    let p2 = this.player2.honor;
                    this.player2.pass();
                    this.player1.clickCard(this.scorp1);
                    this.player1.clickCard(this.ardent);
                    expect(this.player2).toHavePrompt('Triggered Abilities');
                    expect(this.player2).toBeAbleToSelect(this.ardent);
                    this.player2.clickCard(this.ardent);
                    expect(this.player1.honor).toBe(p1 - 2);
                    expect(this.player2.honor).toBe(p2 + 2);
                });

                it('Should not be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.ardent]
                    });
                    this.player2.pass();
                    this.player1.clickCard(this.scorp1);
                    this.player1.clickCard(this.ardent);
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    expect(this.ardent.isDishonored).toBe(true);
                });
            });

            describe('Interrupts', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['callow-delegate', 'doji-whisperer'],
                            hand: ['assassination']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.callow = this.player2.findCardByName('callow-delegate');
                    this.whisperer = this.player2.findCardByName('doji-whisperer');
                    this.assassination = this.player2.findCardByName('assassination');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Should be able to trigger characters with fate', function () {
                    this.callow.fate = 1;
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.callow]
                    });
                    this.player2.clickCard(this.assassination);
                    this.player2.clickCard(this.callow);
                    expect(this.player2).toHavePrompt('Triggered Abilities');
                    expect(this.player2).toBeAbleToSelect(this.callow);
                    this.player2.clickCard(this.callow);
                    expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
                    expect(this.player2).toBeAbleToSelect(this.callow);
                    expect(this.player2).toBeAbleToSelect(this.whisperer);
                    this.player2.clickCard(this.whisperer);
                    expect(this.whisperer.isHonored).toBe(true);
                });

                it('Should not be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.callow]
                    });
                    this.player2.clickCard(this.assassination);
                    this.player2.clickCard(this.callow);
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    this.player1.pass();
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });
            });
        });

        describe('Can Trigger opponent\'s characters', function () {
            describe('Actions', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['lion-s-pride-brawler', 'honored-general']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.brawler = this.player2.findCardByName('lion-s-pride-brawler');
                    this.general = this.player2.findCardByName('honored-general');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Should be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brawler, this.general],
                        defenders: [this.toshimoko]
                    });
                    this.player1.clickCard(this.brawler);
                    expect(this.player1).toBeAbleToSelect(this.brawler);
                    expect(this.player1).toBeAbleToSelect(this.toshimoko);
                    this.player1.clickCard(this.toshimoko);
                    expect(this.toshimoko.bowed).toBe(true);
                });

                it('Should not be able to trigger characters with fate', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.brawler.fate = 1;
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brawler, this.general],
                        defenders: [this.toshimoko]
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.brawler);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });
            });

            describe('Reactions', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng', 'way-of-the-scorpion']
                        },
                        player2: {
                            inPlay: ['ardent-omoidasu'],
                            hand: ['way-of-the-scorpion']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.ardent = this.player2.findCardByName('ardent-omoidasu');
                    this.scorp1 = this.player1.findCardByName('way-of-the-scorpion');
                    this.scorp2 = this.player2.findCardByName('way-of-the-scorpion');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Should be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.ardent]
                    });
                    let p1 = this.player1.honor;
                    let p2 = this.player2.honor;
                    this.player2.clickCard(this.scorp2);
                    this.player2.clickCard(this.toshimoko);
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    expect(this.player1).toBeAbleToSelect(this.ardent);
                    this.player1.clickCard(this.ardent);
                    expect(this.player1.honor).toBe(p1 + 2);
                    expect(this.player2.honor).toBe(p2 - 2);
                });

                it('Should not be able to trigger characters with fate', function () {
                    this.ardent.fate = 1;
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.ardent]
                    });
                    this.player2.clickCard(this.scorp2);
                    this.player2.clickCard(this.toshimoko);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    expect(this.toshimoko.isDishonored).toBe(true);
                });
            });

            describe('Interrupts', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['callow-delegate', 'doji-whisperer'],
                            hand: ['assassination']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.callow = this.player2.findCardByName('callow-delegate');
                    this.whisperer = this.player2.findCardByName('doji-whisperer');
                    this.assassination = this.player2.findCardByName('assassination');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Should be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.callow]
                    });
                    this.player2.clickCard(this.assassination);
                    this.player2.clickCard(this.callow);
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    expect(this.player1).toBeAbleToSelect(this.callow);
                    this.player1.clickCard(this.callow);
                    expect(this.player1).toBeAbleToSelect(this.toshimoko);
                    expect(this.player1).not.toBeAbleToSelect(this.callow);
                    expect(this.player1).not.toBeAbleToSelect(this.whisperer);
                    this.player1.clickCard(this.toshimoko);
                    expect(this.toshimoko.isHonored).toBe(true);
                });

                it('Should not be able to trigger characters with fate', function () {
                    this.callow.fate = 1;
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.callow]
                    });
                    this.player2.clickCard(this.assassination);
                    this.player2.clickCard(this.callow);
                    expect(this.player2).toHavePrompt('Triggered Abilities');
                });
            });
        });

        describe('Testing Specific ability interactions', function () {
            /*
                Brash Samurai (I have no participating characters, my opponent just has Brash) - Should not trigger
                Brash Samurai (I have a character, my opponent just has Brash) - Should not trigger
                Brash Samurai (I have no participating characters, my opponent has Brash + something) - Should not trigger
            */
            describe('Participating Alone', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['brash-samurai', 'doji-challenger']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.brash = this.player2.findCardByName('brash-samurai');
                    this.challenger = this.player2.findCardByName('doji-challenger');

                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('should not allow you to trigger if you control a character', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.brash]
                    });
                    this.player2.pass();
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.brash);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    expect(this.brash.isHonored).toBe(false);
                });

                it('should not allow you to trigger if it is participating alone', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brash],
                        defenders: []
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.brash);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    expect(this.brash.isHonored).toBe(false);
                });

                it('should not allow you to trigger if it is not participating alone if you have no characters', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brash, this.challenger],
                        defenders: []
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.brash);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    expect(this.brash.isHonored).toBe(false);
                });
            });

            /*
                Doji Challenger (defending) - While this character is attacking: no trigger.
                Doji Challenger (attacking) - While this character is attacking: should trigger.  I should choose their character
            */
            describe('While this character is attacking', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['brash-samurai', 'doji-challenger']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.brash = this.player2.findCardByName('brash-samurai');
                    this.challenger = this.player2.findCardByName('doji-challenger');

                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('should not allow you to trigger if it is defending', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.challenger]
                    });
                    this.player2.pass();
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.challenger);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });

                it('should allow you to trigger if it is attacking', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.challenger],
                        defenders: []
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.challenger);
                    expect(this.player1).toHavePrompt('Doji Challenger');
                    expect(this.player1).not.toBeAbleToSelect(this.challenger);
                    expect(this.player1).toBeAbleToSelect(this.brash);
                    expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                    expect(this.game.currentConflict.attackers).not.toContain(this.brash);
                    this.player1.clickCard(this.brash);
                    expect(this.game.currentConflict.attackers).toContain(this.brash);

                    expect(this.getChatLogs(5)).toContain(
                        'player1 uses Doji Challenger to move Brash Samurai into the conflict'
                    );
                });
            });

            /*
                Guardian Kami (defending) (sacrifice cost) - Should trigger
                Guardian Kami (attacking) - no trigger
            */
            describe('While this character is defending (+ sacrifice cost)', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['guardian-kami']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.kami = this.player2.findCardByName('guardian-kami');

                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('should allow you to trigger if it is defending', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.kami],
                        ring: 'air'
                    });
                    let honor = this.player1.honor;
                    this.player2.pass();
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.kami);
                    expect(this.player1).toHavePrompt('Air Ring');
                    this.player1.clickPrompt('Gain 2 honor');
                    expect(this.player1.honor).toBe(honor + 2);
                    expect(this.getChatLogs(5)).toContain(
                        'player1 uses Guardian Kami, sacrificing Guardian Kami to resolve Air Ring'
                    );
                });

                it('should not allow you to trigger if it is attacking', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.kami],
                        defenders: [this.toshimoko]
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.kami);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });
            });

            /*
                Hida O-Ushi (defending, opponent wins conflict) - no trigger
                Hida O-Ushi (defending, I win conflict) - no trigger
                Hida O-Ushi (attacking, opponent wins conflict) - no trigger
                Hida O-Ushi (attacking, I win conflict) - should trigger, I get the extra conflict
            */
            describe('After you win a conflict as the defending player', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko', 'doji-whisperer'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['hida-o-ushi', 'togashi-acolyte']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.whisperer = this.player1.findCardByName('doji-whisperer');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.oushi = this.player2.findCardByName('hida-o-ushi');
                    this.acolyte = this.player2.findCardByName('togashi-acolyte');

                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('should not allow you to trigger if you lose as the attacker', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.whisperer],
                        defenders: [this.oushi],
                        type: 'military'
                    });
                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Action Window');
                });

                it('should not allow you to trigger if you win as the attacker', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.toshimoko],
                        defenders: [this.oushi],
                        type: 'military'
                    });
                    this.noMoreActions();
                    this.player1.clickPrompt('Don\'t Resolve');
                    expect(this.player1).toHavePrompt('Action Window');
                });

                it('should not allow you to trigger if you lose as the defender', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.acolyte],
                        defenders: [],
                        type: 'military'
                    });
                    this.noMoreActions();
                    this.player2.clickPrompt('Don\'t Resolve');
                    expect(this.player1).toHavePrompt('Action Window');
                });

                it('should allow you to trigger if you win as the defender', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.oushi],
                        defenders: [this.toshimoko],
                        type: 'military'
                    });

                    let conflicts = this.player1.player.getConflictOpportunities();
                    let milConflicts = this.player1.player.getRemainingConflictOpportunitiesForType('military');

                    let conflicts2 = this.player2.player.getConflictOpportunities();
                    let milConflicts2 = this.player2.player.getRemainingConflictOpportunitiesForType('military');

                    this.noMoreActions();
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    expect(this.player1).toBeAbleToSelect(this.oushi);
                    this.player1.clickCard(this.oushi);
                    expect(this.getChatLogs(5)).toContain(
                        'player1 uses Hida O-Ushi to allow player1 to declare an additional military conflict this phase'
                    );

                    expect(this.player1.player.getConflictOpportunities()).toBe(conflicts + 1);
                    expect(this.player1.player.getRemainingConflictOpportunitiesForType('military')).toBe(
                        milConflicts + 1
                    );

                    expect(this.player2.player.getConflictOpportunities()).toBe(conflicts2);
                    expect(this.player2.player.getRemainingConflictOpportunitiesForType('military')).toBe(
                        milConflicts2
                    );
                });
            });

            /*
                Tadaka2 - should use my removed from game pile
                Inferno Guard Invoker (Choose a character you control) - should not be able to choose itself
                Honored General (via charge) - I should get to choose whether to trigger
            */
            describe('Some general stuff', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng'],
                            dynastyDiscard: ['doji-whisperer']
                        },
                        player2: {
                            inPlay: ['inferno-guard-invoker', 'isawa-tadaka-2', 'daidoji-uji'],
                            hand: ['charge'],
                            dynastyDiscard: ['honored-general']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.whisperer = this.player1.findCardByName('doji-whisperer');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.invoker = this.player2.findCardByName('inferno-guard-invoker');
                    this.tadaka = this.player2.findCardByName('isawa-tadaka-2');
                    this.general = this.player2.placeCardInProvince('honored-general', 'province 1');
                    this.charge = this.player2.findCardByName('charge');
                    this.uji = this.player2.findCardByName('daidoji-uji');

                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('should use your own resources if they aren\'t elements on the card', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.toshimoko],
                        defenders: [],
                        type: 'military'
                    });

                    this.player2.pass();
                    this.player1.clickCard(this.tadaka);
                    expect(this.player1).toBeAbleToSelect(this.whisperer);
                    this.player1.clickCard(this.whisperer);
                    this.player1.clickPrompt('Done');
                    expect(this.player1).toHavePromptButton('Charge!');
                    this.player1.clickPrompt('Charge!');
                    expect(this.charge.location).toBe('conflict discard pile');
                });

                it('Choose a character you control - should not allow you to choose the character triggering the ability', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.toshimoko],
                        defenders: [this.invoker],
                        type: 'military'
                    });
                    this.player2.pass();
                    this.player1.clickCard(this.invoker);
                    expect(this.player1).not.toBeAbleToSelect(this.invoker);
                    expect(this.player1).not.toBeAbleToSelect(this.tadaka);
                    expect(this.player1).toBeAbleToSelect(this.toshimoko);
                    this.player1.clickCard(this.toshimoko);
                    expect(this.toshimoko.isHonored).toBe(true);
                });

                it('should work on characters entering play without fate', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.toshimoko],
                        defenders: [],
                        type: 'military'
                    });
                    this.player2.clickCard(this.charge);
                    this.player2.clickCard(this.general);
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    expect(this.player1).toBeAbleToSelect(this.general);
                    this.player1.pass();
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });

                it('should not work on characters entering play with fate', function () {
                    this.uji.honor();
                    this.noMoreActions();
                    this.initiateConflict({
                        attackers: [this.toshimoko],
                        defenders: [],
                        type: 'military'
                    });
                    this.player2.clickCard(this.general);
                    this.player2.clickPrompt('1');
                    this.player2.clickPrompt('Conflict');
                    expect(this.player2).toHavePrompt('Triggered Abilities');
                    expect(this.player2).toBeAbleToSelect(this.general);
                    this.player2.pass();
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });
            });

            /*
                Ujina - Should trigger.  I should not get to choose the target.
            */
            describe('Forced Abilities', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['isawa-ujina']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.ujina = this.player2.findCardByName('isawa-ujina');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('should not let you pick targets for forced abilities (they are triggered by the game)', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.ujina],
                        ring: 'void'
                    });
                    this.noMoreActions();
                    expect(this.player2).toHavePrompt('Isawa Ujina');
                    expect(this.player2).toBeAbleToSelect(this.ujina);
                    expect(this.player2).toBeAbleToSelect(this.toshimoko);
                    this.player2.clickCard(this.ujina);
                    expect(this.getChatLogs(5)).toContain(
                        'player2 uses Isawa Ujina to remove Isawa Ujina from the game'
                    );
                });
            });

            describe('Auras', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['lion-s-pride-brawler', 'honored-general']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.brawler = this.player2.findCardByName('lion-s-pride-brawler');
                    this.general = this.player2.findCardByName('honored-general');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Auras should not fall off because control never actually switches', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brawler, this.general],
                        defenders: [this.toshimoko]
                    });
                    this.player1.clickCard(this.brawler);
                    expect(this.player1).toBeAbleToSelect(this.brawler);
                    expect(this.player1).toBeAbleToSelect(this.toshimoko);
                    this.player1.clickCard(this.toshimoko);
                    expect(this.toshimoko.bowed).toBe(true);
                });
            });

            /*
                Cards that refer to "your" game state as a triggering condition should use your game state, not their controllers
                =============
                Mitsu2 - should check the number of cards I've played, not my opponent
                Agetoki - should check your honor total
                Kageyu - should check the number of cards my opponent has played, not myself
                Pious Guardian - should check my provinces, not my opponents
            */
            describe('Game State Interactions', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: [
                                'the-skin-of-fu-leng',
                                'a-new-name',
                                'a-new-name',
                                'a-new-name',
                                'a-new-name',
                                'a-new-name'
                            ]
                        },
                        player2: {
                            inPlay: ['pious-guardian', 'togashi-mitsu-2', 'daidoji-kageyu', 'matsu-agetoki'],
                            hand: [
                                'a-new-name',
                                'a-new-name',
                                'a-new-name',
                                'a-new-name',
                                'a-new-name',
                                'way-of-the-scorpion'
                            ]
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.mitsu = this.player2.findCardByName('togashi-mitsu-2');
                    this.guardian = this.player2.findCardByName('pious-guardian');
                    this.kageyu = this.player2.findCardByName('daidoji-kageyu');
                    this.agetoki = this.player2.findCardByName('matsu-agetoki');
                    this.scorpion = this.player2.findCardByName('way-of-the-scorpion');

                    this.sd1 = this.player1.findCardByName('shameful-display', 'province 1');
                    this.sd2 = this.player1.findCardByName('shameful-display', 'province 2');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                });

                it('Mitsu2 - should care how many cards you have played', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.mitsu],
                        ring: 'void'
                    });

                    for(let i = 0; i < 5; i++) {
                        this.player2.playAttachment(this.player2.filterCardsByName('a-new-name')[i], this.mitsu);
                        this.player1.pass();
                    }

                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.clickCard(this.mitsu);
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.clickCard(this.scorpion);
                    this.player2.clickCard(this.toshimoko);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.mitsu);
                    expect(this.player1).toHavePrompt('Conflict Action Window');

                    for(let i = 0; i < 5; i++) {
                        this.player1.playAttachment(this.player1.filterCardsByName('a-new-name')[i], this.toshimoko);
                        this.player2.pass();
                    }

                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.mitsu);
                    expect(this.player1).toHavePrompt('Choose a ring effect to resolve');
                });

                it('Agetoki - should care how your honor', function () {
                    this.player1.honor = 15;
                    this.player2.honor = 10;

                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.agetoki],
                        defenders: [this.toshimoko],
                        ring: 'void'
                    });

                    this.player1.clickCard(this.agetoki);
                    expect(this.player1).toHavePrompt('Choose a province');
                    expect(this.player1).toBeAbleToSelect(this.sd2);
                    this.player1.clickCard(this.sd2);
                    expect(this.sd2.inConflict).toBe(true);
                });

                it('Kageyu - should care how many cards my opponent has plays', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'political',
                        attackers: [this.toshimoko],
                        defenders: [this.kageyu],
                        ring: 'void'
                    });

                    for(let i = 0; i < 5; i++) {
                        this.player2.playAttachment(this.player2.filterCardsByName('a-new-name')[i], this.kageyu);
                        if(i === 0) {
                            this.player1.playAttachment(
                                this.player1.filterCardsByName('a-new-name')[1],
                                this.toshimoko
                            );
                        } else if(i !== 4) {
                            this.player1.pass();
                        }
                    }

                    let hand = this.player1.hand.length;
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.kageyu);
                    expect(this.player1.hand.length).toBe(hand + 5);
                    expect(this.getChatLogs(5)).toContain('player1 uses Daidoji Kageyu to draw 5 cards');
                });

                it('Pious Guardian - should care how many of my provinces are broken (testing no trigger)', function () {
                    this.sd1.isBroken = true;
                    this.sd2.isBroken = true;

                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.player2.passConflict();
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.player2.passConflict();
                    this.noMoreActions();

                    this.player2.clickPrompt('Political');
                    expect(this.player1).not.toHavePrompt('Triggered Abilities');
                    expect(this.player2).not.toHavePrompt('Triggered Abilities');
                });

                it('Pious Guardian - should care how many of my provinces are broken (testing trigger)', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.player2.passConflict();
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.player2.passConflict();
                    this.noMoreActions();

                    let honor = this.player1.honor;

                    this.player2.clickPrompt('Political');
                    expect(this.player1).toHavePrompt('Triggered Abilities');
                    expect(this.player1).toBeAbleToSelect(this.guardian);
                    this.player1.clickCard(this.guardian);
                    expect(this.player1.honor).toBe(honor + 1);
                });
            });

            /*
                Gained abilities.
            */
            describe('Gained Abilities', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['matsu-agetoki'],
                            hand: ['tactical-ingenuity']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.agetoki = this.player2.findCardByName('matsu-agetoki');
                    this.ti = this.player2.findCardByName('tactical-ingenuity');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                    this.player2.playAttachment(this.ti, this.agetoki);
                });

                it('should let you trigger gained abilities', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.agetoki]
                    });
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.clickCard(this.agetoki);
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.pass();
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.agetoki);
                    expect(this.player1).toHavePrompt('Select a card to reveal');
                    this.player1.clickPrompt('Supernatural Storm (4)');
                    expect(this.getChatLogs(5)).toContain(
                        'player1 uses Matsu Agetoki\'s gained ability from Tactical Ingenuity to look at the top four cards of their deck'
                    );
                });
            });

            /*
                Duels.
            */
            describe('Duels', function () {
                /*
                    Normal targeting - I should be able to choose a character my opponent controls that is not Raitsugu
                */
                describe('Raitsugu', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng']
                            },
                            player2: {
                                inPlay: ['mirumoto-raitsugu', 'ancient-master']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
                        this.master = this.player2.findCardByName('ancient-master');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                    });

                    it('basic duel targeting', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        expect(this.player1).not.toBeAbleToSelect(this.raitsugu);
                        expect(this.player1).toBeAbleToSelect(this.master);
                        expect(this.player1).not.toBeAbleToSelect(this.toshimoko);
                    });

                    it('duel resolution - adding bids', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        this.player1.clickCard(this.master);

                        this.player1.clickPrompt('4');
                        this.player2.clickPrompt('2');
                        expect(this.getChatLogs(10)).toContain('Mirumoto Raitsugu: 7 vs 3: Ancient Master');
                    });
                });

                /*
                    Kaezin targeting - My opponent should choose a character they control that is not Kaezin.
                    Duel - my bid should apply to Kaezin, my opponent's should apply to their character
                    Duel resolution - if I win should move everyone except the two characters.  If they win should move Kaezin home.
                */
                describe('Kaezin', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng']
                            },
                            player2: {
                                inPlay: ['kakita-kaezin', 'ancient-master']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.kaezin = this.player2.findCardByName('kakita-kaezin');
                        this.master = this.player2.findCardByName('ancient-master');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                    });

                    it('opponent chooses duel targeting', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.kaezin, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.kaezin);
                        expect(this.player2).not.toBeAbleToSelect(this.kaezin);
                        expect(this.player2).toBeAbleToSelect(this.master);
                        expect(this.player2).not.toBeAbleToSelect(this.toshimoko);
                    });

                    it('duel resolution - adding bids', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.kaezin, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.kaezin);
                        this.player2.clickCard(this.master);

                        this.player1.clickPrompt('4');
                        this.player2.clickPrompt('2');
                        expect(this.getChatLogs(10)).toContain('Kakita Kaezin: 7 vs 3: Ancient Master');
                        expect(this.game.currentConflict.attackers).not.toContain(this.toshimoko);
                        expect(this.getChatLogs(5)).toContain('Duel Effect: send Kakita Toshimoko home');
                    });
                });

                /*
                    Kyuden Kakita - opponent\'s should trigger and let them choose either character.  Mine should not
                */
                describe('Kyuden Kakita', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng'],
                                stronghold: ['kyuden-kakita']
                            },
                            player2: {
                                inPlay: ['mirumoto-raitsugu', 'ancient-master'],
                                stronghold: ['kyuden-kakita']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
                        this.master = this.player2.findCardByName('ancient-master');
                        this.kk = this.player1.findCardByName('kyuden-kakita');
                        this.kk2 = this.player2.findCardByName('kyuden-kakita');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                    });

                    it('duel resolution - Kyuden Kakita', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        this.player1.clickCard(this.master);

                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('3');
                        expect(this.getChatLogs(10)).toContain('Mirumoto Raitsugu: 4 vs 4: Ancient Master');
                        expect(this.player1).not.toHavePrompt('Triggered Abilities');
                        expect(this.player2).toHavePrompt('Triggered Abilities');
                        expect(this.player2).toBeAbleToSelect(this.kk2);
                        this.player2.clickCard(this.kk2);
                        expect(this.player2).toBeAbleToSelect(this.raitsugu);
                        expect(this.player2).toBeAbleToSelect(this.master);

                        this.player2.clickCard(this.raitsugu);
                        expect(this.raitsugu.isHonored).toBe(true);
                        expect(this.player2).toHavePrompt('Conflict Action Window');
                    });
                });

                /*
                    Yakamo with Duelist Training - Should use opponent's honor to determine the "cannot lose a duel"
                */
                describe('Hida Yakamo', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng']
                            },
                            player2: {
                                inPlay: ['hida-yakamo', 'daidoji-uji'],
                                hand: ['duelist-training']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.yakamo = this.player2.findCardByName('hida-yakamo');
                        this.uji = this.player2.findCardByName('daidoji-uji');
                        this.duelist = this.player2.findCardByName('duelist-training');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                        this.player2.playAttachment(this.duelist, this.yakamo);
                    });

                    it('Yakamo Should use opponent\'s honor to determine "cannot lose a duel"', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.yakamo, this.uji]
                        });
                        this.player1.honor = 20;
                        this.player2.honor = 10;

                        this.player2.pass();
                        this.player1.clickCard(this.yakamo);
                        this.player1.clickCard(this.uji);

                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('1');
                        expect(this.getChatLogs(10)).toContain('Hida Yakamo: 5 vs 7: Daidoji Uji');
                        expect(this.getChatLogs(10)).toContain('The duel has no effect');
                        expect(this.yakamo.bowed).toBe(false);
                    });

                    it('Yakamo Should use opponent\'s honor to determine "cannot lose a duel"', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.yakamo, this.uji]
                        });
                        this.player1.honor = 10;
                        this.player2.honor = 20;

                        this.player2.pass();
                        this.player1.clickCard(this.yakamo);
                        this.player1.clickCard(this.uji);

                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('1');
                        expect(this.getChatLogs(10)).toContain('Hida Yakamo: 5 vs 7: Daidoji Uji');
                        expect(this.getChatLogs(10)).toContain('Duel Effect: bow Hida Yakamo');
                        expect(this.yakamo.bowed).toBe(true);
                    });
                });

                /*
                    Distinguished Dojo - After you win a duel, should not trigger if your character wins but it was your opponents duelist
                */
                describe('Distinguished Dojo', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng']
                            },
                            player2: {
                                inPlay: ['mirumoto-raitsugu', 'ancient-master'],
                                dynastyDiscard: ['distinguished-dojo']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
                        this.master = this.player2.findCardByName('ancient-master');
                        this.dojo = this.player2.placeCardInProvince('distinguished-dojo', 'province 1');
                        this.dojo.facedown = false;
                        this.player1.playAttachment(this.skin, this.toshimoko);
                    });

                    it('should not react if "my character" wins the duel', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        this.player1.clickCard(this.master);

                        this.player1.clickPrompt('4');
                        this.player2.clickPrompt('2');
                        expect(this.getChatLogs(10)).toContain('Mirumoto Raitsugu: 7 vs 3: Ancient Master');
                        expect(this.player2).toHavePrompt('Conflict Action Window');
                    });

                    it('should not react if "my character" loses the duel', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        this.player1.clickCard(this.master);

                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('5');
                        expect(this.getChatLogs(10)).toContain('Mirumoto Raitsugu: 4 vs 6: Ancient Master');
                        expect(this.player2).toHavePrompt('Triggered Abilities');
                        expect(this.player2).toBeAbleToSelect(this.dojo);
                        this.player2.clickCard(this.dojo);
                        expect(this.player2).toHavePrompt('Sacrifice Distinguished Dōjō?');
                    });
                });

                /*
                    Cunning Negotiator - Should always let opponent resolve the province (they always control the winner of the duel)
                */
                describe('Cunning Negotiator', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng']
                            },
                            player2: {
                                inPlay: ['cunning-negotiator', 'kakita-yoshi']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.negotiator = this.player2.findCardByName('cunning-negotiator');
                        this.yoshi = this.player2.findCardByName('kakita-yoshi');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                    });

                    it('should allow the "controller of the winning character" to trigger the province', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.negotiator, this.yoshi]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.negotiator);
                        this.player2.clickCard(this.yoshi);

                        this.player1.clickPrompt('5');
                        this.player2.clickPrompt('1');
                        expect(this.player2).toHavePrompt('Do you want to trigger a province ability?');
                    });

                    it('should allow the "controller of the winning character" to trigger the province', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.negotiator, this.yoshi]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.negotiator);
                        this.player2.clickCard(this.yoshi);

                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('5');
                        expect(this.player2).toHavePrompt('Do you want to trigger a province ability?');
                    });
                });
            });

            /*
                Weird Interactions
                ==================
                Kazue2 - Should not be able to use twice (refers to "you may...." not "this character may")
                Way of the Dragon - Should not be able to use twice (refers to "you may...." not "this character may")
                Uji2 - Should put your cards under their Uji and let them play them
                Compromised Secrets - Should not allow you to trigger abilities (because you can't give yourself honor)
            */
            describe('Weird Interactions', function () {
                describe('Kazue 2', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng'],
                                dynastyDiscard: ['togashi-kazue-2']
                            },
                            player2: {
                                inPlay: ['mirumoto-raitsugu', 'ancient-master', 'isawa-ujina'],
                                dynastyDiscard: ['togashi-kazue-2']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
                        this.kazueP1 = this.player1.findCardByName('togashi-kazue-2');
                        this.kazueP2 = this.player2.findCardByName('togashi-kazue-2');
                        this.master = this.player2.findCardByName('ancient-master');
                        this.ujina = this.player2.findCardByName('isawa-ujina');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                    });

                    it('should not let you trigger characters twice if your opponent has kazue', function () {
                        this.player2.moveCard(this.kazueP2, 'play area');
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.ujina, this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        this.player1.clickCard(this.ujina);
                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('1');
                        expect(this.ujina.location).toBe('dynasty discard pile');
                        this.player2.pass();
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                        this.player1.clickCard(this.raitsugu);
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                    });

                    it('should not let you trigger characters twice if you have kazue', function () {
                        this.player1.moveCard(this.kazueP1, 'play area');
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.ujina, this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        this.player1.clickCard(this.ujina);
                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('1');
                        expect(this.ujina.location).toBe('dynasty discard pile');
                        this.player2.pass();
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                        this.player1.clickCard(this.raitsugu);
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                    });
                });

                describe('Way of the Dragon', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng']
                            },
                            player2: {
                                inPlay: ['mirumoto-raitsugu', 'ancient-master', 'isawa-ujina'],
                                hand: ['way-of-the-dragon']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
                        this.master = this.player2.findCardByName('ancient-master');
                        this.ujina = this.player2.findCardByName('isawa-ujina');
                        this.dragon = this.player2.findCardByName('way-of-the-dragon');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                        this.player2.playAttachment(this.dragon, this.raitsugu);
                    });

                    it('should not let you trigger characters twice if your opponent has way of the dragon', function () {
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.ujina, this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        this.player1.clickCard(this.raitsugu);
                        this.player1.clickCard(this.ujina);
                        this.player1.clickPrompt('1');
                        this.player2.clickPrompt('1');
                        expect(this.ujina.location).toBe('dynasty discard pile');
                        this.player2.pass();
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                        this.player1.clickCard(this.raitsugu);
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                    });
                });

                describe('Uji2', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng'],
                                conflictDiscard: ['a-new-name', 'fine-katana', 'ornate-fan', 'seal-of-the-crane']
                            },
                            player2: {
                                hand: ['charge', 'way-of-the-crane'],
                                dynastyDiscard: ['daidoji-uji-2']
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.uji = this.player2.placeCardInProvince('daidoji-uji-2', 'province 1');
                        this.charge = this.player2.findCardByName('charge');
                        this.crane = this.player2.findCardByName('way-of-the-crane');

                        this.ann = this.player1.findCardByName('a-new-name');
                        this.katana = this.player1.findCardByName('fine-katana');
                        this.fan = this.player1.findCardByName('ornate-fan');
                        this.seal = this.player1.findCardByName('seal-of-the-crane');

                        this.player1.playAttachment(this.skin, this.toshimoko);

                        this.player1.moveCard(this.ann, 'conflict deck');
                        this.player1.moveCard(this.katana, 'conflict deck');
                        this.player1.moveCard(this.fan, 'conflict deck');
                        this.player1.moveCard(this.seal, 'conflict deck');

                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: []
                        });
                        this.player2.clickCard(this.charge);
                        this.player2.clickCard(this.uji);
                    });

                    it('should let you pick cards from your deck', function () {
                        expect(this.player1).toHavePrompt('Triggered Abilities');
                        expect(this.player1).toBeAbleToSelect(this.uji);
                        this.player1.clickCard(this.uji);
                        expect(this.player1).toHavePromptButton('Fine Katana');
                    });

                    it('should put the cards under Uji', function () {
                        this.player1.clickCard(this.uji);
                        this.player1.clickPrompt('Fine Katana');
                        this.player1.clickPrompt('A New Name');
                        this.player1.clickPrompt('Ornate Fan');
                        this.player1.clickPrompt('Seal of the Crane');

                        expect(this.katana.location).toBe(this.uji.uuid);
                        expect(this.ann.location).toBe(this.uji.uuid);
                        expect(this.fan.location).toBe(this.uji.uuid);
                        expect(this.seal.location).toBe(this.uji.uuid);

                        expect(this.getChatLogs(5)).toContain('player1 uses Daidoji Uji to search their deck');
                        expect(this.getChatLogs(5)).toContain('player1 selects 4 cards');
                        expect(this.getChatLogs(5)).toContain('player1 is shuffling their conflict deck');
                    });

                    it('cards should be hidden to player1 and not player2', function () {
                        this.player1.clickCard(this.uji);
                        this.player1.clickPrompt('Fine Katana');
                        this.player1.clickPrompt('A New Name');
                        this.player1.clickPrompt('Ornate Fan');
                        this.player1.clickPrompt('Seal of the Crane');

                        expect(this.katana.anyEffect('hideWhenFaceUp')).toBe(true);
                        expect(this.ann.anyEffect('hideWhenFaceUp')).toBe(true);
                        expect(this.fan.anyEffect('hideWhenFaceUp')).toBe(true);
                        expect(this.seal.anyEffect('hideWhenFaceUp')).toBe(true);
                    });

                    it('cards should be playable by player2', function () {
                        this.player1.clickCard(this.uji);
                        this.player1.clickPrompt('Fine Katana');
                        this.player1.clickPrompt('A New Name');
                        this.player1.clickPrompt('Ornate Fan');
                        this.player1.clickPrompt('Seal of the Crane');

                        this.player1.pass();
                        this.player2.clickCard(this.crane);
                        this.player2.clickCard(this.uji);
                        this.player1.pass();

                        this.player2.clickCard(this.katana);
                        this.player2.clickCard(this.uji);
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                        expect(this.uji.attachments).toContain(this.katana);
                    });

                    it('cards should not be playable by player1', function () {
                        this.player1.clickCard(this.uji);
                        this.player1.clickPrompt('Fine Katana');
                        this.player1.clickPrompt('A New Name');
                        this.player1.clickPrompt('Ornate Fan');
                        this.player1.clickPrompt('Seal of the Crane');

                        this.player1.pass();
                        this.player2.clickCard(this.crane);
                        this.player2.clickCard(this.uji);
                        this.player1.clickCard(this.katana);
                        this.player1.clickCard(this.uji);
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                        expect(this.uji.attachments).not.toContain(this.katana);
                    });
                });

                describe('Compromised Secrets', function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                inPlay: ['kakita-toshimoko'],
                                hand: ['the-skin-of-fu-leng', 'compromised-secrets'],
                                honor: 10
                            },
                            player2: {
                                inPlay: ['mirumoto-raitsugu', 'ancient-master'],
                                hand: ['compromised-secrets'],
                                honor: 15
                            }
                        });

                        this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                        this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                        this.raitsugu = this.player2.findCardByName('mirumoto-raitsugu');
                        this.master = this.player2.findCardByName('ancient-master');
                        this.secrets = this.player1.findCardByName('compromised-secrets');
                        this.secrets2 = this.player2.findCardByName('compromised-secrets');
                        this.player1.playAttachment(this.skin, this.toshimoko);
                    });

                    it('should not let you trigger characters when you control Compromised Secrets because you can\'t force your opponent to give you an honor', function () {
                        this.player2.pass();
                        this.player1.playAttachment(this.secrets, this.raitsugu);
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                        this.player1.clickCard(this.raitsugu);
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                    });

                    it('should not let you trigger characters when your opponent controls Compromised Secrets', function () {
                        this.player1.honor = 15;
                        this.player2.honor = 10;
                        this.game.checkGameState(true);
                        this.player2.playAttachment(this.secrets2, this.raitsugu);
                        this.noMoreActions();
                        this.initiateConflict({
                            type: 'military',
                            attackers: [this.toshimoko],
                            defenders: [this.raitsugu, this.master]
                        });
                        this.player2.pass();
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                        this.player1.clickCard(this.raitsugu);
                        expect(this.player1).toHavePrompt('Conflict Action Window');
                    });
                });
            });
        });

        describe('Double Skin - no one should be able to trigger at 0 fate', function () {
            describe('Actions', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['lion-s-pride-brawler', 'honored-general', 'akodo-toturi'],
                            hand: ['the-skin-of-fu-leng']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.toturi = this.player2.findCardByName('akodo-toturi');
                    this.skin2 = this.player2.findCardByName('the-skin-of-fu-leng');
                    this.brawler = this.player2.findCardByName('lion-s-pride-brawler');
                    this.general = this.player2.findCardByName('honored-general');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                    this.player2.playAttachment(this.skin2, this.toturi);
                });

                it('Should not be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.brawler, this.general],
                        defenders: [this.toshimoko]
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.brawler);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.pass();
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    this.player2.clickCard(this.brawler);
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                });
            });

            describe('Reactions', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng', 'way-of-the-scorpion']
                        },
                        player2: {
                            inPlay: ['ardent-omoidasu', 'akodo-toturi'],
                            hand: ['way-of-the-scorpion', 'the-skin-of-fu-leng']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.toturi = this.player2.findCardByName('akodo-toturi');
                    this.skin2 = this.player2.findCardByName('the-skin-of-fu-leng');
                    this.ardent = this.player2.findCardByName('ardent-omoidasu');
                    this.scorp1 = this.player1.findCardByName('way-of-the-scorpion');
                    this.scorp2 = this.player2.findCardByName('way-of-the-scorpion');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                    this.player2.playAttachment(this.skin2, this.toturi);
                });

                it('Should not be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.ardent]
                    });
                    this.player2.clickCard(this.scorp2);
                    this.player2.clickCard(this.toshimoko);
                    expect(this.toshimoko.isDishonored).toBe(true);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.scorp1);
                    this.player1.clickCard(this.ardent);
                    expect(this.player2).toHavePrompt('Conflict Action Window');
                    expect(this.ardent.isDishonored).toBe(true);
                });
            });

            describe('Interrupts', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            inPlay: ['kakita-toshimoko'],
                            hand: ['the-skin-of-fu-leng']
                        },
                        player2: {
                            inPlay: ['callow-delegate', 'doji-whisperer', 'akodo-toturi'],
                            hand: ['assassination', 'the-skin-of-fu-leng']
                        }
                    });

                    this.toshimoko = this.player1.findCardByName('kakita-toshimoko');
                    this.skin = this.player1.findCardByName('the-skin-of-fu-leng');
                    this.toturi = this.player2.findCardByName('akodo-toturi');
                    this.skin2 = this.player2.findCardByName('the-skin-of-fu-leng');
                    this.callow = this.player2.findCardByName('callow-delegate');
                    this.whisperer = this.player2.findCardByName('doji-whisperer');
                    this.assassination = this.player2.findCardByName('assassination');
                    this.player1.playAttachment(this.skin, this.toshimoko);
                    this.player2.playAttachment(this.skin2, this.toturi);
                });

                it('Should not be able to trigger characters with no fate', function () {
                    this.noMoreActions();
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.toshimoko],
                        defenders: [this.callow]
                    });
                    this.player2.clickCard(this.assassination);
                    this.player2.clickCard(this.callow);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });
            });
        });
    });
});
