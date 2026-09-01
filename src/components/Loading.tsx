import { Center, Stack, Loader, Text } from "@mantine/core";
// TODO: Maybe move to a file?
const loading_texts = [
    "Loading questionable life choices...",
    "Searching couch cushions for loose change...",
    "Convincing the cat to move...",
    "Warming up the hamster wheel...",
    "Untangling headphone wires...",
    "Pretending to look busy...",
    "Blaming it on lag...",
    "Counting to a million...",
    "Consulting a magic eight ball...",
    "Rethinking all life decisions...",
    "Stretching fingers for typing...",
    "Practicing a poker face...",
    "Looking for where I left my keys...",
    "Waiting for the microwave to beep...",
    "Dodging adult responsibilities...",
    "Staring blankly into space...",
    "Searching for a cool catchphrase...",
    "Negotiating with chaos...",
    "Practicing slow motion walking...",
    "Chasing a rogue thought...",
    "Forgetting what I was doing...",
    "Staring at the refrigerator hoping new food appears...",
    "Practicing winning arguments in the shower...",
    "Wondering if penguins have knees...",
    "Trying to remember a song lyric...",
    "Shaking the vending machine...",
    "Checking if the light actually turns off in the fridge...",
    "Avoiding eye contact with strangers...",
    "Practicing my signature for when I'm famous...",
    "Wondering what time it is...",
    "Losing a game of rock, paper, scissors against myself...",
    "Trying to plug in a USB drive the wrong way three times...",
    "Listening to elevator music...",
    "Forgetting a password and clicking reset...",
    "Pretending to understand what's happening...",
    "Scrolling through menus endlessly...",
    "Waiting for inspiration to strike...",
    "Pacing around the room for no reason...",
    "Wondering if left shark was right...",
    "Trying to balance a spoon on my nose...",
    "Searching for the TV remote that is in my hand...",
    "Taking a deep breath and regretting it...",
    "Contemplating the meaning of snack time...",
    "Trying to fold a fitted sheet...",
    "Staring at a loading screen...",
    "Wondering where all the time went...",
    "Practicing my evil laugh in the mirror...",
    "Checking if my shoe is untied...",
    "Staring at the ceiling tiles...",
    "Waiting for something interesting to happen...",
  ];

export default function Loading({ isLoading }) {
  if (isLoading) {
      return (
        <Center id="loading-box" className="loading-container">
          <Stack align="center" gap="sm">
            <Loader size="lg" />
            <Text size="sm">
              {loading_texts[Math.floor(Math.random() * loading_texts.length)]}
            </Text>
          </Stack>
        </Center>
      );
  }
  return null;
}
