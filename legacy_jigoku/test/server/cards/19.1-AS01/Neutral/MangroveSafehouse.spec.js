describe('Mangrove Safehouse', function () {
    integration(function () {
        describe('Mangrove Safehouse\'s ability', function () {
            describe('Outside of a conflict', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            dynastyDiscard: ['mangrove-safehouse'],
                            inPlay: ['adept-of-the-waves', 'kudaka']
                        },
                        player2: {
                            inPlay: ['bayushi-manipulator', 'yuta']
                        }
                    });
                    this.mangroveSafehouse = this.player1.placeCardInProvince(
                        'mangrove-safehouse',
                        'province 2'
                    );
                });

                it('should not be triggered outside of a conflict', function () {
                    this.player1.clickCard(this.mangroveSafehouse);
                    expect(this.player1).toHavePrompt('Initiate an action');
                });
            });

            describe('While defending', function () {
                beforeEach(function () {
                    this.setupTest({
                        phase: 'conflict',
                        player1: {
                            dynastyDiscard: ['mangrove-safehouse'],
                            inPlay: ['adept-of-the-waves', 'kudaka']
                        },
                        player2: {
                            inPlay: ['bayushi-manipulator', 'yuta']
                        }
                    });

                    this.adeptOfTheWaves =
                        this.player1.findCardByName('adept-of-the-waves');
                    this.kudaka = this.player1.findCardByName('kudaka');
                    this.mangroveSafehouse = this.player1.placeCardInProvince(
                        'mangrove-safehouse',
                        'province 2'
                    );

                    this.bayushiManipulator = this.player2.findCardByName(
                        'bayushi-manipulator'
                    );
                    this.yuta = this.player2.findCardByName('yuta');

                    this.noMoreActions();
                    this.player1.passConflict();
                    this.noMoreActions();
                });

                it('should not trigger on political defenses', function () {
                    this.initiateConflict({
                        type: 'political',
                        attackers: [this.bayushiManipulator, this.yuta],
                        defenders: [this.adeptOfTheWaves, this.kudaka]
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.mangroveSafehouse);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });

                it('should not trigger on military defenses', function () {
                    this.initiateConflict({
                        type: 'military',
                        attackers: [this.bayushiManipulator, this.yuta],
                        defenders: [this.adeptOfTheWaves, this.kudaka]
                    });
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                    this.player1.clickCard(this.mangroveSafehouse);
                    expect(this.player1).toHavePrompt('Conflict Action Window');
                });
            });

            ['political', 'military'].map((conflictType) => {
                describe(`While attacking ${conflictType}`, function () {
                    beforeEach(function () {
                        this.setupTest({
                            phase: 'conflict',
                            player1: {
                                dynastyDiscard: ['mangrove-safehouse'],
                                inPlay: [
                                    'adept-of-the-waves',
                                    'kudaka',
                                    'solemn-scholar'
                                ]
                            },
                            player2: {
                                inPlay: [
                                    'bayushi-manipulator',
                                    'yuta',
                                    'keeper-initiate'
                                ]
                            }
                        });

                        this.adeptOfTheWaves =
                            this.player1.findCardByName('adept-of-the-waves');
                        this.kudaka = this.player1.findCardByName('kudaka');
                        this.solemnScholar =
                            this.player1.findCardByName('solemn-scholar');
                        this.mangroveSafehouse =
                            this.player1.placeCardInProvince(
                                'mangrove-safehouse',
                                'province 2'
                            );

                        this.bayushiManipulator = this.player2.findCardByName(
                            'bayushi-manipulator'
                        );
                        this.yuta = this.player2.findCardByName('yuta');
                        this.keeperInitiate =
                            this.player2.findCardByName('keeper-initiate');

                        this.p1FateBefore = this.player1.fate;
                        this.p2FateBefore = this.player2.fate;
                        this.noMoreActions();
                        this.initiateConflict({
                            type: conflictType,
                            attackers: [this.adeptOfTheWaves, this.kudaka],
                            defenders: [this.bayushiManipulator, this.yuta]
                        });
                        this.player2.clickPrompt('Pass');

                        this.player1.clickCard(this.mangroveSafehouse);
                    });

                    it('should prompt to select a character', function () {
                        expect(this.player1).toHavePrompt('Choose a character');
                    });

                    it('should not allow target a unit you do not control', function () {
                        expect(this.player1).not.toBeAbleToSelect(
                            this.bayushiManipulator
                        );
                        expect(this.player1).not.toBeAbleToSelect(this.yuta);
                        expect(this.player1).not.toBeAbleToSelect(
                            this.keeperInitiate
                        );
                    });

                    it('should not allow target a unit at home', function () {
                        expect(this.player1).not.toBeAbleToSelect(
                            this.solemnScholar
                        );
                    });

                    describe('if a non-Mantis character is selected', function () {
                        beforeEach(function () {
                            this.player1.clickCard(this.adeptOfTheWaves);
                        });

                        it('moves the target home and steals no fate', function () {
                            expect(this.adeptOfTheWaves.inConflict).toBe(false);
                            expect(
                                this.game.currentConflict.attackers
                            ).not.toContain(this.adeptOfTheWaves);
                            expect(this.player1.fate).toBe(this.p1FateBefore);
                            expect(this.player2.fate).toBe(this.p2FateBefore);
                            expect(this.getChatLogs(3)).toContain(
                                'player1 uses Mangrove Safehouse to move Adept of the Waves home'
                            );
                        });
                    });

                    describe('if a Mantis character is selected', function () {
                        beforeEach(function () {
                            this.player1.clickCard(this.kudaka);
                        });

                        it('moves the target home and steals 1 fate', function () {
                            expect(this.kudaka.inConflict).toBe(false);
                            expect(
                                this.game.currentConflict.attackers
                            ).not.toContain(this.kudaka);
                            expect(this.player1.fate).toBe(
                                this.p1FateBefore + 1
                            );
                            expect(this.player2.fate).toBe(
                                this.p2FateBefore - 1
                            );
                            expect(this.getChatLogs(3)).toContain(
                                'player1 uses Mangrove Safehouse to move Kudaka home and steal 1 fate'
                            );
                        });
                    });
                });
            });
        });
    });
});
