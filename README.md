# Cool internet of thangs gallery 

## Abstract
For some people, visiting a museum can be a boring experience. To help these users connect with art and find joy in it, we created smArt.

smArt is an interactive art exhibition that encourages the user to take part in the art creation process through the use of AI. The exhibition lets users create personalized pictures in different art styles.

## Insight and methods
Through interviews, a visit to Vitensenteret Innlandet, desk research, and workshops we found that people want a fun, easy and interactive way to experience and learn about art. Further work included iterative prototyping, user tests, a Nielsen’s heuristic evaluation, analysis of navigation options and competitor research to create a user friendly and intuitive product. 

## Sensors and display
To create their art, the user interacts with a touch controller for navigation, a web camera to capture the user essence, and a screen where they see their actions. The touch controller is wireless and connects to the system through WebSockets. The screen and camera are connected to a laptop that runs both the gallery wall and the user interface through two different pages.

## Technology composition
The sensors together with the APIs, are what make our project a Web of Things solution. The picture you take is sent via a REST API to the OpenAI API, which uses three different AI models to: describe the picture, generate the AI artwork, and create a title for the artwork. The generated artwork and its title are sent back to the client, where it is presented to the user. The user can then choose to publish the artwork to the gallery, which is managed by Express.js and a MongoDB database behind the scenes.

## Solution
smArt was created to increase interest and engagement with art. With the use of a screen, camera and touch controller, the user can explore and experience six different art styles through our interactive solution. smArt displays art in a way that fosters active engagement, and transforms the visitor into their own artwork.

Once the AI has produced your art, you can add it to our gallery wall, where other visitors can enjoy the generated artworks. smArt offers a fun, accessible, and captivating way to solve a lack of art experiences in smaller places and help combat museum visitors’ disinterest in art.