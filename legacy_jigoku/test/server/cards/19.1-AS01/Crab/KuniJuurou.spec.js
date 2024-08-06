describe('Kuni Juurou', function () {
    integration(function () {
        describe('Static ability - no honor costs', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kuni-juurou', 'kaiu-envoy', 'exiled-guardian'],
                        hand: ['assassination', 'obsidian-talisman', 'banzai'],
                        dynastyDeck: ['fire-and-oil']
                    },
                    player2: {
                        inPlay: ['bayushi-manipulator'],
                        hand: ['backhanded-compliment', 'way-of-the-scorpion', 'assassination']
                    }
                });

                this.kuniAina = this.player1.findCardByName('kuni-juurou');
                this.envoy = this.player1.findCardByName('kaiu-envoy');
                this.exiledGuardian = this.player1.findCardByName('exiled-guardian');
                this.assassinationCrab = this.player1.findCardByName('assassination');
                this.banzai = this.player1.findCardByName('banzai');
                this.obsidianTalisman = this.player1.findCardByName('obsidian-talisman');
                this.fireAndOil = this.player1.findCardByName('fire-and-oil');
                this.province1 = this.player1.findCardByName('shameful-display', 'province 1');

                this.manipulator = this.player2.findCardByName('bayushi-manipulator');
                this.bhc = this.player2.findCardByName('backhanded-compliment');
                this.assassinationScorp = this.player2.findCardByName('assassination');
                this.wayOfTheScorpion = this.player2.findCardByName('way-of-the-scorpion');
            });

            it('Loses honor normally due to effects', function () {
                let player1StartingHonor = this.player1.honor;
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kuniAina, this.envoy],
                    defenders: []
                });

                this.player2.clickCard(this.wayOfTheScorpion);
                this.player2.clickCard(this.envoy);

                this.player1.pass();

                this.player2.clickCard(this.assassinationScorp);
                this.player2.clickCard(this.envoy);

                expect(this.player1.honor).toBe(player1StartingHonor - 1);

                this.player1.pass();

                this.player2.clickCard(this.bhc);
                this.player2.clickPrompt('player1');
                expect(this.player1.honor).toBe(player1StartingHonor - 2);
            });

            it('cannot play events that cost honor', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kuniAina, this.envoy],
                    defenders: []
                });

                this.player2.pass();

                expect(this.player1).toHavePrompt('Conflict Action Window');

                this.player1.clickCard(this.assassinationCrab);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('cannot trigger holdings that cost honor', function () {
                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');
                this.noMoreActions();

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.manipulator],
                    defenders: []
                });

                this.player1.clickCard(this.fireAndOil);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('cannot pay additional honor costs imposed by opponent', function () {
                this.noMoreActions();
                this.player1.clickPrompt('Pass Conflict');
                this.player1.clickPrompt('Yes');
                this.noMoreActions();

                this.initiateConflict({
                    type: 'military',
                    attackers: [this.manipulator],
                    defenders: []
                });

                this.player1.clickCard(this.fireAndOil);
                expect(this.player1).toHavePrompt('Conflict Action Window');
            });

            it('cannot declare tainted characters into conflicts', function () {
                this.exiledGuardian.taint();
                this.noMoreActions();

                this.player1.clickCard(this.player2.provinces['province 1'].provinceCard);
                this.player1.clickRing('fire');
                this.player1.clickCard(this.exiledGuardian);
                expect(this.player1).not.toHavePromptButton('Initiate Conflict');
                this.player1.clickCard(this.envoy);
                expect(this.player1).toHavePromptButton('Initiate Conflict');
                this.player1.clickPrompt('Initiate Conflict');

                expect(this.getChatLogs(5)).toContain('player1 has initiated a military conflict with skill 1');
            });
        });

        describe('Static ability - skill penalty', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: [
                            'kuni-juurou',
                            'unleashed-experiment',
                            'jealous-ancestor',
                            'kaiu-envoy',
                            'borderlands-defender'
                        ],
                        hand: ['lurking-affliction']
                    },
                    player2: {
                        inPlay: ['unleashed-experiment', 'jealous-ancestor', 'kaiu-envoy', 'borderlands-defender'],
                        hand: ['lurking-affliction']
                    }
                });

                this.kuniAina = this.player1.findCardByName('kuni-juurou');
                this.experimentP1 = this.player1.findCardByName('unleashed-experiment');
                this.jealousP1 = this.player1.findCardByName('jealous-ancestor');
                this.envoyP1 = this.player1.findCardByName('kaiu-envoy');
                this.borderlandsP1 = this.player1.findCardByName('borderlands-defender');
                this.afflictionP1 = this.player1.findCardByName('lurking-affliction');

                this.experimentP2 = this.player2.findCardByName('unleashed-experiment');
                this.jealousP2 = this.player2.findCardByName('jealous-ancestor');
                this.envoyP2 = this.player2.findCardByName('kaiu-envoy');
                this.borderlandsP2 = this.player2.findCardByName('borderlands-defender');
                this.afflictionP2 = this.player2.findCardByName('lurking-affliction');
            });

            it('When Juurou is in the conflict, it gives skill penalty to shadowlands', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.kuniAina, this.experimentP1, this.jealousP1, this.envoyP1, this.borderlandsP1],
                    defenders: [this.experimentP2, this.jealousP2, this.envoyP2, this.borderlandsP2]
                });

                this.player2.clickCard(this.afflictionP2);
                this.player2.clickCard(this.envoyP2);

                this.player1.clickCard(this.afflictionP1);
                this.player1.clickCard(this.envoyP1);

                expect(this.experimentP1.getMilitarySkill()).toBe(2);
                expect(this.experimentP1.getPoliticalSkill()).toBe(1);
                expect(this.experimentP2.getMilitarySkill()).toBe(2);
                expect(this.experimentP2.getPoliticalSkill()).toBe(1);

                expect(this.jealousP1.getMilitarySkill()).toBe(0);
                expect(this.jealousP1.getPoliticalSkill()).toBe(0);
                expect(this.jealousP2.getMilitarySkill()).toBe(0);
                expect(this.jealousP2.getPoliticalSkill()).toBe(0);

                expect(this.envoyP1.getMilitarySkill()).toBe(1);
                expect(this.envoyP1.getPoliticalSkill()).toBe(0);
                expect(this.envoyP2.getMilitarySkill()).toBe(1);
                expect(this.envoyP2.getPoliticalSkill()).toBe(0);

                expect(this.borderlandsP1.getMilitarySkill()).toBe(3);
                expect(this.borderlandsP1.getPoliticalSkill()).toBe(3);
                expect(this.borderlandsP2.getMilitarySkill()).toBe(3);
                expect(this.borderlandsP2.getPoliticalSkill()).toBe(3);
            });

            it('When Juurou is not in the conflict, it gives skill penalty to shadowlands', function () {
                this.noMoreActions();
                this.initiateConflict({
                    type: 'military',
                    attackers: [this.experimentP1, this.jealousP1, this.envoyP1, this.borderlandsP1],
                    defenders: [this.experimentP2, this.jealousP2, this.envoyP2, this.borderlandsP2]
                });

                this.player2.clickCard(this.afflictionP2);
                this.player2.clickCard(this.envoyP2);

                this.player1.clickCard(this.afflictionP1);
                this.player1.clickCard(this.envoyP1);

                expect(this.experimentP1.getMilitarySkill()).toBe(2);
                expect(this.experimentP1.getPoliticalSkill()).toBe(1);
                expect(this.experimentP2.getMilitarySkill()).toBe(2);
                expect(this.experimentP2.getPoliticalSkill()).toBe(1);

                expect(this.jealousP1.getMilitarySkill()).toBe(0);
                expect(this.jealousP1.getPoliticalSkill()).toBe(0);
                expect(this.jealousP2.getMilitarySkill()).toBe(0);
                expect(this.jealousP2.getPoliticalSkill()).toBe(0);

                expect(this.envoyP1.getMilitarySkill()).toBe(1);
                expect(this.envoyP1.getPoliticalSkill()).toBe(0);
                expect(this.envoyP2.getMilitarySkill()).toBe(1);
                expect(this.envoyP2.getPoliticalSkill()).toBe(0);

                expect(this.borderlandsP1.getMilitarySkill()).toBe(3);
                expect(this.borderlandsP1.getPoliticalSkill()).toBe(3);
                expect(this.borderlandsP2.getMilitarySkill()).toBe(3);
                expect(this.borderlandsP2.getPoliticalSkill()).toBe(3);
            });
        });

        describe('Action taint ability', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'conflict',
                    player1: {
                        inPlay: ['kuni-juurou', 'kaiu-envoy'],
                        hand: ['fine-katana', 'finger-of-jade']
                    },
                    player2: {
                        inPlay: ['borderlands-defender'],
                        hand: ['ornate-fan']
                    }
                });

                this.kuniAina = this.player1.findCardByName('kuni-juurou');
                this.envoy = this.player1.findCardByName('kaiu-envoy');
                this.katana = this.player1.findCardByName('fine-katana');
                this.finger = this.player1.findCardByName('finger-of-jade');
                this.borderlands = this.player2.findCardByName('borderlands-defender');
                this.fan = this.player2.findCardByName('ornate-fan');
            });

            it('When Juurou has more cards in hand, cannot be triggered', function () {
                this.player1.clickCard(this.kuniAina);
                expect(this.player1).toHavePrompt('Initiate an action');
            });

            it('When Juurou has the same amount of cards in hand, taint a character', function () {
                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.kuniAina);

                this.player2.pass();

                this.player1.clickCard(this.kuniAina);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.kuniAina);
                expect(this.player1).toBeAbleToSelect(this.envoy);
                expect(this.player1).toBeAbleToSelect(this.borderlands);

                this.player1.clickCard(this.borderlands);
                expect(this.borderlands.isTainted).toBe(true);

                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Kuni Juurou to identify the source of Crab\'s misfortune… it is Borderlands Defender! Borderlands Defender is tainted.'
                );
            });

            it('When Juurou has fewer cards in hand, taint a character', function () {
                this.player1.clickCard(this.katana);
                this.player1.clickCard(this.kuniAina);

                this.player2.pass();

                this.player1.clickCard(this.finger);
                this.player1.clickCard(this.kuniAina);

                this.player2.pass();

                this.player1.clickCard(this.kuniAina);
                expect(this.player1).toHavePrompt('Choose a character');
                expect(this.player1).toBeAbleToSelect(this.kuniAina);
                expect(this.player1).toBeAbleToSelect(this.envoy);
                expect(this.player1).toBeAbleToSelect(this.borderlands);

                this.player1.clickCard(this.borderlands);
                expect(this.borderlands.isTainted).toBe(true);
                expect(this.getChatLogs(5)).toContain(
                    'player1 uses Kuni Juurou to identify the source of Crab\'s misfortune… it is Borderlands Defender! Borderlands Defender is tainted.'
                );
            });
        });

        describe('Action taint ability - dynasty', function () {
            beforeEach(function () {
                this.setupTest({
                    phase: 'dynasty',
                    player1: {
                        inPlay: ['kuni-juurou', 'kaiu-envoy']
                    },
                    player2: {
                        inPlay: ['borderlands-defender'],
                        hand: ['ornate-fan']
                    }
                });

                this.kuniAina = this.player1.findCardByName('kuni-juurou');
                this.envoy = this.player1.findCardByName('kaiu-envoy');
                this.borderlands = this.player2.findCardByName('borderlands-defender');
                this.fan = this.player2.findCardByName('ornate-fan');
            });

            it('When Juurou has fewer cards in hand, do not taint a character', function () {
                this.player1.clickCard(this.kuniAina);
                expect(this.player1).toHavePrompt('Play cards from provinces');
            });
        });
    });
});
