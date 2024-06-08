# 🗡️ Lost Souls

Welcome to the adventurous world of Lost Souls! In this JavaScript game, you embark on a heroic journey to cleanse a dark cave of menacing monsters, safeguarding nearby villagers. Armed only with a trusty sword, navigate perilous terrain, vanquish foes, and confront the ultimate challenge: the 🔥 Fire Demon, in an epic showdown for the realm's tranquility. Lost Souls beckons players to step into the shoes of the hero villagers desperately need.
> [!NOTE]
> Lost Souls was developed as a JavaScript game for a final project. It combines immersive gameplay with captivating artwork and audio, providing players with an engaging experience.

## 🎮 Gameplay

Play as the valiant protagonist on a mission to rid the cave of monsters and protect the villagers. Defeat enemies, navigate challenging landscapes, and prepare for the ultimate battle against the fearsome Fire Demon.

## 🌟 Credits

### Developers 🧙‍♂️

- [carsonSgit](https://github.com/carsonSgit)
- [NoahGJAC](https://github.com/NoahGJAC)

### Artwork 🎨

#### Entities

- [Player Art](https://szadiart.itch.io/2d-soulslike-character) by [Szadi art](https://szadiart.itch.io/)
- [Cave Enemies](https://luizmelo.itch.io/monsters-creatures-fantasy) by [LuizMelo](https://luizmelo.itch.io/)
- [Final Boss](https://chierit.itch.io/boss-demon-slime) by [chierit](https://chierit.itch.io/)
- [Final Boss Spawn Beam](https://ansimuz.itch.io/gothicvania-patreon-collection) by [ansimuz](https://ansimuz.itch.io/)

#### Map 🗺️

- [Village, Cave & Final Boss Arena](https://szadiart.itch.io/pixel-fantasy-caves) by [Szadi art](https://szadiart.itch.io/)
- [Village Background](https://szadiart.itch.io/background-desert-mountains) by [Szadi art](https://szadiart.itch.io/)
- [Final Boss Arena Background](https://szadiart.itch.io/pixel-platformer-world) by [Szadi art](https://szadiart.itch.io/)

### Audio 🎵

#### SFX

- [Game Sounds](https://leohpaz.itch.io/rpg-essentials-sfx-free) by [Leohpaz](https://leohpaz.itch.io/)

#### Music 🎶

- [Background Music](https://xdeviruchi.itch.io/8-bit-fantasy-adventure-music-pack) by [xDeviruchi](https://xdeviruchi.itch.io/)

### Fonts ✒️

- [Main Font](https://vrtxrry.itch.io/dungeonfont) by [vrtxrry](https://vrtxrry.itch.io/)
- [Credits Font](https://somepx.itch.io/humble-fonts-free) by [somepx](https://somepx.itch.io/)
- [Game Over & Victory Screen Font](https://ggbot.itch.io/pixeloid-font) by [GGBotNet](https://ggbot.itch.io/)

# The *boring* stuff


## 📃 Requirements 

1. The player appears on screen.
2. The player can move.
3. The player can swing their sword.
4. The player has animations.
5. The player has a valid hitbox.
6. The player has a set amount of health.
7. The village appears on screen.
8. The village tiles are collideable.
9. The village has a parallax background.
10. The village has a heal station.
11. The village's heal station heals the player.
12. The village has a path to the cave.
13. The cave appears on screen.
14. The cave tiles are collideable.
15. The cave has a parallax background.
16. The cave has entities.
17. The cave has platforms.
18. The cave entities have health.
19. The cave entities have sprites.
20. The cave entities can move.
21. The cave entities can attack.
22. The cave entities can die.
23. The cave entities have animations.
24. The cave boss can spawn.
25. The cave boss has more health than other cave entities.
26. The cave boss deals more damage than other cave entities.
27. The cave boss has unique animations.
28. The cave boss can die.
29. The player can return to the village.
    
## 🤖 State Diagram

### PlayStates

Below are the play states for the game Lost Soul

![PlayStateDiagram](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/92652800/9cf1ef54-f1e8-4da6-ad41-f573cda4bf33)

### PlayerStates

Below are the states for the main character of Lost Soul

![PlayerStateDiagram](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/92652800/b6970753-0923-4092-9220-a307f01c89d5)

### EntityStates

Below are the states for the enemy entities in Lost Soul

![EntityStateDiagram](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/92652800/d2ac2dec-92e1-4aff-ac10-db19a7fe33e3)


## 🗺️ Class Diagram

![classDiagram](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/98351050/4656d675-2cf0-4b95-ad3b-596ea16ed1d8)

## 🧵 Wireframes

### Title Screen

![titleScreen](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/92652800/6fee5f14-7b53-44fb-90f5-2fbafaa70499)

Title screen displays a Play & Credits option.

On "Play" selection, the player stands up and appears in the village (shown below).

On "Credits" selection the credits for Code & Assets will be displayed.


### In Village

![inVillage](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/92652800/c76c9bf8-370c-40e3-bb87-6d2d57afc38b)

The village is a safe-zone for the player. Music will be playing and the player can wander around without worry of enemies.

There will be a building where the player can go to heal after clearing the cave level.

### In Cave

![caveWithMonsters](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/92652800/30224805-be2d-4aab-a4d5-1f44d1817c37)

The player will have to fight off all of the enemies. Once the enemies are all dead, a new enemy will appear, initiating the Boss fight.

### Boss Fight

![bossFight](https://github.com/JAC-CS-Game-Programming-F23/project-carson-noah/assets/92652800/63594e38-5955-49e8-89ea-a97ddb393973)

The boss is a lot more powerful than a normal enemy, he also has more health. 

